import { db } from './index.ts';
import { rooms, bookings, users, newsletterSubscribers, managerUsers, physicalRooms, guestFolios, banquetEvents } from './schema.ts';
import { eq, desc, asc } from 'drizzle-orm';

export async function getRoomsFromDb() {
  try {
    const records = await db.select().from(rooms);
    return records.map((r) => ({
      ...r,
      amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities) : r.amenities,
      rating: parseFloat(r.rating || '4.8'),
      gallery: [r.image],
    }));
  } catch (error) {
    console.error('Failed to query rooms from SQL:', error);
    throw new Error('Database query failed for rooms', { cause: error });
  }
}

export async function upsertRoomInDb(roomData: any) {
  try {
    const amenitiesJson = Array.isArray(roomData.amenities)
      ? JSON.stringify(roomData.amenities)
      : typeof roomData.amenities === 'string'
      ? roomData.amenities
      : '[]';

    return await db
      .insert(rooms)
      .values({
        id: roomData.id,
        name: roomData.name,
        tagline: roomData.tagline || '',
        category: roomData.category || 'deluxe',
        price: Number(roomData.price),
        originalPrice: Number(roomData.originalPrice || roomData.price),
        sizeSqFt: Number(roomData.sizeSqFt || 350),
        bedType: roomData.bedType || '1 King Bed',
        maxOccupancy: Number(roomData.maxOccupancy || 2),
        amenities: amenitiesJson,
        description: roomData.description || '',
        image: roomData.image || '',
        availableUnits: Number(roomData.availableUnits || 5),
        isAvailable: roomData.isAvailable ?? true,
        rating: String(roomData.rating || '4.8'),
        reviewsCount: Number(roomData.reviewsCount || 100),
      })
      .onConflictDoUpdate({
        target: rooms.id,
        set: {
          name: roomData.name,
          tagline: roomData.tagline,
          price: Number(roomData.price),
          originalPrice: Number(roomData.originalPrice),
          description: roomData.description,
          image: roomData.image,
          isAvailable: roomData.isAvailable ?? true,
          availableUnits: Number(roomData.availableUnits),
        },
      })
      .returning();
  } catch (error) {
    console.error('Failed to upsert room in SQL:', error);
    throw new Error('Failed to update room in database', { cause: error });
  }
}

export async function deleteRoomFromDb(id: string) {
  try {
    return await db.delete(rooms).where(eq(rooms.id, id)).returning();
  } catch (error) {
    console.error('Failed to delete room from SQL:', error);
    throw new Error('Failed to delete room from database', { cause: error });
  }
}

export async function createBookingInDb(bookingData: any) {
  try {
    const [result] = await db
      .insert(bookings)
      .values({
        bookingReference: bookingData.bookingReference,
        roomId: bookingData.roomId,
        roomName: bookingData.roomName,
        assignedRoomNumber: bookingData.assignedRoomNumber || null,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        nights: Number(bookingData.nights),
        adultCount: Number(bookingData.adultCount),
        childCount: Number(bookingData.childCount || 0),
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        gstNumber: bookingData.gstNumber || null,
        specialRequests: bookingData.specialRequests || null,
        roomRateTotal: Number(bookingData.roomRateTotal),
        addOnsTotal: Number(bookingData.addOnsTotal || 0),
        taxAmount: Number(bookingData.taxAmount || 0),
        grandTotal: Number(bookingData.grandTotal),
        paymentMethod: bookingData.paymentMethod || 'upi',
        paymentStatus: bookingData.paymentStatus || 'paid',
        stayStatus: bookingData.stayStatus || 'confirmed',
        appliedRewardBenefit: bookingData.appliedRewardBenefit || null,
        transactionId: bookingData.paymentDetails?.transactionId || `TXN${Date.now()}`,
      })
      .returning();

    // Create initial folio entry
    await db.insert(guestFolios).values({
      bookingReference: result.bookingReference,
      itemType: 'room_charge',
      description: `${result.roomName} (${result.nights} Nights)`,
      amount: result.roomRateTotal + (result.taxAmount || 0),
      recordedBy: 'Reservation Engine',
    });

    if (result.addOnsTotal && result.addOnsTotal > 0) {
      await db.insert(guestFolios).values({
        bookingReference: result.bookingReference,
        itemType: 'extra_bed',
        description: 'Hospitality Add-ons & Amenities',
        amount: result.addOnsTotal,
        recordedBy: 'Reservation Engine',
      });
    }

    if (result.paymentStatus === 'paid') {
      await db.insert(guestFolios).values({
        bookingReference: result.bookingReference,
        itemType: 'payment_received',
        description: `Payment Received via ${(result.paymentMethod || 'Online').toUpperCase()}`,
        amount: -result.grandTotal, // negative credit
        recordedBy: 'Payment Gateway',
      });
    }

    return result;
  } catch (error) {
    console.error('Failed to insert booking in SQL:', error);
    throw new Error('Failed to store reservation in database', { cause: error });
  }
}

export async function getBookingsFromDb() {
  try {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  } catch (error) {
    console.error('Failed to query bookings from SQL:', error);
    throw new Error('Database query failed for bookings', { cause: error });
  }
}

export async function updateBookingStatusInDb(reference: string, status: string) {
  try {
    return await db
      .update(bookings)
      .set({ paymentStatus: status })
      .where(eq(bookings.bookingReference, reference))
      .returning();
  } catch (error) {
    console.error('Failed to update booking status in SQL:', error);
    throw new Error('Failed to update booking status in database', { cause: error });
  }
}

// ----------------- HMS MANAGEMENT QUERIES -----------------

