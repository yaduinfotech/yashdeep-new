import { useHotelData } from '../context/HotelDataContext';
import { Utensils, Clock, Sparkles } from 'lucide-react';

export default function Dining() {
  const { dining, hotelInfo } = useHotelData();
  const rawPhone = hotelInfo?.phone?.replace(/\D/g, '') || '918222020699';

  return (
    <section id="dining" className="py-20 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Culinary Excellence & Fine Dining</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-royal text-slate-900 dark:text-white">
            {dining.restaurantName || 'The Royal Feast Restaurant'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {dining.description || 'An opulent dining sanctuary beneath crystal chandeliers serving authentic royal delicacies alongside comforting global favorites.'}
          </p>
        </div>

        {/* Dining View */}
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
                {dining.restaurantName}
              </h3>
              <p className="text-xs text-slate-200 mt-1">
                {dining.cuisine}
              </p>
            </div>
          </div>

          {/* Dining details */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {dining.description}
            </p>

            {/* Meal timings */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Dining Service Hours
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <p className="text-slate-400 text-[11px]">Breakfast</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dining.timings?.breakfast || '7:00 – 10:30 AM'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Lunch</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dining.timings?.lunch || '12:30 – 3:30 PM'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Dinner</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dining.timings?.dinner || '7:00 – 11:30 PM'}</p>
                </div>
              </div>
            </div>

            {/* Chef specials list */}
            {dining.specials && dining.specials.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Featured Specialties
                </p>
                <div className="space-y-2.5">
                  {dining.specials.map((item, idx) => (
                    <div
                      key={item.id || idx}
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
            )}

            <div className="pt-2">
              <a
                href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(`Hello ${hotelInfo.name}, I would like to reserve a table at ${dining.restaurantName}.`)}`}
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
      </div>
    </section>
  );
}
