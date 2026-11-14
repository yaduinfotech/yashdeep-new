import { useHotelData } from '../context/HotelDataContext';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const { hotelInfo } = useHotelData();
  return (
    <footer id="contact" className="bg-slate-950 text-slate-300 border-t border-slate-800 transition-colors">
      {/* Location & Map Direction Highlight */}
      <div className="border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Location & Address
                </p>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {hotelInfo.address}
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(hotelInfo.name + ' ' + hotelInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:underline mt-2 inline-block font-semibold"
                >
                  Get Driving Directions on Google Maps →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Reservations & Concierge
                </p>
                <p className="text-sm text-slate-200 font-medium">
                  {hotelInfo.phone}
                </p>
                {hotelInfo.phoneAlt && (
                  <p className="text-sm text-slate-400">
                    {hotelInfo.phoneAlt}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Email: {hotelInfo.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Palace Timings & Policies
                </p>
                <p className="text-sm text-slate-200 font-medium">
                  Check-in: from {hotelInfo.checkInTime}
                </p>
                <p className="text-sm text-slate-200 font-medium">
                  Check-out: by {hotelInfo.checkOutTime}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  24/7 Front Desk, Security & In-Room Dining
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="font-royal text-xl font-bold tracking-wider text-white uppercase">
              {hotelInfo.name}
            </span>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {hotelInfo.subtitle} in Khuskheda, Bhiwadi-Alwar corridor, Rajasthan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <a href="#rooms" className="hover:text-white transition-colors">Rooms & Suites</a>
            <a href="#dining" className="hover:text-white transition-colors">The Royal Feast</a>
            <a href="#gallery" className="hover:text-white transition-colors">Guest Gallery</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Yashdeep Palace. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL Encrypted Direct Booking Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
