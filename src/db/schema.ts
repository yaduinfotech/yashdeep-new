import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  avatar: text('avatar'),
  tier: text('tier').default('Gold Royal'),
  points: integer('points').default(200),
  createdAt: timestamp('created_at').defaultNow(),
});

export const managerUsers = pgTable('manager_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('general_manager'),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tagline: text('tagline').notNull(),
  category: text('category').notNull(),
  price: integer('price').notNull(),
  originalPrice: integer('original_price').notNull(),
  sizeSqFt: integer('size_sq_ft').notNull(),
  bedType: text('bed_type').notNull(),
  maxOccupancy: integer('max_occupancy').notNull(),
  amenities: text('amenities').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  availableUnits: integer('available_units').default(5),
  isAvailable: boolean('is_available').default(true),
  rating: text('rating').default('4.8'),
  reviewsCount: integer('reviews_count').default(140),
  createdAt: timestamp('created_at').defaultNow(),
});

export const physicalRooms = pgTable('physical_rooms', {
  roomNumber: text('room_number').primaryKey(),
  roomTypeId: text('room_type_id').notNull(),
  floor: integer('floor').notNull(),
  housekeepingStatus: text('housekeeping_status').default('clean'), // 'clean', 'dirty', 'inspected', 'out_of_order'
  occupancyStatus: text('occupancy_status').default('vacant'), // 'vacant', 'occupied', 'reserved', 'blocked'
  currentBookingReference: text('current_booking_reference'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  bookingReference: text('booking_reference').notNull().unique(),
  roomId: text('room_id').notNull(),
  roomName: text('room_name').notNull(),
  assignedRoomNumber: text('assigned_room_number'),
  checkIn: text('check_in').notNull(),
  checkOut: text('check_out').notNull(),
  nights: integer('nights').notNull(),
  adultCount: integer('adult_count').notNull(),
  childCount: integer('child_count').default(0),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  guestPhone: text('guest_phone').notNull(),
  gstNumber: text('gst_number'),
  specialRequests: text('special_requests'),
  roomRateTotal: integer('room_rate_total').notNull(),
  addOnsTotal: integer('add_ons_total').default(0),
  taxAmount: integer('tax_amount').default(0),
  grandTotal: integer('grand_total').notNull(),
  paymentMethod: text('payment_method').default('upi'),
  paymentStatus: text('payment_status').default('paid'),
  stayStatus: text('stay_status').default('confirmed'), // 'confirmed', 'checked_in', 'checked_out', 'cancelled'
  appliedRewardBenefit: text('applied_reward_benefit'),
  transactionId: text('transaction_id'),
  idProofType: text('id_proof_type'),
  idProofNumber: text('id_proof_number'),
  checkInTimestamp: timestamp('check_in_timestamp'),
  checkOutTimestamp: timestamp('check_out_timestamp'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const guestFolios = pgTable('guest_folios', {
  id: serial('id').primaryKey(),
  bookingReference: text('booking_reference').notNull(),
  itemType: text('item_type').notNull(), // 'room_charge', 'restaurant', 'laundry', 'minibar', 'extra_bed', 'transport', 'payment_received', 'discount'
  description: text('description').notNull(),
  amount: integer('amount').notNull(), // positive for charges, negative for payments/credits
  recordedBy: text('recorded_by').default('Front Desk'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  promoCode: text('promo_code').default('ROYAL15'),
  createdAt: timestamp('created_at').defaultNow(),
});
