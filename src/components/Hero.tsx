import { useState } from 'react';
import { Calendar, Users, BedDouble, Search, Star, ShieldCheck, MapPin, Award } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface HeroProps {
  onCheckAvailability: (searchParams: {
    checkIn: string;
    checkOut: string;
    guests: number;
    category: string;
  }) => void;
}

export default function Hero({ onCheckAvailability }: HeroProps) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [category, setCategory] = useState('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('quick_booking_search', 'click', `CheckIn: ${checkIn}, CheckOut: ${checkOut}, Guests: ${guests}, Category: ${category}`);
    onCheckAvailability({ checkIn, checkOut, guests, category });
  };

  return (
    <section className="relative bg-slate-950 text-white overflow-hidden">
      {/* Background Hero Image with Measured Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_yashdeep_palace_1794500883865.jpg"
          alt="Yashdeep Palace illuminated luxury facade and fountain at twilight"
          className="w-full h-full object-cover object-center opacity-45 scale-102 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Editorial Subtitle & Location Kicker */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-widest text-amber-300 font-semibold mb-4">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Khuskheda · Opposite Honda Car Gate 4 · Rajasthan</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-royal leading-tight mb-6">
            Timeless Regal Luxury <br className="hidden sm:inline" />
            <span className="text-amber-300 font-normal italic">for Business & Celebration</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mb-10">
            Welcome to Yashdeep Palace—the premier luxury hotel and banquet sanctuary in the Bhiwadi–Khuskheda corridor.
            Experience soundproofed executive rooms, exquisite royal dining, and world-class conference facilities.
          </p>
        </div>

        {/* Quick Booking Check Bar */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white transition-all">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Check-in */}
            <div>
              <label htmlFor="hero-checkin" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Check-In
                </span>
              </label>
              <input
                id="hero-checkin"
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Check-out */}
            <div>
              <label htmlFor="hero-checkout" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Check-Out
                </span>
              </label>
              <input
                id="hero-checkout"
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Guests */}
            <div>
              <label htmlFor="hero-guests" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Guests
                </span>
              </label>
              <select
                id="hero-guests"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={1}>1 Adult (Solo Business)</option>
                <option value={2}>2 Adults (Standard)</option>
                <option value={3}>3 Adults (Triple / Suite)</option>
                <option value={4}>4+ Family / Group</option>
              </select>
            </div>

            {/* Room Category */}
            <div>
              <label htmlFor="hero-category" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Accommodation
                </span>
              </label>
              <select
                id="hero-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Rooms & Suites</option>
                <option value="deluxe">Deluxe Executive</option>
                <option value="suite">Royal Club Suite</option>
                <option value="family">Luxury Family Suite</option>
              </select>
            </div>

            {/* Action CTA */}
            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Check Rates</span>
              </button>
            </div>
          </form>
        </div>

        {/* Claim-to-Proof Adjacency Strip */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800 text-slate-300 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-300">
              <Star className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">4.8 / 5.0 Rating</p>
              <p className="text-slate-400 text-xs">340+ Verified Reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Prime Location</p>
              <p className="text-slate-400 text-xs">Opp. Honda Car Gate 4</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Secure Booking</p>
              <p className="text-slate-400 text-xs">Instant UPI & Cards</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Best Hospitality</p>
              <p className="text-slate-400 text-xs">Khuskheda Corridors</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
