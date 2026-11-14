/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RoomCatalog from './components/RoomCatalog';
import AboutProximity from './components/AboutProximity';
import Dining from './components/Dining';
import InteractiveGallery from './components/InteractiveGallery';
import AeoKnowledgeFaq from './components/AeoKnowledgeFaq';
import ReviewsSection from './components/ReviewsSection';
import NewsletterRetention from './components/NewsletterRetention';
import Footer from './components/Footer';
import FloatingSocialBar from './components/FloatingSocialBar';
import BookingModal from './components/BookingModal';
import AnalyticsDrawer from './components/AnalyticsDrawer';
import RewardsDashboardModal from './components/RewardsDashboardModal';
import HotelManagementSystem from './components/manager/HotelManagementSystem';
import { Room, BookingData, UserProfile } from './types/hotel';
import { HotelDataProvider, useHotelData } from './context/HotelDataContext';
import { trackEvent } from './utils/analytics';
import { auth, googleAuthProvider } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { Ticket, Crown } from 'lucide-react';
import {
  getOfflineKeyValue,
  setOfflineKeyValue,
  deleteOfflineKeyValue,
} from './utils/offlineSqlite';

export default function App() {
  return (
    <HotelDataProvider>
      <AppContent />
    </HotelDataProvider>
  );
}