export async function getManagerUserByEmail(email: string) {
  try {
    const [manager] = await db
      .select()
      .from(managerUsers)
      .where(eq(managerUsers.email, email.trim().toLowerCase()));
    return manager;
  } catch (error) {
    console.error('Failed to get manager user:', error);
    throw new Error('Failed to verify manager credentials', { cause: error });
  }
}

export async function getPhysicalRoomsFromDb() {
  try {
    return await db.select().from(physicalRooms).orderBy(asc(physicalRooms.floor), asc(physicalRooms.roomNumber));
  } catch (error) {
    console.error('Failed to query physical rooms:', error);
    throw new Error('Failed to fetch physical rooms from database', { cause: error });
  }
}

export async function updatePhysicalRoomInDb(roomNumber: string, updates: any) {
  try {
    const [updated] = await db
      .update(physicalRooms)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(physicalRooms.roomNumber, roomNumber))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update physical room:', error);
    throw new Error('Failed to update physical room status', { cause: error });
  }
}

export async function checkInGuestInDb(params: {
  bookingReference: string;
  roomNumber: string;
  idProofType?: string;
  idProofNumber?: string;
}) {
  try {
    const [booking] = await db
      .update(bookings)
      .set({
        assignedRoomNumber: params.roomNumber,
        stayStatus: 'checked_in',
        checkInTimestamp: new Date(),
        idProofType: params.idProofType || 'Aadhaar Card',
        idProofNumber: params.idProofNumber || null,
      })
      .where(eq(bookings.bookingReference, params.bookingReference))
      .returning();

    // Mark physical room as occupied
    await db
      .update(physicalRooms)
      .set({
        occupancyStatus: 'occupied',
        currentBookingReference: params.bookingReference,
        updatedAt: new Date(),
      })
      .where(eq(physicalRooms.roomNumber, params.roomNumber));

    return booking;
  } catch (error) {
    console.error('Failed to check in guest in SQL:', error);
    throw new Error('Failed to execute guest check-in', { cause: error });
  }
}

export async function checkOutGuestInDb(params: {
  bookingReference: string;
  roomNumber: string;
}) {
  try {
    const [booking] = await db
      .update(bookings)
      .set({
        stayStatus: 'checked_out',
        checkOutTimestamp: new Date(),
      })
      .where(eq(bookings.bookingReference, params.bookingReference))
      .returning();

    // Set physical room to vacant and dirty (for housekeeping)
    await db
      .update(physicalRooms)
      .set({
        occupancyStatus: 'vacant',
        housekeepingStatus: 'dirty',
        currentBookingReference: null,
        updatedAt: new Date(),
      })
      .where(eq(physicalRooms.roomNumber, params.roomNumber));

    return booking;
  } catch (error) {
    console.error('Failed to check out guest in SQL:', error);
    throw new Error('Failed to execute guest checkout', { cause: error });
  }
}

export async function getGuestFoliosFromDb(bookingReference: string) {
  try {
    return await db
      .select()
      .from(guestFolios)
      .where(eq(guestFolios.bookingReference, bookingReference))
      .orderBy(asc(guestFolios.createdAt));
  } catch (error) {
    console.error('Failed to get guest folios:', error);
    throw new Error('Failed to query guest folios', { cause: error });
  }
}

export async function addGuestFolioItemInDb(data: {
  bookingReference: string;
  itemType: string;
  description: string;
  amount: number;
  recordedBy?: string;
}) {
  try {
    const [record] = await db
      .insert(guestFolios)
      .values({
        bookingReference: data.bookingReference,
        itemType: data.itemType,
        description: data.description,
        amount: Number(data.amount),
        recordedBy: data.recordedBy || 'Front Desk',
      })
      .returning();
    return record;
  } catch (error) {
    console.error('Failed to add guest folio item:', error);
    throw new Error('Failed to record folio entry in database', { cause: error });
  }
}

export async function getBanquetEventsFromDb() {
  try {
    return await db.select().from(banquetEvents).orderBy(desc(banquetEvents.createdAt));
  } catch (error) {
    console.error('Failed to get banquet events:', error);
    throw new Error('Failed to query banquet events', { cause: error });
  }
}

export async function createBanquetEventInDb(data: any) {
  try {
    const [event] = await db
      .insert(banquetEvents)
      .values({
        eventName: data.eventName,
        clientName: data.clientName,
        companyName: data.companyName || null,
        phone: data.phone,
        email: data.email,
        hallName: data.hallName,
        eventDate: data.eventDate,
        guestCount: Number(data.guestCount),
        cateringPackage: data.cateringPackage || null,
        totalAmount: Number(data.totalAmount),
        advancePaid: Number(data.advancePaid || 0),
        balanceDue: Number(data.totalAmount) - Number(data.advancePaid || 0),
        status: data.status || 'confirmed',
        specialRequests: data.specialRequests || null,
      })
      .returning();
    return event;
  } catch (error) {
    console.error('Failed to create banquet event in SQL:', error);
    throw new Error('Failed to create banquet event in database', { cause: error });
  }
}

export async function subscribeNewsletterInDb(email: string) {
  try {
    return await db
      .insert(newsletterSubscribers)
      .values({ email })
      .onConflictDoNothing()
      .returning();
  } catch (error) {
    console.error('Failed to save newsletter subscriber in SQL:', error);
    throw new Error('Failed to subscribe in database', { cause: error });
  }
}

export async function getOrCreateUserInDb(uid: string, email: string, name?: string, avatar?: string) {
  try {
    const [user] = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || '',
        avatar: avatar || '',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name: name || '',
          avatar: avatar || '',
        },
      })
      .returning();

    return user;
  } catch (error) {
    console.error('Failed to sync user in SQL:', error);
    throw new Error('Failed to synchronize user in database', { cause: error });
  }
}
