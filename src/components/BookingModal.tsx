import React, { useState, useEffect } from 'react';
import { Room, BookingData, BookingAddOns, UserProfile, EmailNotification } from '../types/hotel';
import { useHotelData } from '../context/HotelDataContext';
import {
  X,
  CheckCircle2,
  Printer,
  Share2,
  ArrowRight,
  ArrowLeft,
  Mail,
  FileText,
  ExternalLink,
  ShieldCheck,
  Building,
  CreditCard,
  IdCard,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { simulateBookingConfirmationEmail } from '../utils/emailService';
import EmailPreviewModal from './EmailPreviewModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRooms?: Room[];
  initialRoom?: Room | null;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  initialBenefitCode?: string;
  currentUser: UserProfile | null;
  onGoogleSignIn: () => void;
  onBookingSuccess: (booking: BookingData) => void;
}

const fallbackRoom: Room = {
  id: 'deluxe-room',
  name: 'Deluxe Room',
  tagline: 'King Bed, Modern Luxury',
  category: 'deluxe',
  price: 2200,
  originalPrice: 3600,
  sizeSqFt: 180,
  bedType: '1 King Bed',
  maxOccupancy: 2,
  availableUnits: 4,
  description: 'Deluxe Room opposite Honda Car Gate 4.',
  image: '/src/assets/images/room_deluxe_king_1794500883485.jpg',
  gallery: ['/src/assets/images/room_deluxe_king_1794500883485.jpg'],
  rating: 4.8,
  reviewsCount: 156,
  amenities: ['High-Speed Wi-Fi', 'Complimentary Breakfast', 'Room Air Conditioner (AC)'],
  isPopular: true,
};

