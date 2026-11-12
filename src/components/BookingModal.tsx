import { useState, useEffect } from 'react';
import { Room, BookingData, BookingAddOns, UserProfile, EmailNotification } from '../types/hotel';
import { ROOMS_DATA } from '../data/hotelData';
import {
  X,
  Calendar,
  Users,
  CheckCircle2,
  QrCode,
  CreditCard,
  Printer,
  Share2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Bed,
  Sparkles,
  Tag,
  Gift,
  Mail,
  FileText,
  ExternalLink,
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

export default function BookingModal({
  isOpen,
  onClose,
  availableRooms = ROOMS_DATA,
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
  const [selectedRoom, setSelectedRoom] = useState<Room>(initialRoom || availableRooms[0] || ROOMS_DATA[0]);
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

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentTimer, setPaymentTimer] = useState(180);

  // Final Confirmed Booking & Email Notification
  const [confirmedBooking, setConfirmedBooking] = useState<BookingData | null>(null);
  const [emailNotification, setEmailNotification] = useState<EmailNotification | null>(null);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);

  // Sync selected room if prop updates
  useEffect(() => {
    if (initialRoom) {
      setSelectedRoom(initialRoom);
    }
  }, [initialRoom]);

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

  // UPI countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 3 && paymentMethod === 'upi' && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, paymentMethod, paymentTimer]);

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
  const taxAmount = Math.round((roomRateTotal + addOnsTotal) * 0.12);
  const grandTotal = roomRateTotal + addOnsTotal + taxAmount;

  // Step 1 -> Step 2 validation
  const handleProceedToGuestDetails = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('booking_step1_complete', 'booking', `Room: ${selectedRoom.name}, Nights: ${calculatedNights}`);
    setStep(2);
  };

  // Step 2 -> Step 3 validation
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      alert('Please fill in your Name, Email, and Phone Number.');
      return;
    }
    trackEvent('booking_step2_complete', 'booking', `Guest: ${guestName}, Email: ${guestEmail}`);
    setStep(3);
  };

  // Final Payment Processing Simulator
  const handleCompletePayment = () => {
    setIsProcessingPayment(true);
    trackEvent('booking_payment_started', 'booking', `Method: ${paymentMethod}, Total: ₹${grandTotal}`);

    setTimeout(() => {
      setIsProcessingPayment(false);
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
        guestName,
        guestEmail,
        guestPhone,
        gstNumber: gstNumber.trim() || undefined,
        specialRequests: specialRequests.trim() || undefined,
        addOns,
        roomRateTotal,
        addOnsTotal,
        taxAmount,
        grandTotal,
        paymentMethod,
        paymentStatus: 'paid',
        appliedRewardBenefit: benefitCode || undefined,
        paymentDetails: {
          upiId: paymentMethod === 'upi' ? (upiId || `${guestPhone}@upi`) : undefined,
          cardLast4: paymentMethod === 'card' ? cardNumber.slice(-4) || '4242' : undefined,
          transactionId: `TXN${Date.now()}`,
        },
        createdAt: new Date().toISOString(),
      };

      setConfirmedBooking(newBooking);

      // Simulate sending booking confirmation email with PDF summary link
      try {
        const generatedEmail = simulateBookingConfirmationEmail(newBooking);
        setEmailNotification(generatedEmail);
      } catch (err) {
        console.error('Email generation error:', err);
      }

      onBookingSuccess(newBooking);
      trackEvent('booking_confirmed', 'booking', `Ref: ${bookingRef}, Total: ₹${grandTotal}`);
      setStep(4);
    }, 1500);
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl my-6 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="font-royal text-lg font-bold text-slate-900 dark:text-amber-400">
              YASHDEEP PALACE
            </span>
            <span className="text-slate-400" aria-hidden="true">|</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Direct Booking Engine
            </span>
          </div>
          <button
            onClick={onClose}
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
            <span className="hidden sm:inline">Instant Pay</span>
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
                <h3 className="text-xl font-bold font-royal text-slate-900 dark:text-white mb-1">
                  Select Dates & Room Category
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Best direct rate opposite Honda Car Gate 4 with high-speed optical Wi-Fi and valet parking.
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
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        selectedRoom.id === r.id
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
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Guests (Adults)
                  </label>
                  <select
                    value={adultCount}
                    onChange={(e) => setAdultCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value={1}>1 Adult (Solo Business)</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                    <option value={4}>4 Adults</option>
                  </select>
                </div>
              </div>

              {/* Applied Benefit / Promo Code Input */}
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-300/60 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Rewards Promo / Benefit Code:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={benefitCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setBenefitCode(val);
                      if (val.includes('10') || val === 'ROYAL15') {
                        setAppliedDiscountPercent(val === 'ROYAL15' ? 15 : 10);
                      } else {
                        setAppliedDiscountPercent(0);
                      }
                    }}
                    placeholder="Enter code"
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-amber-400 rounded-md font-mono text-xs uppercase text-slate-900 dark:text-white"
                  />
                  {appliedDiscountPercent > 0 && (
                    <span className="text-emerald-600 font-bold text-[11px]">
                      {appliedDiscountPercent}% Applied!
                    </span>
                  )}
                </div>
              </div>

              {/* Add-ons Section */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hospitality Add-ons
                </p>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addOns.breakfast}
                      onChange={(e) => setAddOns({ ...addOns, breakfast: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Royal Multi-Cuisine Buffet Breakfast
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isFreeBreakfast ? '★ Covered by your Yashdeep Rewards Benefit!' : 'Fresh morning bakery & South/North Indian live stations'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {isFreeBreakfast ? 'FREE (Redeemed)' : '+₹350 / guest / night'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addOns.earlyCheckIn}
                      onChange={(e) => setAddOns({ ...addOns, earlyCheckIn: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Priority Early Check-in (from 10:00 AM)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isFreeEarlyCheckIn ? '★ Covered by your Yashdeep Rewards Privilege!' : 'Guaranteed early room blocking'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {isFreeEarlyCheckIn ? 'FREE (Redeemed)' : '+₹600 flat'}
                  </span>
                </label>
              </div>

              {/* Price Calculation Summary Strip */}
              <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/60 dark:border-amber-800/40 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>
                    {selectedRoom.name} ({calculatedNights} {calculatedNights === 1 ? 'night' : 'nights'} × ₹{selectedRoom.price.toLocaleString('en-IN')})
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    ₹{rawRoomTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Yashdeep Rewards Privilege Discount ({appliedDiscountPercent}%)</span>
                    <span className="tabular-nums">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Hospitality Add-ons</span>
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                      +₹{addOnsTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST Taxes (12%)</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    +₹{taxAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/80 flex justify-between items-baseline text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total Payable:</span>
                  <span className="text-lg text-amber-600 dark:text-amber-400 tabular-nums">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
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

          {/* STEP 2: GUEST DETAILS & GOOGLE SIGN-IN PROMPT */}
          {step === 2 && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              <div>
                <h3 className="text-xl font-bold font-royal text-slate-900 dark:text-white mb-1">
                  Primary Guest Contact & Google Confirmation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Confirm your coordinates for the instant booking confirmation voucher and corporate invoice.
                </p>
              </div>

              {/* Google Sign-in One-Click Autofill Banner */}
              {!currentUser ? (
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>Confirm Faster with Google</span>
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Auto-fills your details and earns +{(grandTotal * 0.1).toFixed(0)} points in Yashdeep Rewards.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="px-4 py-2 bg-white text-slate-700 font-bold text-xs rounded-lg border border-slate-300 shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google Sign-In</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                      Confirmed via Google as {currentUser.name} ({currentUser.email})
                    </span>
                  </div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    +{(grandTotal * 0.1).toFixed(0)} PTS Accruing
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
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
                    placeholder="rasu@example.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone (WhatsApp) *
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
                    Company GSTIN (For Corporate Billing)
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
                  placeholder="e.g. Quiet floor room, late check-in from Honda plant audit..."
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
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT (UPI & CARDS) */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-royal text-slate-900 dark:text-white mb-1">
                  Secure Checkout & Instant Confirmation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select payment gateway. 256-Bit SSL Encrypted.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/40'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Instant UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/40'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit / Debit Card</span>
                </button>
              </div>

              {/* UPI View */}
              {paymentMethod === 'upi' && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30 px-3 py-1 rounded-full font-medium">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      QR Valid for: {Math.floor(paymentTimer / 60)}:
                      {(paymentTimer % 60).toString().padStart(2, '0')} min
                    </span>
                  </div>

                  <div className="w-44 h-44 mx-auto bg-white p-3 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                      <rect x="5" y="5" width="25" height="25" rx="3" fill="#0B0F19" />
                      <rect x="10" y="10" width="15" height="15" fill="#FFFFFF" />
                      <rect x="13" y="13" width="9" height="9" fill="#0B0F19" />
                      <rect x="70" y="5" width="25" height="25" rx="3" fill="#0B0F19" />
                      <rect x="75" y="10" width="15" height="15" fill="#FFFFFF" />
                      <rect x="78" y="13" width="9" height="9" fill="#0B0F19" />
                      <rect x="5" y="70" width="25" height="25" rx="3" fill="#0B0F19" />
                      <rect x="10" y="75" width="15" height="15" fill="#FFFFFF" />
                      <rect x="13" y="78" width="9" height="9" fill="#0B0F19" />
                      <rect x="35" y="10" width="8" height="8" fill="#D4AF37" />
                      <rect x="48" y="10" width="8" height="8" fill="#0B0F19" />
                      <rect x="40" y="40" width="8" height="8" fill="#D4AF37" />
                      <rect x="70" y="40" width="8" height="8" fill="#0B0F19" />
                      <rect x="40" y="70" width="8" height="8" fill="#D4AF37" />
                      <rect x="70" y="70" width="8" height="8" fill="#0B0F19" />
                    </svg>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">yashdeeppalace@icici</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Scan with Google Pay, PhonePe, Paytm, or BHIM
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Amount: <span className="font-bold text-amber-600 dark:text-amber-400">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={handleCompletePayment}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Verifying UPI Gateway Transaction...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simulate UPI Payment Received</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Card View */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4532 8901 2345 6789"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono tracking-wider text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={handleCompletePayment}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Authorizing Card Payment...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Pay ₹{grandTotal.toLocaleString('en-IN')} Securely</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMED BOOKING */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-royal text-slate-900 dark:text-white">
                  Reservation Confirmed!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Your stay at YashDeep Palace is booked. A confirmation has been sent to{' '}
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
                    <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Confirmed
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400">Guest Name:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Phone:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.guestPhone}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Check-in:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.checkIn} (from 2 PM)</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Check-out:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.checkOut} (by 11 AM)</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Room:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.roomName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Duration & Occupancy:</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {confirmedBooking.nights} Night(s) · {confirmedBooking.adultCount} Adult(s)
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Total Amount Paid</p>
                    <p className="text-[10px] text-slate-400">Via {confirmedBooking.paymentMethod.toUpperCase()} · Txn {confirmedBooking.paymentDetails?.transactionId}</p>
                  </div>
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                    ₹{confirmedBooking.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Simulated Booking Confirmation Email Notification Card */}
              <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Confirmation Email Dispatched to {confirmedBooking.guestEmail}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Includes verified reservation details and official PDF summary voucher download link.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEmailPreviewOpen(true)}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-lg shadow-xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    <span>Preview Email</span>
                  </button>
                  <a
                    href={`/api/bookings/${confirmedBooking.bookingReference}/pdf-summary`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Voucher</span>
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
                  <span>Print Voucher / PDF</span>
                </button>

                <a
                  href={`https://wa.me/918222020699?text=${encodeURIComponent(
                    `Hello YashDeep Palace, my stay booking is confirmed! Reference: ${confirmedBooking.bookingReference}, Guest: ${confirmedBooking.guestName}, Check-in: ${confirmedBooking.checkIn}`
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

      {/* Simulated Booking Confirmation Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        email={emailNotification}
      />
    </div>
  );
}
