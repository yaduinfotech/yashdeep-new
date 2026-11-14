import { useState } from 'react';
import { Calendar, Users, BedDouble, Search, Star, ShieldCheck, MapPin, Award } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { useHotelData } from '../context/HotelDataContext';

interface HeroProps {
  onCheckAvailability: (searchParams: {
    checkIn: string;
    checkOut: string;
    guests: number;
    category: string;
    no_of_rooms: number;
  }) => void;
}

export default function Hero({ onCheckAvailability }: HeroProps) {
  const { hotelInfo } = useHotelData();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [category, setCategory] = useState('all');
  const [no_of_rooms, setNoOfRooms] = useState(1);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('quick_booking_search', 'click', `CheckIn: ${checkIn}, CheckOut: ${checkOut}, Guests: ${guests}, Category: ${category}`);
    onCheckAvailability({ checkIn, checkOut, guests, category, no_of_rooms });
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
            <span>Khuskheda · {hotelInfo.highlights?.[0] || 'Opposite Honda Car Gate 4'} · Rajasthan</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-royal leading-tight mb-6">
            Timeless Luxury <br className="hidden sm:inline" />
            <span className="text-amber-300 font-normal italic">for Business & Restful Comfort</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mb-10">
            Welcome to {hotelInfo.name || 'Yashdeep Palace'}—the premier luxury hotel and restaurant in the Bhiwadi–Khuskheda corridor.
            Experience soundproofed executive rooms, authentic fine dining, and bespoke hospitality.
          </p>
        </div>
        {/* Claim-to-Proof Adjacency Strip */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800 text-slate-300 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-300">
              <Star className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{hotelInfo.rating || 4.8} / 5.0 Rating</p>
              <p className="text-slate-400 text-xs">{hotelInfo.totalReviews || 340}+ Verified Reviews</p>
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
              {/* <p className="text-slate-400 text-xs">Instant UPI & Cards</p> */}
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