function AppContent() {
  const { rooms, updateRoom } = useHotelData();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);

  // Confirmed Customer Bookings (stored in SQLite)
  const [userBookings, setUserBookings] = useState<BookingData[]>([]);

  // Authenticated User Profile (stored in SQLite)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isOwnerPortalOpen, setIsOwnerPortalOpen] = useState(false);

  // Booking selections
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookingCheckIn, setBookingCheckIn] = useState<string>('');
  const [bookingCheckOut, setBookingCheckOut] = useState<string>('');
  const [bookingGuests, setBookingGuests] = useState<number>(2);
  const [activeBenefitCode, setActiveBenefitCode] = useState<string>('');

  // Sync dark mode class with html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Firebase Auth State Listener & SQLite Session Hydration
  useEffect(() => {
    // Restore user session & confirmed bookings from client SQLite
    getOfflineKeyValue<UserProfile>('ydp_google_user').then((savedUser) => {
      if (savedUser) setCurrentUser(savedUser);
    }).catch(() => { });

    getOfflineKeyValue<BookingData[]>('ydp_confirmed_bookings').then((savedBookings) => {
      if (Array.isArray(savedBookings) && savedBookings.length > 0) {
        setUserBookings(savedBookings);
      }
    }).catch(() => { });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const profile: UserProfile = {
          id: user.uid,
          name: user.displayName || 'Palace Guest',
          email: user.email || '',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || 'Guest'}`,
          points: 500,
          tier: 'Silver Executive',
          redeemedBenefits: [],
          memberSince: new Date().getFullYear().toString(),
        };
        setCurrentUser(profile);
        setOfflineKeyValue('ydp_google_user', profile);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initial load tracking, DB synchronization & Dynamic On-Page SEO observer
  useEffect(() => {
    trackEvent('page_view_home', 'view', 'Homepage loaded');

    // Fetch live bookings from database
    fetch('/api/bookings')
      .then((res) => (res.ok ? res.json() : []))
      .then((dbBookings) => {
        if (Array.isArray(dbBookings) && dbBookings.length > 0) {
          setUserBookings(dbBookings);
          setOfflineKeyValue('ydp_confirmed_bookings', dbBookings);
        }
      })
      .catch((err) => console.log('Loaded local bookings:', err));

    // Dynamic On-page SEO observer for user navigation
    const handleScroll = () => {
      const roomsEl = document.getElementById('rooms');
      const diningEl = document.getElementById('dining');
      const faqEl = document.getElementById('faq');
      const scrollPos = window.scrollY + 250;

      if (faqEl && scrollPos >= faqEl.offsetTop) {
        document.title = 'Khuskheda Hotel FAQs & Location Guide | YashDeep Palace';
      } else if (diningEl && scrollPos >= diningEl.offsetTop) {
        document.title = 'Fine Dining & Restaurant in Khuskheda | YashDeep Palace';
      } else if (roomsEl && scrollPos >= roomsEl.offsetTop) {
        document.title = 'Deluxe Rooms & Suites in Khuskheda | YashDeep Palace Hotel';
      } else {
        document.title = 'YashDeep Palace | Best Hotel & Restaurant in Khuskheda, Bhiwadi';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save Rooms via Hotel Data Context
  const handleSaveRooms = async (updatedRooms: Room[]) => {
    for (const r of updatedRooms) {
      await updateRoom(r.id, r);
    }
  };

  // Real Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const profile: UserProfile = {
        id: user.uid,
        name: user.displayName || 'Guest',
        email: user.email || '',
        avatar: user.photoURL || '',
        points: 200,
        tier: 'Silver Executive',
        redeemedBenefits: [],
        memberSince: new Date().getFullYear().toString(),
      };
      setCurrentUser(profile);
      setOfflineKeyValue('ydp_google_user', profile);
      trackEvent('google_sign_in_success', 'click', `User: ${profile.name}, Email: ${profile.email}`);
    } catch (err: any) {
      console.warn('Google sign in popup error/cancelled, using verified guest session:', err);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch { }
    setCurrentUser(null);
    deleteOfflineKeyValue('ydp_google_user');
    trackEvent('user_sign_out', 'click', 'User signed out from rewards');
  };

  // Update Points & Redeemed Voucher
  const handleUpdatePoints = (newPoints: number, redeemedCode?: string) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      points: newPoints,
      redeemedBenefits: redeemedCode
        ? [...currentUser.redeemedBenefits, redeemedCode]
        : currentUser.redeemedBenefits,
    };
    setCurrentUser(updated);
    setOfflineKeyValue('ydp_google_user', updated);
  };

  // Handle Quick Booking Check from Hero
  const handleCheckAvailability = (searchParams: {
    checkIn: string;
    checkOut: string;
    guests: number;
    category: string;
  }) => {
    setBookingCheckIn(searchParams.checkIn);
    setBookingCheckOut(searchParams.checkOut);
    setBookingGuests(searchParams.guests);
    setSelectedCategory(searchParams.category);

    const elem = document.getElementById('rooms');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Room selected from catalog
  const handleSelectRoomForBooking = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingOpen(true);
  };

  // Open booking modal directly
  const handleOpenGeneralBooking = () => {
    setSelectedRoom(rooms[0] || null);
    setIsBookingOpen(true);
    trackEvent('open_booking_modal', 'click', 'Navbar booking trigger');
  };

  // On successful booking - saves to database & local state
  const handleBookingSuccess = async (newBooking: BookingData) => {
    const updated = [newBooking, ...userBookings];
    setUserBookings(updated);
    setOfflineKeyValue('ydp_confirmed_bookings', updated);

    // Award rewards points if user is signed in
    if (currentUser) {
      const earned = Math.round(newBooking.grandTotal * 0.1);
      handleUpdatePoints(currentUser.points + earned);
    }
  };

  // Open booking modal with redeemed reward code
  const handleOpenBookingWithBenefit = (code: string) => {
    setActiveBenefitCode(code);
    setSelectedRoom(rooms[0] || null);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-amber-500/20 selection:text-amber-900 transition-colors flex flex-col font-sans">
      {/* Confirmed Booking Toast Banner if user has active bookings */}
      {userBookings.length > 0 && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <span className="flex items-center gap-1.5">
              <Ticket className="w-4 h-4" />
              <span>
                You have {userBookings.length} confirmed stay booking(s). Reference:{' '}
                <strong className="font-mono">{userBookings[0].bookingReference}</strong> ({userBookings[0].roomName})
              </span>
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRewardsOpen(true)}
                type="button"
                className="flex items-center gap-1 text-[11px] underline font-bold cursor-pointer hover:text-slate-800"
              >
                <Crown className="w-3.5 h-3.5 text-amber-900" />
                <span>Rewards History</span>
              </button>
              <a
                href={`/api/bookings/${userBookings[0].bookingReference}/pdf-summary`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] underline font-bold cursor-pointer hover:text-slate-800"
              >
                PDF Voucher
              </a>
              <button
                onClick={() => {
                  setSelectedRoom(rooms.find((r) => r.id === userBookings[0].roomId) || rooms[0]);
                  setIsBookingOpen(true);
                }}
                type="button"
                className="text-[11px] underline font-bold cursor-pointer hover:text-slate-800"
              >
                Manage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        onOpenBooking={handleOpenGeneralBooking}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentUser={currentUser}
        onOpenRewards={() => setIsRewardsOpen(true)}
        onOpenOwnerPortal={() => setIsOwnerPortalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with Quick Availability Check */}
        <Hero onCheckAvailability={handleCheckAvailability} />

        {/* Accommodations Catalog & Dynamic Rooms */}
        <RoomCatalog
          isLoading={isCatalogLoading}
          rooms={rooms}
          onSelectRoomForBooking={handleSelectRoomForBooking}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => setSelectedCategory(cat)}
        />

        {/* About Us & Local Landmark Proximity (Karuli Industrial Area, Honda Car Gate 4) */}
        <AboutProximity onOpenBooking={handleOpenGeneralBooking} />

        {/* Fine Dining */}
        <Dining />

        {/* Interactive Guest Gallery & Instagram Feed */}
        <InteractiveGallery />

        {/* AEO / GEO Search & AI Overviews Knowledge FAQ Section */}
        <AeoKnowledgeFaq />

        {/* Verified Reviews Section */}
        <ReviewsSection />

        {/* Automated Newsletter Retention Engine */}
        <NewsletterRetention />
      </main>

      {/* Footer & Driving Directions */}
      <Footer />

      {/* Floating WhatsApp Concierge & Phone Dialer Bar */}
      <FloatingSocialBar onOpenBooking={handleOpenGeneralBooking} />

      {/* Advance Room Reservation & Verification Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setActiveBenefitCode('');
        }}
        availableRooms={rooms}
        initialRoom={selectedRoom}
        initialCheckIn={bookingCheckIn}
        initialCheckOut={bookingCheckOut}
        initialGuests={bookingGuests}
        initialBenefitCode={activeBenefitCode}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Yashdeep Rewards Dashboard Modal */}
      <RewardsDashboardModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onUpdatePoints={handleUpdatePoints}
        userBookings={userBookings}
        onOpenBookingWithBenefit={handleOpenBookingWithBenefit}
      />

      {/* Full-Featured Hotel Management System (HMS / PMS) */}
      <HotelManagementSystem
        isOpen={isOwnerPortalOpen}
        onClose={() => setIsOwnerPortalOpen(false)}
        catalogRooms={rooms}
        onSaveCatalogRooms={handleSaveRooms}
        bookings={userBookings}
        onRefreshData={() => {
          fetch('/api/bookings')
            .then((res) => (res.ok ? res.json() : []))
            .then((b) => setUserBookings(b));
        }}
      />

      {/* Real-Time Live Analytics Drawer */}
      <AnalyticsDrawer
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </div>
  );
}
