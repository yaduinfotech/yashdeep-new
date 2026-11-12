/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import NetworkSimulatorBar from './components/NetworkSimulatorBar';
import Hero from './components/Hero';
import RoomCatalog from './components/RoomCatalog';
import AboutProximity from './components/AboutProximity';
import DiningAndBanquets from './components/DiningAndBanquets';
import InteractiveGallery from './components/InteractiveGallery';
import ReviewsSection from './components/ReviewsSection';
import NewsletterRetention from './components/NewsletterRetention';
import Footer from './components/Footer';
import FloatingSocialBar from './components/FloatingSocialBar';
import BookingModal from './components/BookingModal';
import AnalyticsDrawer from './components/AnalyticsDrawer';
import RewardsDashboardModal from './components/RewardsDashboardModal';
import HotelManagementSystem from './components/manager/HotelManagementSystem';
import { Room, BookingData, UserProfile } from './types/hotel';
import { ROOMS_DATA } from './data/hotelData';
import { INITIAL_GOOGLE_USER } from './data/rewardsData';
import { trackEvent } from './utils/analytics';
import { Ticket, Crown } from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSimulatingSlowNetwork, setIsSimulatingSlowNetwork] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);

  // Dynamic Hotel Room Inventory (Owner Managed CMS)
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const stored = localStorage.getItem('ydp_rooms_inventory');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return ROOMS_DATA;
  });

  // Confirmed Customer Bookings
  const [userBookings, setUserBookings] = useState<BookingData[]>(() => {
    try {
      const stored = localStorage.getItem('ydp_confirmed_bookings');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  });

  // Google User & Yashdeep Rewards Loyalty State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('ydp_google_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return null;
  });

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

  // Initial load tracking & Dynamic On-Page SEO section observer
  // Initial load tracking, SQL DB synchronization & Dynamic On-Page SEO observer
  useEffect(() => {
    trackEvent('page_view_home', 'view', 'Homepage loaded');

    // Fetch live authentic rooms from SQL database
    fetch('/api/rooms')
      .then((res) => (res.ok ? res.json() : []))
      .then((dbRooms) => {
        if (Array.isArray(dbRooms) && dbRooms.length > 0) {
          setRooms(dbRooms);
        }
      })
      .catch((err) => console.log('Loaded default authentic rooms:', err));

    // Fetch live bookings from SQL database
    fetch('/api/bookings')
      .then((res) => (res.ok ? res.json() : []))
      .then((dbBookings) => {
        if (Array.isArray(dbBookings) && dbBookings.length > 0) {
          setUserBookings(dbBookings);
        }
      })
      .catch((err) => console.log('Loaded local bookings:', err));

    // On-page SEO Title & Description observer for user navigation
    const handleScroll = () => {
      const roomsEl = document.getElementById('rooms');
      const diningEl = document.getElementById('dining');
      const scrollPos = window.scrollY + 250;

      if (diningEl && scrollPos >= diningEl.offsetTop) {
        document.title = 'Restaurant & Banquet Hall in Khuskheda | YashDeep Palace';
      } else if (roomsEl && scrollPos >= roomsEl.offsetTop) {
        document.title = 'Deluxe Rooms & Suites in Khuskheda | YashDeep Palace Hotel';
      } else {
        document.title = 'YashDeep Palace | Best Hotel & Restaurant in Khuskheda, Bhiwadi';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save Rooms to State, LocalStorage & SQL Database (Owner CMS)
  const handleSaveRooms = async (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    try {
      localStorage.setItem('ydp_rooms_inventory', JSON.stringify(updatedRooms));
      // Save each to SQL
      for (const r of updatedRooms) {
        await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(r),
        });
      }
    } catch {
      // storage safe
    }
  };

  // Google Sign-In Simulation & SQL User Sync
  const handleGoogleSignIn = async () => {
    const userToSave: UserProfile = INITIAL_GOOGLE_USER;
    setCurrentUser(userToSave);
    try {
      localStorage.setItem('ydp_google_user', JSON.stringify(userToSave));
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userToSave.id,
          email: userToSave.email,
          name: userToSave.name,
          avatar: userToSave.avatar,
        }),
      });
    } catch {
      // storage safe
    }
    trackEvent('google_sign_in_success', 'click', `User: ${userToSave.name}, Email: ${userToSave.email}`);
  };

  // Sign out
  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('ydp_google_user');
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
    try {
      localStorage.setItem('ydp_google_user', JSON.stringify(updated));
    } catch {
      // safe
    }
  };

  // Handle slow network simulation toggle
  const handleToggleSlowNetwork = () => {
    const nextState = !isSimulatingSlowNetwork;
    setIsSimulatingSlowNetwork(nextState);
    trackEvent('toggle_slow_network', 'click', `Simulated Slow Network: ${nextState}`);

    if (nextState) {
      setIsCatalogLoading(true);
      setTimeout(() => {
        setIsCatalogLoading(false);
      }, 2500);
    } else {
      setIsCatalogLoading(false);
    }
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

    if (isSimulatingSlowNetwork) {
      setIsCatalogLoading(true);
      setTimeout(() => {
        setIsCatalogLoading(false);
      }, 1500);
    }

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
    setSelectedRoom(rooms[0] || ROOMS_DATA[0]);
    setIsBookingOpen(true);
    trackEvent('open_booking_modal', 'click', 'Navbar booking trigger');
  };

  // On successful booking - saves to Cloud SQL & local state
  const handleBookingSuccess = async (newBooking: BookingData) => {
    const updated = [newBooking, ...userBookings];
    setUserBookings(updated);
    try {
      localStorage.setItem('ydp_confirmed_bookings', JSON.stringify(updated));
      // Save directly to SQL database
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
    } catch (err) {
      console.error('Failed to sync booking with SQL database:', err);
    }

    // Award rewards points if user is signed in (10 points per ₹100 spent)
    if (currentUser) {
      const earned = Math.round(newBooking.grandTotal * 0.1);
      handleUpdatePoints(currentUser.points + earned);
    }
  };

  // Update booking status from owner portal in Cloud SQL
  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    const updated = userBookings.map((b) => {
      if (b.id === bookingId || b.bookingReference === bookingId) {
        return { ...b, paymentStatus: status as any };
      }
      return b;
    });
    setUserBookings(updated);
    try {
      localStorage.setItem('ydp_confirmed_bookings', JSON.stringify(updated));
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error('Failed to update booking status in SQL:', err);
    }
  };

  // Open booking modal with redeemed reward code
  const handleOpenBookingWithBenefit = (code: string) => {
    setActiveBenefitCode(code);
    setSelectedRoom(rooms[0] || ROOMS_DATA[0]);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-amber-500/20 selection:text-amber-900 transition-colors flex flex-col font-sans">
      {/* Network Latency Simulator & Fast Lighthouse Bar */}
      <NetworkSimulatorBar
        isSimulatingSlowNetwork={isSimulatingSlowNetwork}
        onToggleSlowNetwork={handleToggleSlowNetwork}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
      />

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

        {/* Accommodations Catalog & Dynamic Rooms (Owner Managed) */}
        <RoomCatalog
          isLoading={isCatalogLoading}
          rooms={rooms}
          onSelectRoomForBooking={handleSelectRoomForBooking}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat);
            if (isSimulatingSlowNetwork) {
              setIsCatalogLoading(true);
              setTimeout(() => setIsCatalogLoading(false), 1200);
            }
          }}
        />

        {/* About Us & Local Landmark Proximity (Karuli Industrial Area, Honda Car Gate 4) */}
        <AboutProximity onOpenBooking={handleOpenGeneralBooking} />

        {/* Fine Dining & Grand Imperial Banquets */}
        <DiningAndBanquets />

        {/* Interactive Guest Gallery & Instagram Feed */}
        <InteractiveGallery />

        {/* Verified Reviews Section */}
        <ReviewsSection />

        {/* Automated Newsletter Retention Engine */}
        <NewsletterRetention />
      </main>

      {/* Footer & Driving Directions */}
      <Footer />

      {/* Floating WhatsApp Concierge & Phone Dialer Bar */}
      <FloatingSocialBar onOpenBooking={handleOpenGeneralBooking} />

      {/* Multi-Step Room Booking & Payment Modal */}
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
