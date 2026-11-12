import { useState } from 'react';
import { Menu, X, Moon, Sun, CalendarCheck, Shield, Crown } from 'lucide-react';
import { UserProfile } from '../types/hotel';

interface NavbarProps {
  onOpenBooking: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: UserProfile | null;
  onOpenRewards: () => void;
  onOpenOwnerPortal: () => void;
}

export default function Navbar({
  onOpenBooking,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  onOpenRewards,
  onOpenOwnerPortal,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-20">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="font-royal text-xl sm:text-2xl font-bold tracking-wider text-slate-900 dark:text-amber-300 whitespace-nowrap shrink-0 transition-colors"
          >
            YASHDEEP PALACE
          </a>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-300">
            <a
              href="#rooms"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              Rooms & Suites
            </a>
            <a
              href="#dining"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              Dining & Banquets
            </a>
            <a
              href="#about"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              About & Proximity
            </a>
            <a
              href="#gallery"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              Guest Gallery
            </a>
            <a
              href="#contact"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              Location & Contact
            </a>
          </nav>

          {/* Zone 3: Actions - Rewards, Owner Portal, Theme & Primary CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Yashdeep Rewards Badge / Google Sign-In */}
            <button
              onClick={onOpenRewards}
              type="button"
              className="px-3 py-1.5 rounded-lg border border-amber-300/60 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="Open Yashdeep Rewards & Guest Dashboard"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              {currentUser ? (
                <span>
                  {currentUser.points} <span className="text-[10px] opacity-75">PTS</span>
                </span>
              ) : (
                <span className="hidden sm:inline">Yashdeep Rewards</span>
              )}
            </button>

            {/* Manager HMS Portal Trigger */}
            <button
              onClick={onOpenOwnerPortal}
              type="button"
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-300 hover:text-amber-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Hotel Management System (HMS / PMS)"
              aria-label="Open Hotel Management System"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline font-bold">Manager HMS</span>
            </button>

            {/* Dark Mode Switch */}
            <button
              onClick={onToggleDarkMode}
              type="button"
              aria-label="Toggle theme mode"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Booking CTA */}
            <button
              onClick={onOpenBooking}
              type="button"
              className="px-4 sm:px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-lg transition-all shadow-xs flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Book Stay</span>
            </button>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label="Toggle mobile menu"
              className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <a
            href="#rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400"
          >
            Rooms & Suites
          </a>
          <a
            href="#dining"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400"
          >
            Dining & Banquets
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400"
          >
            About & Honda Car Proximity
          </a>
          <a
            href="#gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400"
          >
            Guest Gallery
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400"
          >
            Location & Driving Directions
          </a>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRewards();
              }}
              type="button"
              className="w-full py-2.5 text-center text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-300/40"
            >
              👑 Yashdeep Rewards & Points ({currentUser?.points || 0} PTS)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOwnerPortal();
              }}
              type="button"
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              🛡️ Owner / Manager Portal (CMS & Rates)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
