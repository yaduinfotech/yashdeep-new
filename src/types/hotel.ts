export interface Room {
  id: string;
  name: string;
  tagline: string;
  category: 'deluxe' | 'suite' | 'executive' | 'family';
  price: number;
  originalPrice: number;
  sizeSqFt: number;
  bedType: string;
  maxOccupancy: number;
  amenities: string[];
  description: string;
  image: string;
  gallery: string[];
  rating: number;
  reviewsCount: number;
  isPopular?: boolean;
  availableUnits: number;
  isAvailable?: boolean;
}

export interface BookingAddOns {
  breakfast: boolean;
  airportTransfer: boolean;
  earlyCheckIn: boolean;
}

export interface BookingData {
  id: string;
  bookingReference: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adultCount: number;
  childCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  gstNumber?: string;
  specialRequests?: string;
  addOns: BookingAddOns;
  roomRateTotal: number;
  addOnsTotal: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: 'upi' | 'card' | 'pay_at_hotel';
  paymentStatus: 'paid' | 'pending';
  stayStatus?: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  assignedRoomNumber?: string;
  idProofType?: string;
  idProofNumber?: string;
  checkInTimestamp?: string;
  checkOutTimestamp?: string;
  appliedRewardBenefit?: string;
  roomChangeHistory?: RoomChange[];
  paymentDetails?: {
    upiId?: string;
    cardLast4?: string;
    transactionId: string;
  };
  createdAt: string;
}

export interface EmailNotification {
  id: string;
  bookingReference: string;
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'delivered';
  pdfSummaryUrl: string;
  htmlContent: string;
  messageId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: 'Silver Executive' | 'Gold Royal' | 'Platinum Maharaja' | '';
  points: number;
  memberSince: string;
  redeemedBenefits: string[];
}

export interface RedeemableBenefit {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  code: string;
  type: 'room_discount' | 'free_breakfast' | 'early_checkin' | 'suite_upgrade';
  value: string;
}

export interface Review {
  id: string;
  author: string;
  city: string;
  rating: number;
  stayType: 'Business' | 'Family' | 'Wedding & Event' | 'Couple';
  comment: string;
  date: string;
  verified: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  tag: string;
  imageUrl: string;
  likes: number;
  handle: string;
}

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  eventName: string;
  category: 'view' | 'click' | 'booking' | 'newsletter' | 'interaction';
  details: string;
}

export interface PhysicalRoom {
  roomNumber: string;
  roomTypeId: string;
  floor: number;
  housekeepingStatus: 'clean' | 'dirty' | 'inspected' | 'out_of_order';
  occupancyStatus: 'vacant' | 'occupied' | 'reserved' | 'blocked';
  currentBookingReference?: string | null;
  notes?: string | null;
  updatedAt?: string;
}

export interface GuestFolioItem {
  id: number;
  bookingReference: string;
  itemType: string;
  description: string;
  amount: number;
  recordedBy: string;
  createdAt: string;
}

export interface ManagerProfile {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface HMSOverview {
  totalRooms: number;
  occupiedCount: number;
  cleanVacantCount: number;
  dirtyCount: number;
  outOfOrderCount: number;
  occupancyRate: number;
  inHouseGuests: number;
  todayArrivals: number;
  todayDepartures: number;
  totalRoomRevenue: number;
}

export interface HotelInfo {
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  phoneAlt: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  rating: number;
  totalReviews: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  highlights: string[];
}

export interface DiningSpecial {
  id: string;
  name: string;
  price: string;
  category: string;
}

export interface DiningInfo {
  restaurantName: string;
  cuisine: string;
  timings: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  description: string;
  specials: DiningSpecial[];
}
export interface RoomChange {
  id: string;
  bookingReference: string;
  fromRoomNumber: string;
  toRoomNumber: string;
  reason: string;
  changedBy: string;
  changedAt: string;
}

export interface Expense {
  id: string;
  category: 'laundry' | 'food_beverage' | 'diesel_generator' | 'maintenance' | 'utilities' | 'staff_welfare' | 'supplies' | 'other';
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque';
  date: string;
  recordedBy: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  roomNumber: string;
  guestName: string;
  requestType: 'room_service' | 'housekeeping' | 'maintenance' | 'laundry' | 'bell_desk' | 'amenities' | 'other';
  priority: 'low' | 'medium' | 'urgent';
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  notes?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface StaffUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'general_manager' | 'front_desk' | 'housekeeping';
  isActive: boolean;
  lastLoginAt?: string;
}






