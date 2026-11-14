import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  HotelInfo,
  Room,
  Review,
  GalleryItem,
  DiningInfo,
  DiningSpecial,
  PhysicalRoom,
  BookingData,
  RoomChange,
  Expense,
  ServiceRequest,
  RedeemableBenefit,
} from '../types/hotel';
import {
  syncAllToOfflineSqlite,
  loadAllFromOfflineSqlite,
  flushPendingSyncToCloud,
  queueOfflineAction,
  getPendingSyncCount,
} from '../utils/offlineSqlite';

export interface HotelDataContextType {
  hotelInfo: HotelInfo;
  rooms: Room[];
  physicalRooms: PhysicalRoom[];
  bookings: BookingData[];
  roomChanges: RoomChange[];
  expenses: Expense[];
  serviceRequests: ServiceRequest[];
  dining: DiningInfo;
  gallery: GalleryItem[];
  reviews: Review[];
  benefits: RedeemableBenefit[];
  isLoading: boolean;
  error: string | null;

  // Realtime Sync Status
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  pendingCount: number;
  lastSyncedAt: Date | null;
  flushSync: () => Promise<number>;

  // Hotel Info CRUD
  updateHotelInfo: (updates: Partial<HotelInfo>) => Promise<HotelInfo>;

  // Rooms Categories CRUD
  createRoom: (room: Room) => Promise<Room>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<Room>;
  deleteRoom: (id: string) => Promise<boolean>;

  // Physical Rooms & Inventory
  addPhysicalRoom: (room: PhysicalRoom) => Promise<PhysicalRoom>;
  updatePhysicalRoom: (roomNumber: string, updates: Partial<PhysicalRoom>) => Promise<PhysicalRoom>;
  deletePhysicalRoom: (roomNumber: string) => Promise<boolean>;

  // Bookings & Advance Reservations
  createBooking: (data: Partial<BookingData>) => Promise<BookingData>;
  updateBookingStatus: (reference: string, status: string) => Promise<BookingData | null>;

  // Room Change / Transfer
  changeGuestRoom: (params: {
    bookingReference: string;
    fromRoomNumber: string;
    toRoomNumber: string;
    reason: string;
    changedBy: string;
  }) => Promise<{ booking: BookingData; roomChange: RoomChange }>;

  // Operational Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<boolean>;

  // Service Requests
  addServiceRequest: (request: Omit<ServiceRequest, 'id' | 'requestedAt'>) => Promise<ServiceRequest>;
  updateServiceRequestStatus: (
    id: string,
    status: 'pending' | 'in_progress' | 'completed',
    notes?: string
  ) => Promise<ServiceRequest | null>;
  deleteServiceRequest: (id: string) => Promise<boolean>;

  // Dining CRUD
  updateDining: (updates: Partial<DiningInfo>) => Promise<DiningInfo>;
  addDiningSpecial: (special: Omit<DiningSpecial, 'id'> & { id?: string }) => Promise<DiningSpecial>;
  updateDiningSpecial: (id: string, updates: Partial<DiningSpecial>) => Promise<DiningSpecial>;
  deleteDiningSpecial: (id: string) => Promise<boolean>;

  // Gallery CRUD
  addGalleryItem: (item: Omit<GalleryItem, 'id'> & { id?: string }) => Promise<GalleryItem>;
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>) => Promise<GalleryItem>;
  deleteGalleryItem: (id: string) => Promise<boolean>;

  // Reviews CRUD
  addReview: (review: Omit<Review, 'id'> & { id?: string }) => Promise<Review>;
  updateReview: (id: string, updates: Partial<Review>) => Promise<Review>;
  deleteReview: (id: string) => Promise<boolean>;

  refreshAll: () => Promise<void>;
}

const emptyHotelInfo: HotelInfo = {
  name: 'Yashdeep Palace',
  subtitle: 'Luxury Hotel & Fine Dining',
  address: 'Opposite Honda Car Gate No. 4, RA 403, Karuli Industrial Area, Khuskheda, Tapukrah, Rajasthan 301707, India',
  phone: '+91 82220 20699',
  phoneAlt: '+91 82220 20599',
  email: 'reception@yashdeeppalace.com',
  checkInTime: '1:00 PM',
  checkOutTime: '11:00 AM',
  rating: 4.8,
  totalReviews: 342,
  coordinates: {
    lat: 28.0931,
    lng: 76.8452,
  },
  highlights: [
    'Directly Opposite Honda Car Gate 4',
    'High-Speed Fibre Wi-Fi',
    'The Royal Feast Multi-Cuisine Dining',
    '24/7 Front Desk & Concierge',
    'Free & Secured Parking',
  ],
};