export default function BookingModal({
  isOpen,
  onClose,
  availableRooms = [],
  initialRoom,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  initialBenefitCode,
  currentUser,
  onGoogleSignIn,
  onBookingSuccess,
}: BookingModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room>(initialRoom || availableRooms[0] || fallbackRoom);
  const [checkIn, setCheckIn] = useState(initialCheckIn || today);
  const [checkOut, setCheckOut] = useState(initialCheckOut || tomorrow);
  const [adultCount, setAdultCount] = useState(initialGuests || 2);
  const [childCount, setChildCount] = useState(0);

  // Rewards benefit code
  const [benefitCode, setBenefitCode] = useState(initialBenefitCode || '');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);

  // Add-ons
  const [addOns, setAddOns] = useState<BookingAddOns>({
    breakfast: true,
    airportTransfer: false,
    earlyCheckIn: false,
  });

  // Guest Information
  const [guestName, setGuestName] = useState(currentUser?.name || '');
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || '');
  const [guestPhone, setGuestPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Government ID Verification (Advance Reservation Requirement)
  const [idProofType, setIdProofType] = useState<string>('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Final Confirmed Booking & Notification
  const [confirmedBooking, setConfirmedBooking] = useState<BookingData | null>(null);
  const [emailNotification, setEmailNotification] = useState<EmailNotification | null>(null);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);

  // Front Desk Direct-Call Assistance on Idle or Exit Intent
  const { hotelInfo } = useHotelData();
  const [showAssistance, setShowAssistance] = useState(false);
  const [assistanceReason, setAssistanceReason] = useState<'idle' | 'exit_intent'>('idle');

  // Inactivity / Hesitation & Exit Intent Detector
  useEffect(() => {
    if (!isOpen || step === 4 || confirmedBooking) {
      setShowAssistance(false);
      return;
    }

    let idleTimer: NodeJS.Timeout;
    const startIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setAssistanceReason('idle');
        setShowAssistance(true);
      }, 35000); // 35 seconds of staying on booking modal
    };

    startIdleTimer();

    const handleActivity = () => {
      if (!showAssistance) {
        startIdleTimer();
      }
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && step < 4 && !confirmedBooking) {
        setAssistanceReason('exit_intent');
        setShowAssistance(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isOpen, step, confirmedBooking, showAssistance]);

  const handleAttemptClose = () => {
    if (step >= 2 && !confirmedBooking && !showAssistance) {
      setAssistanceReason('exit_intent');
      setShowAssistance(true);
    } else {
      onClose();
    }
  };

  // Sync selected room if prop updates
  useEffect(() => {
    if (initialRoom) {
      setSelectedRoom(initialRoom);
    } else if (availableRooms.length > 0 && selectedRoom.id === 'deluxe-room') {
      setSelectedRoom(availableRooms[0]);
    }
  }, [initialRoom, availableRooms]);

  // Sync user info if signed in
  useEffect(() => {
    if (currentUser) {
      if (!guestName) setGuestName(currentUser.name);
      if (!guestEmail) setGuestEmail(currentUser.email);
    }
  }, [currentUser]);

  // Handle benefits
  useEffect(() => {
    if (initialBenefitCode) {
      setBenefitCode(initialBenefitCode);
      if (initialBenefitCode.includes('10')) {
        setAppliedDiscountPercent(10);
      }
    }
  }, [initialBenefitCode]);

  if (!isOpen) return null;

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const calculatedNights = Math.max(1, Math.round(timeDiff / (1000 * 3600 * 24)));

  // Calculate pricing
  const rawRoomTotal = selectedRoom.price * calculatedNights;
  const discountAmount = appliedDiscountPercent > 0 ? Math.round(rawRoomTotal * (appliedDiscountPercent / 100)) : 0;
  const roomRateTotal = rawRoomTotal - discountAmount;

  const isFreeBreakfast = benefitCode === 'YDP-FREE-BF';
  const breakfastCost = addOns.breakfast && !isFreeBreakfast ? 350 * adultCount * calculatedNights : 0;
  const transferCost = addOns.airportTransfer ? 950 : 0;
  const isFreeEarlyCheckIn = benefitCode === 'YDP-EARLY-IN';
  const earlyCheckInCost = addOns.earlyCheckIn && !isFreeEarlyCheckIn ? 600 : 0;

  const addOnsTotal = breakfastCost + transferCost + earlyCheckInCost;
  const taxAmount = Math.round((roomRateTotal + addOnsTotal) * 0.05); // Standard 5% GST
  const grandTotal = roomRateTotal + addOnsTotal + taxAmount;

  const handleProceedToGuestDetails = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('booking_step1_complete', 'booking', `Room: ${selectedRoom.name}, Nights: ${calculatedNights}`);
    setStep(2);
  };

  const handleProceedToGuarantee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      alert('Please fill in your Name, Email, and Phone Number.');
      return;
    }
    trackEvent('booking_step2_complete', 'booking', `Guest: ${guestName}, Email: ${guestEmail}`);
    setStep(3);
  };

  // Final Advance Reservation Confirmation
  const handleConfirmAdvanceReservation = async () => {
    if (!idProofNumber.trim()) {
      alert('Please provide your Government ID Proof number for advance reservation confirmation.');
      return;
    }

    setIsSubmitting(true);
    trackEvent('booking_submission_started', 'booking', `Total: ₹${grandTotal}`);

    const bookingRef = `YDP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: BookingData = {
      id: `book-${Date.now()}`,
      bookingReference: bookingRef,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      checkIn,
      checkOut,
      nights: calculatedNights,
      adultCount,
      childCount,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      gstNumber: gstNumber.trim() || undefined,
      specialRequests: specialRequests.trim() || undefined,
      addOns,
      roomRateTotal,
      addOnsTotal,
      taxAmount,
      grandTotal,
      paymentMethod: 'pay_at_hotel',
      paymentStatus: 'pending',
      stayStatus: 'confirmed',
      idProofType,
      idProofNumber: idProofNumber.trim(),
      appliedRewardBenefit: benefitCode || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      const data = await res.json();
      const confirmed = data.booking || newBooking;
      setConfirmedBooking(confirmed);

      const generatedEmail = simulateBookingConfirmationEmail(confirmed);
      setEmailNotification(generatedEmail);

      onBookingSuccess(confirmed);
      trackEvent('booking_confirmed', 'booking', `Ref: ${confirmed.bookingReference}, Total: ₹${grandTotal}`);
      setStep(4);
    } catch (err) {
      console.error('Error confirming advance reservation:', err);
      // Fallback
      setConfirmedBooking(newBooking);
      onBookingSuccess(newBooking);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl my-6 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold text-slate-900 dark:text-amber-400">
              {hotelInfo.name?.toUpperCase() || 'YASHDEEP PALACE'}
            </span>
            <span className="text-slate-400" aria-hidden="true">|</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Advance Reservation Engine
            </span>
          </div>
          <button
            onClick={handleAttemptClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Indicators */}
        <div className="px-6 py-3 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 font-medium ${step >= 1 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-300 dark:bg-slate-700'}`}>1</span>
            <span className="hidden sm:inline">Dates & Room</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">──</span>
          <div className={`flex items-center gap-1.5 font-medium ${step >= 2 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-300 dark:bg-slate-700'}`}>2</span>
            <span className="hidden sm:inline">Guest Details</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">──</span>
          <div className={`flex items-center gap-1.5 font-medium ${step >= 3 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-300 dark:bg-slate-700'}`}>3</span>
            <span className="hidden sm:inline">Verification & ID</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">──</span>
          <div className={`flex items-center gap-1.5 font-medium ${step === 4 ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-emerald-500 text-white font-bold' : 'bg-slate-300 dark:bg-slate-700'}`}>4</span>
            <span className="hidden sm:inline">Confirmed</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[75vh]">
          {/* STEP 1: DATES, ROOM & ADD-ONS */}
          {step === 1 && (
            <form onSubmit={handleProceedToGuestDetails} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-1">
                  Select Dates & Room Category
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Best direct rate opposite Honda Car Gate 4 with high-speed optical Wi-Fi and secured parking.
                </p>
              </div>

              {/* Room Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Select Accommodation
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
                  {availableRooms.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setSelectedRoom(r)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${selectedRoom.id === r.id
                        ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-400/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/60'
                        }`}
                    >
                      <img
                        src={r.image}
                        alt={r.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {r.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {r.bedType}
                        </p>
                        <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                          ₹{r.price.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal text-slate-500">/ night</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Guest Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    required
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Adults
                    </label>
                    <select
                      value={adultCount}
                      onChange={(e) => setAdultCount(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Adult' : 'Adults'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Children
                    </label>
                    <select
                      value={childCount}
                      onChange={(e) => setChildCount(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      {[0, 1, 2].map((num) => (
                        <option key={num} value={num}>
                          {num} Child
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Hospitality Add-ons & Services
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addOns.breakfast}
                      onChange={(e) => setAddOns({ ...addOns, breakfast: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Royal Breakfast</p>
                      <p className="text-[10px] text-slate-500">₹350/guest/day</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addOns.earlyCheckIn}
                      onChange={(e) => setAddOns({ ...addOns, earlyCheckIn: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Early Check-In</p>
                      <p className="text-[10px] text-slate-500">From 8:00 AM (+₹600)</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addOns.airportTransfer}
                      onChange={(e) => setAddOns({ ...addOns, airportTransfer: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Airport Cab</p>
                      <p className="text-[10px] text-slate-500">Delhi IGI T3 (+₹950)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Price summary */}
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {calculatedNights} Night(s) · {selectedRoom.name}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Estimated Total Tariff (Inc. 5% GST)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Pay at Check-In</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Guest Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: GUEST DETAILS & CORPORATE BILLING */}
          {step === 2 && (
            <form onSubmit={handleProceedToGuarantee} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-1">
                  Primary Guest Contact & Corporate Billing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official confirmation voucher will be sent to your phone and email.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Rasu Kumar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 82220 20699"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company GSTIN (For Business Tax Credit)
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="08AAAAA0000A1Z5"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Special Requests / Arrival Notes
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Quiet upper floor room, late check-in from Honda plant audit..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: GUARANTEE & GOVERNMENT ID PROOF VERIFICATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-1">
                  Advance Reservation Guarantee & ID Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Zero advance prepayment required. Confirm your reservation with valid government photo ID details and settle bill during Front Desk check-in.
                </p>
              </div>

              {/* Pay-at-Hotel Guarantee Box */}
              <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-950 dark:text-emerald-200">
                    Official Pay-at-Check-In Guarantee
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    Your room category is 100% reserved in hotel inventory. Payment (Cash, UPI, Credit Card, or Corporate Bill-to-Company)
                    is settled upon physical arrival at the front desk.
                  </p>
                </div>
              </div>

              {/* Government ID Verification Fields */}
              <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                  <IdCard className="w-4 h-4 text-amber-500" />
                  <span>Mandatory Guest ID Verification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Government ID Proof Type *
                    </label>
                    <select
                      value={idProofType}
                      onChange={(e) => setIdProofType(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                      <option value="Passport">Passport (International / Domestic)</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Voter ID">Voter ID Card</option>
                      <option value="Corporate Badge">Corporate Employee ID (Honda / Vendor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ID Proof / Document Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={idProofNumber}
                      onChange={(e) => setIdProofNumber(e.target.value)}
                      placeholder="e.g. 5489 1234 5678 or L9876543"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Physical photo ID must be presented for mandatory police verification during front desk check-in.
                </p>
              </div>

              {/* Price summary */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Amount Due at Front Desk Check-in:</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Includes {selectedRoom.name} ({calculatedNights} nights) + Add-ons + 5% GST
                  </p>
                </div>
                <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !idProofNumber.trim()}
                  onClick={handleConfirmAdvanceReservation}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering Reservation...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Advance Reservation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMED BOOKING & OFFICIAL VOUCHER */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  Advance Reservation Confirmed!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Your accommodation at YashDeep Palace is reserved. Official stay details dispatched to{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">{confirmedBooking.guestEmail}</span>.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Booking Reference</p>
                    <p className="text-base font-mono font-extrabold text-amber-600 dark:text-amber-400">
                      {confirmedBooking.bookingReference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Payment Status</p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" /> Pay at Check-In
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400">Primary Guest:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Phone / WhatsApp:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.guestPhone}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Check-In Date:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.checkIn} (from 12:00 PM)</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Check-Out Date:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.checkOut} (by 11:00 AM)</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Reserved Room:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.roomName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Recorded ID Proof:</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {confirmedBooking.idProofType || 'Govt ID'} ({confirmedBooking.idProofNumber || 'On Record'})
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Total Stay Tariff</p>
                    <p className="text-[10px] text-slate-400">Payable during front desk check-in</p>
                  </div>
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                    ₹{confirmedBooking.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Official Voucher Actions */}
              <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Official Tax Invoice & PDF Voucher Ready
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Download or print your stay voucher for front desk check-in and corporate accounting.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <a
                    href={`/api/bookings/${confirmedBooking.bookingReference}/pdf-summary`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download PDF Voucher</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>

                <a
                  href={`https://wa.me/918222020699?text=${encodeURIComponent(
                    `Hello YashDeep Palace, my advance stay is confirmed! Reference: ${confirmedBooking.bookingReference}, Guest: ${confirmedBooking.guestName}, Check-in: ${confirmedBooking.checkIn}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Notify Concierge via WhatsApp</span>
                </a>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Close & Return to Palace Website
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        email={emailNotification}
      />

      {/* Front Desk Immediate Assistance Trigger (Idle / Hesitation or Exit-Intent) */}
      {showAssistance && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-amber-400/40 shadow-2xl space-y-5 text-center relative">
            <button
              onClick={() => {
                setShowAssistance(false);
                if (assistanceReason === 'exit_intent') onClose();
              }}
              type="button"
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-amber-400/15 text-amber-500 mx-auto flex items-center justify-center">
              <Phone className="w-7 h-7 animate-bounce" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Front Desk Duty Manager Online 24/7
              </div>
              <h3 className="text-xl font-bold font-royal text-slate-900 dark:text-white">
                {assistanceReason === 'exit_intent' ? 'Leaving So Soon?' : 'Need Help Choosing a Room?'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Skip filling forms! Call our Front Desk Duty Manager directly for instant room confirmation, corporate tariffs, or customized check-in requests.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href={`tel:${hotelInfo.phone || '+918222020699'}`}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Front Desk ({hotelInfo.phone || '+91 82220 20699'})</span>
              </a>

              <a
                href={`https://wa.me/${(hotelInfo.phone || '918222020699').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${hotelInfo.name || 'Yashdeep Palace'} Front Desk, I am booking a room and would like instant assistance.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Duty Manager on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setShowAssistance(false);
                  if (assistanceReason === 'exit_intent') {
                    onClose();
                  }
                }}
                type="button"
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline pt-1 cursor-pointer"
              >
                {assistanceReason === 'exit_intent' ? 'Close & Leave Anyway' : 'Continue Online Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
