import { MapPin, Building2, Car, Compass, ShieldCheck, Phone, CalendarCheck } from 'lucide-react';
import { useHotelData } from '../context/HotelDataContext';

interface AboutProximityProps {
  onOpenBooking: () => void;
}

export default function AboutProximity({ onOpenBooking }: AboutProximityProps) {
  const { hotelInfo } = useHotelData();

  const proximityDistances = [
    {
      landmark: 'Honda Car India Plant (Gate No. 4)',
      distance: 'Directly Opposite (0 mins walk)',
      desc: 'Immediate walking access for Japanese delegates, engineers, and vendor auditors.',
    },
    {
      landmark: 'Karuli Industrial Area & RIICO Hub',
      distance: '2 mins drive (1.2 km)',
      desc: 'Surrounded by top automotive, precision tooling, and engineering manufacturing units.',
    },
    {
      landmark: 'Tapukrah Commercial District',
      distance: '5 mins drive (3.5 km)',
      desc: 'Convenient proximity to banks, local suppliers, and transport terminals.',
    },
    {
      landmark: 'Bhiwadi Central Industrial Cluster',
      distance: '15 mins drive (12 km)',
      desc: 'Seamless highway access to major corporate headquarters and logistics centers.',
    },
    {
      landmark: 'Rewari Junction & NH-48 (Delhi-Jaipur)',
      distance: '35 mins drive',
      desc: 'Direct highway connectivity for airport transit and interstate express travel.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Geo-targeted Proximity Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Compass className="w-4 h-4" />
              <span>Prime Industrial Corridor Location</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-royal leading-tight">
              About YashDeep Palace <br />
              <span className="text-amber-300 font-normal italic">
                Khuskheda, Tapukrah & Bhiwadi
              </span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              Conveniently located opposite <strong>Honda Car Gate No. 4 in the Karuli Industrial Area</strong>,
              YashDeep Palace is the undisputed top choice for business delegates, corporate travelers, plant auditors,
              and event guests in Khuskheda, Tapukrah, and Bhiwadi.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed">
              Designed to meet international executive hospitality standards, our hotel combines acoustic-insulated
              bedrooms, high-speed optical fiber Wi-Fi, and in-room dining with meeting spaces
              tailored for corporate summits and functions.
            </p>

            {/* Corporate Delegate Perks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>Corporate Billing & GST Invoices</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant GSTIN invoices tailored for corporate expense claims and travel desks.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Car className="w-4 h-4" />
                  <span>Secure Parking</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ample gated parking for 20+ vehicles with 24/7 CCTV surveillance.
                </p>
              </div>
            </div>

            {/* Dual CTAs for Direct Bookings & Phone Inquiries */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenBooking}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Book Direct Stay Online</span>
              </button>

              <a
                href={`tel:${hotelInfo.phone}`}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Front Desk ({hotelInfo.phone})</span>
              </a>
            </div>
          </div>

          {/* Right Column: Local Transit & Landmark Proximity Card */}
          <div className="lg:col-span-5 bg-slate-950 p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Local Landmark Proximity</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
                Karuli RIICO Belt
              </span>
            </div>

            <div className="space-y-4">
              {proximityDistances.map((item, idx) => (
                <div key={idx} className="space-y-0.5 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-200">{item.landmark}</span>
                    <span className="text-amber-300 font-mono text-[11px]">{item.distance}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official Address: {hotelInfo.address}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