const emptyDining: DiningInfo = {
  restaurantName: 'The Royal Feast',
  cuisine: 'North Indian, Mughlai, Chinese & Continental',
  timings: {
    breakfast: '7:00 AM - 10:30 AM',
    lunch: '12:30 PM - 3:30 PM',
    dinner: '7:30 PM - 11:00 PM',
  },
  description: 'Authentic culinary experience blending Rajasthani heritage with modern global gastronomy.',
  specials: [],
};

const HotelDataContext = createContext<HotelDataContextType | undefined>(undefined);

export const HotelDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>(emptyHotelInfo);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [physicalRooms, setPhysicalRooms] = useState<PhysicalRoom[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [roomChanges, setRoomChanges] = useState<RoomChange[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [dining, setDining] = useState<DiningInfo>(emptyDining);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [benefits, setBenefits] = useState<RedeemableBenefit[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connection & Sync States
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Asynchronous SQLite & IndexedDB persistence helper (Zero localStorage)
  const persistToSqlite = useCallback((payload: Parameters<typeof syncAllToOfflineSqlite>[0]) => {
    syncAllToOfflineSqlite(payload).catch((err) =>
      console.warn('[HotelData] SQLite persistence notice:', err)
    );
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        infoRes,
        roomsRes,
        physRes,
        bookingsRes,
        diningRes,
        galleryRes,
        reviewsRes,
        expensesRes,
        serviceReqRes,
        changesRes,
        benefitsRes,
      ] = await Promise.allSettled([
        fetch('/api/hotel-info').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/rooms').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/physical-rooms').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/bookings').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/dining').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/gallery').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/reviews').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/expenses').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/service-requests').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/room-changes').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/rewards/benefits').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (infoRes.status === 'fulfilled' && infoRes.value) {
        setHotelInfo(infoRes.value);
      }
      if (roomsRes.status === 'fulfilled' && Array.isArray(roomsRes.value) && roomsRes.value.length > 0) {
        setRooms(roomsRes.value);
      }
      if (physRes.status === 'fulfilled' && Array.isArray(physRes.value)) {
        setPhysicalRooms(physRes.value);
      }
      if (bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value)) {
        setBookings(bookingsRes.value);
      }
      if (diningRes.status === 'fulfilled' && diningRes.value) {
        setDining(diningRes.value);
      }
      if (galleryRes.status === 'fulfilled' && Array.isArray(galleryRes.value) && galleryRes.value.length > 0) {
        setGallery(galleryRes.value);
      }
      if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value) && reviewsRes.value.length > 0) {
        setReviews(reviewsRes.value);
      }
      if (expensesRes.status === 'fulfilled' && Array.isArray(expensesRes.value)) {
        setExpenses(expensesRes.value);
      }
      if (serviceReqRes.status === 'fulfilled' && Array.isArray(serviceReqRes.value)) {
        setServiceRequests(serviceReqRes.value);
      }
      if (changesRes.status === 'fulfilled' && Array.isArray(changesRes.value)) {
        setRoomChanges(changesRes.value);
      }
      if (benefitsRes.status === 'fulfilled' && Array.isArray(benefitsRes.value)) {
        setBenefits(benefitsRes.value);
      }

      // Synchronize full online payload to client SQLite database
      persistToSqlite({
        hotelInfo: infoRes.status === 'fulfilled' ? infoRes.value : undefined,
        rooms: roomsRes.status === 'fulfilled' && Array.isArray(roomsRes.value) ? roomsRes.value : undefined,
        physicalRooms: physRes.status === 'fulfilled' && Array.isArray(physRes.value) ? physRes.value : undefined,
        bookings: bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value) ? bookingsRes.value : undefined,
        dining: diningRes.status === 'fulfilled' ? diningRes.value : undefined,
        gallery: galleryRes.status === 'fulfilled' && Array.isArray(galleryRes.value) ? galleryRes.value : undefined,
        reviews: reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value) ? reviewsRes.value : undefined,
        expenses: expensesRes.status === 'fulfilled' && Array.isArray(expensesRes.value) ? expensesRes.value : undefined,
        serviceRequests: serviceReqRes.status === 'fulfilled' && Array.isArray(serviceReqRes.value) ? serviceReqRes.value : undefined,
        roomChanges: changesRes.status === 'fulfilled' && Array.isArray(changesRes.value) ? changesRes.value : undefined,
        benefits: benefitsRes.status === 'fulfilled' && Array.isArray(benefitsRes.value) ? benefitsRes.value : undefined,
      });

      setIsOnline(true);
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.warn('[HotelData] Network issue fetching live data, keeping cached data:', err);
      setError('Using cached offline data');
      setIsOnline(false);
      setSyncStatus('offline');
    } finally {
      setIsLoading(false);
    }
  }, [persistToSqlite]);

  const flushSync = useCallback(async (): Promise<number> => {
    try {
      setSyncStatus('syncing');
      const syncedCount = await flushPendingSyncToCloud();
      const remaining = await getPendingSyncCount();
      setPendingCount(remaining);
      if (remaining === 0) {
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      } else {
        setSyncStatus('offline');
      }
      if (syncedCount > 0) {
        await refreshAll();
      }
      return syncedCount;
    } catch (err) {
      console.warn('[HotelData] Manual flush sync error:', err);
      setSyncStatus('error');
      return 0;
    }
  }, [refreshAll]);

  // Periodic heartbeat and offline detection
  useEffect(() => {
    let isMounted = true;

    // 1. Instantly hydrate state from client SQLite WebAssembly database
    loadAllFromOfflineSqlite()
      .then((offline) => {
        if (!isMounted) return;
        if (offline.hotelInfo) setHotelInfo(offline.hotelInfo);
        if (offline.rooms && offline.rooms.length > 0) setRooms(offline.rooms);
        if (offline.physicalRooms && offline.physicalRooms.length > 0) setPhysicalRooms(offline.physicalRooms);
        if (offline.bookings && offline.bookings.length > 0) setBookings(offline.bookings);
        if (offline.roomChanges && offline.roomChanges.length > 0) setRoomChanges(offline.roomChanges);
        if (offline.expenses && offline.expenses.length > 0) setExpenses(offline.expenses);
        if (offline.serviceRequests && offline.serviceRequests.length > 0) setServiceRequests(offline.serviceRequests);
        if (offline.dining) setDining(offline.dining);
        if (offline.gallery && offline.gallery.length > 0) setGallery(offline.gallery);
        if (offline.reviews && offline.reviews.length > 0) setReviews(offline.reviews);
        if (offline.benefits && offline.benefits.length > 0) setBenefits(offline.benefits);
      })
      .catch((err) => console.warn('[HotelData] Initial SQLite hydration notice:', err));

    getPendingSyncCount()
      .then((count) => {
        if (isMounted) setPendingCount(count);
      })
      .catch(() => {});

    // 2. Fetch fresh server data
    refreshAll();

    // 3. Online sync listeners
    const handleOnline = () => {
      console.log('[HotelData] Online reconnected. Flushing offline SQLite changes...');
      setIsOnline(true);
      flushSync().catch((e) => console.warn('[HotelData] Online flush failed:', e));
    };

    const handleOffline = () => {
      console.log('[HotelData] Device switched offline.');
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Heartbeat interval every 30 seconds
    const interval = setInterval(async () => {
      try {
        const pingRes = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
        if (pingRes.ok) {
          setIsOnline(true);
          const currentPending = await getPendingSyncCount();
          setPendingCount(currentPending);
          if (currentPending > 0) {
            await flushSync();
          }
        } else {
          setIsOnline(false);
          setSyncStatus('offline');
        }
      } catch {
        setIsOnline(false);
        setSyncStatus('offline');
      }
    }, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [refreshAll, flushSync]);

  // ================= HOTEL INFO CRUD =================
  const updateHotelInfo = async (updates: Partial<HotelInfo>): Promise<HotelInfo> => {
    const updated = { ...hotelInfo, ...updates };
    setHotelInfo(updated);
    persistToSqlite({ hotelInfo: updated });

    try {
      const res = await fetch('/api/hotel-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.hotelInfo) {
        setHotelInfo(data.hotelInfo);
        persistToSqlite({ hotelInfo: data.hotelInfo });
        setSyncStatus('synced');
        return data.hotelInfo;
      }
    } catch (e) {
      console.warn('[HotelData] Server sync failed for hotel info, queueing offline:', e);
      await queueOfflineAction('UPDATE_HOTEL_INFO', updates);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }
    return updated;
  };

  // ================= ROOMS CRUD =================
  const createRoom = async (room: Room): Promise<Room> => {
    const updated = [...rooms, room];
    setRooms(updated);
    persistToSqlite({ rooms: updated });

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      });
      const data = await res.json();
      if (data.room) {
        setSyncStatus('synced');
        return data.room;
      }
    } catch (e) {
      console.warn('[HotelData] Server sync failed for create room, queueing offline:', e);
      await queueOfflineAction('CREATE_ROOM', room);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }
    return room;
  };

  const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room> => {
    let updatedRoom: Room | undefined;
    const updated = rooms.map((r) => {
      if (r.id === id) {
        updatedRoom = { ...r, ...updates };
        return updatedRoom;
      }
      return r;
    });

    if (updatedRoom) {
      setRooms(updated);
      persistToSqlite({ rooms: updated });

      try {
        const res = await fetch(`/api/rooms/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (data.room) {
          setSyncStatus('synced');
          return data.room;
        }
      } catch (e) {
        console.warn('[HotelData] Server sync failed for update room, queueing offline:', e);
        await queueOfflineAction('UPDATE_ROOM_CATEGORY', { id, ...updates });
        setPendingCount((c) => c + 1);
        setSyncStatus('offline');
      }
      return updatedRoom;
    }
    throw new Error(`Room with ID ${id} not found`);
  };

  const deleteRoom = async (id: string): Promise<boolean> => {
    const updated = rooms.filter((r) => r.id !== id);
    setRooms(updated);
    persistToSqlite({ rooms: updated });

    try {
      await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      setSyncStatus('synced');
      return true;
    } catch (e) {
      console.warn('[HotelData] Server sync failed for delete room, queueing offline:', e);
      await queueOfflineAction('DELETE_ROOM_CATEGORY', { id });
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
      return true;
    }
  };

  // ================= PHYSICAL ROOMS CRUD =================
  const addPhysicalRoom = async (room: PhysicalRoom): Promise<PhysicalRoom> => {
    const updated = [...physicalRooms, room];
    setPhysicalRooms(updated);
    persistToSqlite({ physicalRooms: updated });

    try {
      const res = await fetch('/api/physical-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      });
      const data = await res.json();
      if (data.room) {
        setSyncStatus('synced');
        return data.room;
      }
    } catch (e) {
      console.warn('[HotelData] Server sync failed for physical room, queueing offline:', e);
      await queueOfflineAction('CREATE_PHYSICAL_ROOM', room);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }
    return room;
  };

  const updatePhysicalRoom = async (roomNumber: string, updates: Partial<PhysicalRoom>): Promise<PhysicalRoom> => {
    let updatedRoom: PhysicalRoom | undefined;
    const updated = physicalRooms.map((r) => {
      if (r.roomNumber === roomNumber) {
        updatedRoom = { ...r, ...updates };
        return updatedRoom;
      }
      return r;
    });

    if (updatedRoom) {
      setPhysicalRooms(updated);
      persistToSqlite({ physicalRooms: updated });

      try {
        const res = await fetch(`/api/physical-rooms/${roomNumber}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (data.room) {
          setSyncStatus('synced');
          return data.room;
        }
      } catch (e) {
        console.warn('[HotelData] Server sync failed for physical room update, queueing offline:', e);
        await queueOfflineAction('UPDATE_PHYSICAL_ROOM', { roomNumber, ...updates });
        setPendingCount((c) => c + 1);
        setSyncStatus('offline');
      }
      return updatedRoom;
    }
    throw new Error(`Physical room ${roomNumber} not found`);
  };

  const deletePhysicalRoom = async (roomNumber: string): Promise<boolean> => {
    const updated = physicalRooms.filter((r) => r.roomNumber !== roomNumber);
    setPhysicalRooms(updated);
    persistToSqlite({ physicalRooms: updated });

    try {
      await fetch(`/api/physical-rooms/${roomNumber}`, { method: 'DELETE' });
      setSyncStatus('synced');
      return true;
    } catch (e) {
      console.warn('[HotelData] Server sync failed for physical room delete, queueing offline:', e);
      await queueOfflineAction('DELETE_PHYSICAL_ROOM', { roomNumber });
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
      return true;
    }
  };

  // ================= BOOKINGS & ADVANCE RESERVATIONS =================
  const createBooking = async (data: Partial<BookingData>): Promise<BookingData> => {
    const bookingPayload: BookingData = {
      id: data.id || `bk-${Date.now()}`,
      bookingReference: data.bookingReference || `YDP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      roomId: data.roomId || (rooms[0]?.id || 'deluxe-room'),
      roomName: data.roomName || (rooms[0]?.name || 'Deluxe Room'),
      checkIn: data.checkIn || new Date().toISOString().split('T')[0],
      checkOut: data.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      nights: Number(data.nights || 1),
      adultCount: Number(data.adultCount || 2),
      childCount: Number(data.childCount || 0),
      guestName: data.guestName || '',
      guestEmail: data.guestEmail || '',
      guestPhone: data.guestPhone || '',
      gstNumber: data.gstNumber,
      specialRequests: data.specialRequests,
      addOns: data.addOns || {
        breakfast: false,
        airportTransfer: false,
        earlyCheckIn: false,
      },
      roomRateTotal: Number(data.roomRateTotal || (rooms[0]?.price || 2200)),
      addOnsTotal: Number(data.addOnsTotal || 0),
      taxAmount: Number(data.taxAmount || 300),
      grandTotal: Number(data.grandTotal || 2500),
      paymentMethod: data.paymentMethod || 'pay_at_hotel',
      paymentStatus: data.paymentStatus || 'pending',
      stayStatus: data.stayStatus || 'confirmed',
      assignedRoomNumber: data.assignedRoomNumber,
      idProofType: data.idProofType,
      idProofNumber: data.idProofNumber,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });
      const resData = await res.json();
      if (resData.booking) {
        const newBookings = [resData.booking, ...bookings];
        setBookings(newBookings);
        persistToSqlite({ bookings: newBookings });
        setSyncStatus('synced');
        return resData.booking;
      }
    } catch (e) {
      console.warn('[HotelData] Server booking creation failed, queueing offline:', e);
      await queueOfflineAction('CREATE_BOOKING', bookingPayload);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }

    const newBookings = [bookingPayload, ...bookings];
    setBookings(newBookings);
    persistToSqlite({ bookings: newBookings });
    return bookingPayload;
  };

  const updateBookingStatus = async (reference: string, status: string): Promise<BookingData | null> => {
    let updatedBooking: BookingData | null = null;
    const updated = bookings.map((b) => {
      if (b.bookingReference === reference) {
        updatedBooking = { ...b, stayStatus: status as any };
        return updatedBooking;
      }
      return b;
    });

    if (updatedBooking) {
      setBookings(updated);
      persistToSqlite({ bookings: updated });
      try {
        await fetch(`/api/bookings/${reference}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        setSyncStatus('synced');
      } catch (e) {
        console.warn('[HotelData] Server sync failed for booking status, queueing offline:', e);
        await queueOfflineAction('UPDATE_BOOKING_STATUS', { reference, status });
        setPendingCount((c) => c + 1);
        setSyncStatus('offline');
      }
      return updatedBooking;
    }
    return null;
  };

  // ================= ROOM CHANGE / TRANSFER =================
  const changeGuestRoom = async (params: {
    bookingReference: string;
    fromRoomNumber: string;
    toRoomNumber: string;
    reason: string;
    changedBy: string;
  }): Promise<{ booking: BookingData; roomChange: RoomChange }> => {
    try {
      const res = await fetch(`/api/bookings/${params.bookingReference}/room-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute room change');
      }
      await refreshAll();
      return data;
    } catch (err: any) {
      console.warn('[HotelData] Room change failed online, queueing offline:', err);
      await queueOfflineAction('ROOM_CHANGE', params);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');

      // Optimistic offline update
      const newChange: RoomChange = {
        id: `rc-${Date.now()}`,
        bookingReference: params.bookingReference,
        fromRoomNumber: params.fromRoomNumber,
        toRoomNumber: params.toRoomNumber,
        reason: params.reason,
        changedBy: params.changedBy,
        changedAt: new Date().toISOString(),
      };
      setRoomChanges((prev) => [newChange, ...prev]);

      const updatedBookings = bookings.map((b) =>
        b.bookingReference === params.bookingReference
          ? { ...b, assignedRoomNumber: params.toRoomNumber }
          : b
      );
      setBookings(updatedBookings);

      const updatedPhys = physicalRooms.map((r) => {
        if (r.roomNumber === params.fromRoomNumber) {
          return { ...r, occupancyStatus: 'vacant' as const, housekeepingStatus: 'dirty' as const, currentBookingReference: undefined };
        }
        if (r.roomNumber === params.toRoomNumber) {
          return { ...r, occupancyStatus: 'occupied' as const, currentBookingReference: params.bookingReference };
        }
        return r;
      });
      setPhysicalRooms(updatedPhys);
      persistToSqlite({ bookings: updatedBookings, physicalRooms: updatedPhys, roomChanges: [newChange, ...roomChanges] });

      const changedBooking = updatedBookings.find((b) => b.bookingReference === params.bookingReference)!;
      return { booking: changedBooking, roomChange: newChange };
    }
  };

  // ================= EXPENSES CRUD =================
  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    const optimisticExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      const data = await res.json();
      if (data.expense) {
        const updated = [data.expense, ...expenses];
        setExpenses(updated);
        persistToSqlite({ expenses: updated });
        setSyncStatus('synced');
        return data.expense;
      }
    } catch (e) {
      console.warn('[HotelData] Expense online save failed, queueing offline:', e);
      await queueOfflineAction('CREATE_EXPENSE', optimisticExpense);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }

    const updated = [optimisticExpense, ...expenses];
    setExpenses(updated);
    persistToSqlite({ expenses: updated });
    return optimisticExpense;
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    persistToSqlite({ expenses: updated });

    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      setSyncStatus('synced');
      return true;
    } catch (e) {
      console.warn('[HotelData] Server sync failed for expense delete, queueing offline:', e);
      await queueOfflineAction('DELETE_EXPENSE', { id });
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
      return true;
    }
  };

  // ================= SERVICE REQUESTS CRUD =================
  const addServiceRequest = async (request: Omit<ServiceRequest, 'id' | 'requestedAt'>): Promise<ServiceRequest> => {
    const optimisticReq: ServiceRequest = {
      ...request,
      id: `sr-${Date.now()}`,
      requestedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const data = await res.json();
      if (data.request) {
        const updated = [data.request, ...serviceRequests];
        setServiceRequests(updated);
        persistToSqlite({ serviceRequests: updated });
        setSyncStatus('synced');
        return data.request;
      }
    } catch (e) {
      console.warn('[HotelData] Service request online failed, queueing offline:', e);
      await queueOfflineAction('CREATE_SERVICE_REQUEST', optimisticReq);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }

    const updated = [optimisticReq, ...serviceRequests];
    setServiceRequests(updated);
    persistToSqlite({ serviceRequests: updated });
    return optimisticReq;
  };

  const updateServiceRequestStatus = async (
    id: string,
    status: 'pending' | 'in_progress' | 'completed',
    notes?: string
  ): Promise<ServiceRequest | null> => {
    try {
      const res = await fetch(`/api/service-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      const data = await res.json();
      if (data.request) {
        const updated = serviceRequests.map((r) => (r.id === id ? data.request : r));
        setServiceRequests(updated);
        persistToSqlite({ serviceRequests: updated });
        setSyncStatus('synced');
        return data.request;
      }
    } catch (e) {
      console.warn('[HotelData] Update service request status failed online, queueing offline:', e);
      await queueOfflineAction('UPDATE_SERVICE_REQUEST', { id, status, notes });
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }

    const updated = serviceRequests.map((r) =>
      r.id === id ? { ...r, status, notes: notes || r.notes } : r
    );
    setServiceRequests(updated);
    persistToSqlite({ serviceRequests: updated });
    return updated.find((r) => r.id === id) || null;
  };

  const deleteServiceRequest = async (id: string): Promise<boolean> => {
    const updated = serviceRequests.filter((r) => r.id !== id);
    setServiceRequests(updated);
    persistToSqlite({ serviceRequests: updated });

    try {
      await fetch(`/api/service-requests/${id}`, { method: 'DELETE' });
      setSyncStatus('synced');
      return true;
    } catch (e) {
      console.warn('[HotelData] Server sync failed for service request delete, queueing offline:', e);
      await queueOfflineAction('DELETE_SERVICE_REQUEST', { id });
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
      return true;
    }
  };

  // ================= DINING CRUD =================
  const updateDining = async (updates: Partial<DiningInfo>): Promise<DiningInfo> => {
    const updated = {
      ...dining,
      ...updates,
      timings: updates.timings ? { ...dining.timings, ...updates.timings } : dining.timings,
    };
    setDining(updated);
    persistToSqlite({ dining: updated });

    try {
      const res = await fetch('/api/dining', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.dining) {
        setSyncStatus('synced');
        return data.dining;
      }
    } catch (e) {
      console.warn('[HotelData] Server sync failed for dining, queueing offline:', e);
      await queueOfflineAction('UPDATE_DINING', updates);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }
    return updated;
  };

  const addDiningSpecial = async (
    special: Omit<DiningSpecial, 'id'> & { id?: string }
  ): Promise<DiningSpecial> => {
    const newSpecial: DiningSpecial = {
      id: special.id || `dish-${Date.now()}`,
      name: special.name,
      price: special.price,
      category: special.category,
    };
    const updated = { ...dining, specials: [...dining.specials, newSpecial] };
    setDining(updated);
    persistToSqlite({ dining: updated });

    try {
      const res = await fetch('/api/dining/specials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpecial),
      });
      const data = await res.json();
      if (data.special) {
        setSyncStatus('synced');
        return data.special;
      }
    } catch (e) {
      console.warn('[HotelData] Server sync failed for dining special, queueing offline:', e);
      await queueOfflineAction('ADD_DINING_SPECIAL', newSpecial);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }
    return newSpecial;
  };

  const updateDiningSpecial = async (
    id: string,
    updates: Partial<DiningSpecial>
  ): Promise<DiningSpecial> => {
    let updatedSpecial: DiningSpecial | undefined;
    const specials = dining.specials.map((s) => {
      if (s.id === id) {
        updatedSpecial = { ...s, ...updates };
        return updatedSpecial;
      }
      return s;
    });

    if (updatedSpecial) {
      const updated = { ...dining, specials };
      setDining(updated);
      persistToSqlite({ dining: updated });

      try {
        const res = await fetch(`/api/dining/specials/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (data.special) {
          setSyncStatus('synced');
          return data.special;
        }
      } catch (e) {
        console.warn('[HotelData] Server sync failed for update special, queueing offline:', e);
        await queueOfflineAction('UPDATE_DINING_SPECIAL', { id, ...updates });
        setPendingCount((c) => c + 1);
        setSyncStatus('offline');
      }
      return updatedSpecial;
    }
    throw new Error(`Special with ID ${id} not found`);
  };

  const deleteDiningSpecial = async (id: string): Promise<boolean> => {
    const specials = dining.specials.filter((s) => s.id !== id);
    const updated = { ...dining, specials };
    setDining(updated);
    persistToSqlite({ dining: updated });

    try {
      await fetch(`/api/dining/specials/${id}`, { method: 'DELETE' });
      setSyncStatus('synced');
      return true;
    } catch (e) {
      console.warn('[HotelData] Server sync failed for delete special, queueing offline:', e);
      await queueOfflineAction('DELETE_DINING_SPECIAL', { id });
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
      return true;
    }
  };

  // ================= GALLERY CRUD =================
  const addGalleryItem = async (
    item: Omit<GalleryItem, 'id'> & { id?: string }
  ): Promise<GalleryItem> => {
    const newItem: GalleryItem = {
      id: item.id || `gal-${Date.now()}`,
      title: item.title,
      tag: item.tag.startsWith('#') ? item.tag : `#${item.tag}`,
      imageUrl: item.imageUrl,
      likes: typeof item.likes === 'number' ? item.likes : 0,
      handle: item.handle || '@yashdeeppalace',
    };
    const updated = [newItem, ...gallery];
    setGallery(updated);
    persistToSqlite({ gallery: updated });

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (data.item) {
        setSyncStatus('synced');
        return data.item;
      }
    } catch (e) {
      console.warn('[HotelData] Server sync failed for gallery, queueing offline:', e);
      await queueOfflineAction('ADD_GALLERY_ITEM', newItem);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }
    return newItem;
  };

  const updateGalleryItem = async (
    id: string,
    updates: Partial<GalleryItem>
  ): Promise<GalleryItem> => {
    let updatedItem: GalleryItem | undefined;
    const updated = gallery.map((g) => {
      if (g.id === id) {
        updatedItem = { ...g, ...updates };
        return updatedItem;
      }
      return g;
    });

    if (updatedItem) {
      setGallery(updated);
      persistToSqlite({ gallery: updated });

      try {
        const res = await fetch(`/api/gallery/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (data.item) {
          setSyncStatus('synced');
          return data.item;
        }
      } catch (e) {
        console.warn('[HotelData] Server sync failed for update gallery, queueing offline:', e);
        await queueOfflineAction('UPDATE_GALLERY_ITEM', { id, ...updates });
        setPendingCount((c) => c + 1);
        setSyncStatus('offline');
      }
      return updatedItem;
    }
    throw new Error(`Gallery item with ID ${id} not found`);
  };

  const deleteGalleryItem = async (id: string): Promise<boolean> => {
    const updated = gallery.filter((g) => g.id !== id);
    setGallery(updated);
    persistToSqlite({ gallery: updated });

    try {
      await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      setSyncStatus('synced');
      return true;
    } catch (e) {
      console.warn('[HotelData] Server sync failed for delete gallery, queueing offline:', e);
      await queueOfflineAction('DELETE_GALLERY_ITEM', { id });
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
      return true;
    }
  };

  // ================= REVIEWS CRUD =================
  const addReview = async (
    review: Omit<Review, 'id'> & { id?: string }
  ): Promise<Review> => {
    const newRev: Review = {
      id: review.id || `rev-${Date.now()}`,
      author: review.author,
      city: review.city,
      rating: Number(review.rating) || 5,
      stayType: review.stayType || 'Business',
      comment: review.comment,
      date: review.date || `Stayed ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      verified: review.verified ?? true,
    };
    const updated = [newRev, ...reviews];
    setReviews(updated);
    persistToSqlite({ reviews: updated });

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRev),
      });
      const data = await res.json();
      if (data.review) {
        setSyncStatus('synced');
        return data.review;
      }
    } catch (e) {
      console.warn('[HotelData] Server sync failed for review, queueing offline:', e);
      await queueOfflineAction('ADD_REVIEW', newRev);
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
    }
    return newRev;
  };

  const updateReview = async (id: string, updates: Partial<Review>): Promise<Review> => {
    let updatedRev: Review | undefined;
    const updated = reviews.map((r) => {
      if (r.id === id) {
        updatedRev = { ...r, ...updates };
        return updatedRev;
      }
      return r;
    });

    if (updatedRev) {
      setReviews(updated);
      persistToSqlite({ reviews: updated });

      try {
        const res = await fetch(`/api/reviews/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (data.review) {
          setSyncStatus('synced');
          return data.review;
        }
      } catch (e) {
        console.warn('[HotelData] Server sync failed for update review, queueing offline:', e);
        await queueOfflineAction('UPDATE_REVIEW', { id, ...updates });
        setPendingCount((c) => c + 1);
        setSyncStatus('offline');
      }
      return updatedRev;
    }
    throw new Error(`Review with ID ${id} not found`);
  };

  const deleteReview = async (id: string): Promise<boolean> => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    persistToSqlite({ reviews: updated });

    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      setSyncStatus('synced');
      return true;
    } catch (e) {
      console.warn('[HotelData] Server sync failed for delete review, queueing offline:', e);
      await queueOfflineAction('DELETE_REVIEW', { id });
      setPendingCount((c) => c + 1);
      setSyncStatus('offline');
      return true;
    }
  };

  return (
    <HotelDataContext.Provider
      value={{
        hotelInfo,
        rooms,
        physicalRooms,
        bookings,
        roomChanges,
        expenses,
        serviceRequests,
        dining,
        gallery,
        reviews,
        benefits,
        isLoading,
        error,
        isOnline,
        syncStatus,
        pendingCount,
        lastSyncedAt,
        flushSync,
        updateHotelInfo,
        createRoom,
        updateRoom,
        deleteRoom,
        addPhysicalRoom,
        updatePhysicalRoom,
        deletePhysicalRoom,
        createBooking,
        updateBookingStatus,
        changeGuestRoom,
        addExpense,
        deleteExpense,
        addServiceRequest,
        updateServiceRequestStatus,
        deleteServiceRequest,
        updateDining,
        addDiningSpecial,
        updateDiningSpecial,
        deleteDiningSpecial,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        addReview,
        updateReview,
        deleteReview,
        refreshAll,
      }}
    >
      {children}
    </HotelDataContext.Provider>
  );
};

export const useHotelData = (): HotelDataContextType => {
  const context = useContext(HotelDataContext);
  if (!context) {
    throw new Error('useHotelData must be used within a HotelDataProvider');
  }
  return context;
};
