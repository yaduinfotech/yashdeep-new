import { useState } from 'react';
import { DINING_HIGHLIGHTS, BANQUET_HIGHLIGHTS } from '../data/hotelData';
import { Utensils, Users, Clock, Check, Sparkles, MessageCircle, Send } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export default function DiningAndBanquets() {
  const [activeTab, setActiveTab] = useState<'dining' | 'banquets'>('dining');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryDate, setInquiryDate] = useState('');
  const [inquiryGuests, setInquiryGuests] = useState('100');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('banquet_inquiry_submitted', 'interaction', `Name: ${inquiryName}, Type: ${activeTab}, Guests: ${inquiryGuests}`);
    setInquirySuccess(true);
    setTimeout(() => setInquirySuccess(false), 5000);
    setInquiryName('');
    setInquiryPhone('');
  };

  return (
    <section id="dining" className="py-20 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Royal Hospitality & Gatherings</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-royal text-slate-900 dark:text-white">
            Fine Dining & Grand Celebrations
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Whether savoring authentic heritage recipes under crystal chandeliers or hosting a milestone
            wedding in the Khuskheda corridor, Yashdeep Palace provides unmatched grandeur.
          </p>

          {/* Tab Selector */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('dining')}
              type="button"
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'dining'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              The Royal Feast Restaurant
            </button>
            <button
              onClick={() => setActiveTab('banquets')}
              type="button"
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'banquets'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Imperial Banquets & Events
            </button>
          </div>
        </div>

        {/* Tab 1: Dining View */}
        {activeTab === 'dining' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual carrier */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative aspect-16/10">
              <img
                src="/src/assets/images/restaurant_royal_feast_1794500885409.jpg"
                alt="The Royal Feast fine dining restaurant interior with chandeliers"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
                  Signature In-House Restaurant
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-royal">
                  {DINING_HIGHLIGHTS.restaurantName}
                </h3>
                <p className="text-xs text-slate-200 mt-1">
                  {DINING_HIGHLIGHTS.cuisine}
                </p>
              </div>
            </div>

            {/* Dining details */}
            <div className="lg:col-span-5 space-y-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {DINING_HIGHLIGHTS.description}
              </p>

              {/* Meal timings */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Dining Service Hours
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <p className="text-slate-400 text-[11px]">Breakfast</p>
                    <p className="font-semibold text-slate-900 dark:text-white">7:00 – 10:30 AM</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">Lunch</p>
                    <p className="font-semibold text-slate-900 dark:text-white">12:30 – 3:30 PM</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">Dinner</p>
                    <p className="font-semibold text-slate-900 dark:text-white">7:00 – 11:30 PM</p>
                  </div>
                </div>
              </div>

              {/* Chef specials list */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Featured Specialties
                </p>
                <div className="space-y-2.5">
                  {DINING_HIGHLIGHTS.specials.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400">{item.category}</p>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/918222020699?text=Hello%20Yashdeep%20Palace,%20I%20would%20like%20to%20reserve%20a%20table%20at%20The%20Royal%20Feast."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Reserve a Table on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Banquets & Events View */}
        {activeTab === 'banquets' && (
          <div id="banquets" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual carrier */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative aspect-16/10">
              <img
                src="/src/assets/images/palace_banquet_hall_1794500885387.jpg"
                alt="Imperial Banquet Hall with crystal chandeliers and stage"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
                  Grand Venues & Celebrations
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-royal">
                  {BANQUET_HIGHLIGHTS.venueName}
                </h3>
                <p className="text-xs text-slate-200 mt-1">
                  Capacity: {BANQUET_HIGHLIGHTS.capacity}
                </p>
              </div>
            </div>

            {/* Banquet inquiry form & specifications */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold font-royal text-slate-900 dark:text-white mb-2">
                Banquet & Wedding Inquiries
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Host your dream wedding, corporate summit, or dealer meet opposite Honda Car Gate 4.
              </p>

              {inquirySuccess ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center space-y-2">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Inquiry Received!
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Our event director will contact you within 2 hours with customized date availability and menus.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Organizer Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91..."
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tentative Date
                      </label>
                      <input
                        type="date"
                        required
                        value={inquiryDate}
                        onChange={(e) => setInquiryDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Expected Gathering Size
                    </label>
                    <select
                      value={inquiryGuests}
                      onChange={(e) => setInquiryGuests(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="50-100">50 – 100 Guests (Corporate / Seminar)</option>
                      <option value="100-300">100 – 300 Guests (Sangeet / Anniversary)</option>
                      <option value="300-800">300 – 800+ Guests (Grand Wedding / Summit)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Banquet Proposal</span>
                  </button>
                </form>
              )}

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500">
                {BANQUET_HIGHLIGHTS.features.slice(0, 3).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
