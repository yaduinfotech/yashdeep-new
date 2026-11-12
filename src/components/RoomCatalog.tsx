import { useState } from 'react';
import { Room } from '../types/hotel';
import { ROOMS_DATA } from '../data/hotelData';
import { Users, Maximize, Bed, Check, Sparkles, Star, ChevronRight, Info } from 'lucide-react';
import RoomCardSkeleton from './RoomCardSkeleton';
import { trackEvent } from '../utils/analytics';

interface RoomCatalogProps {
  isLoading: boolean;
  rooms?: Room[];
  onSelectRoomForBooking: (room: Room) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function RoomCatalog({
  isLoading,
  rooms = ROOMS_DATA,
  onSelectRoomForBooking,
  selectedCategory,
  onCategoryChange,
}: RoomCatalogProps) {
  const [activeModalRoom, setActiveModalRoom] = useState<Room | null>(null);

  const filteredRooms = rooms.filter((room) => {
    if (selectedCategory === 'all') return true;
    return room.category === selectedCategory;
  });

  const handleBookClick = (room: Room) => {
    trackEvent('select_room_book', 'click', `Room: ${room.name}, Price: ₹${room.price}`);
    onSelectRoomForBooking(room);
  };

  const handleOpenDetails = (room: Room) => {
    trackEvent('view_room_details', 'click', `Room: ${room.name}`);
    setActiveModalRoom(room);
  };

  return (
    <section id="rooms" className="py-20 bg-slate-50 dark:bg-slate-900/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Accommodations & Living</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-royal text-slate-900 dark:text-white">
              Luxury Rooms & Royal Suites
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Every room is meticulously appointed with acoustic soundproofing, orthopedic beds,
              high-speed optical Wi-Fi, and plush Rajasthani hospitality.
            </p>
          </div>

          {/* Interactive Category Segmented Control */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => onCategoryChange('all')}
              type="button"
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Rooms ({ROOMS_DATA.length})
            </button>
            <button
              onClick={() => onCategoryChange('deluxe')}
              type="button"
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'deluxe'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Deluxe Executive
            </button>
            <button
              onClick={() => onCategoryChange('suite')}
              type="button"
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'suite'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Palace Suites
            </button>
            <button
              onClick={() => onCategoryChange('family')}
              type="button"
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'family'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Family Suites
            </button>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <RoomCardSkeleton key={i} />)
            : filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Room Image Container */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={room.image}
                      alt={room.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback image handling
                        (e.target as HTMLImageElement).src = '/src/assets/images/hero_yashdeep_palace_1794500883865.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                    {/* Unboxed Status Kicker */}
                    {room.isPopular && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                        Most Booked
                      </span>
                    )}

                    {/* Star Rating Overlay */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white text-xs font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{room.rating.toFixed(1)}</span>
                      <span className="text-slate-300">({room.reviewsCount} reviews)</span>
                    </div>

                    {/* Available Count */}
                    <div className="absolute bottom-3 right-4 text-xs font-medium text-amber-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
                      {room.availableUnits} left today
                    </div>
                  </div>

                  {/* Room Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div>
                      {/* Quiet Unboxed Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Maximize className="w-3.5 h-3.5" />
                          {room.sizeSqFt} sq ft
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5" />
                          {room.bedType}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Up to {room.maxOccupancy} Guests
                        </span>
                      </div>

                      <h3 className="text-xl font-bold font-royal text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {room.name}
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-300/90 font-medium mt-0.5 mb-3">
                        {room.tagline}
                      </p>

                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {room.description}
                      </p>

                      {/* Amenities Snapshot */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                        {room.amenities.slice(0, 4).map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 truncate">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price and CTA Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                            ₹{room.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400 line-through tabular-nums">
                            ₹{room.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          per night · excl. taxes
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDetails(room)}
                          type="button"
                          className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => handleBookClick(room)}
                          type="button"
                          className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-lg transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <span>Reserve</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Room Details Modal */}
        {activeModalRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              <button
                onClick={() => setActiveModalRoom(null)}
                type="button"
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg"
              >
                ✕
              </button>

              <div className="aspect-16/9 rounded-xl overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800">
                <img
                  src={activeModalRoom.image}
                  alt={activeModalRoom.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>{activeModalRoom.sizeSqFt} sq ft</span>
                <span>·</span>
                <span>{activeModalRoom.bedType}</span>
                <span>·</span>
                <span>Max {activeModalRoom.maxOccupancy} Guests</span>
              </div>

              <h3 className="text-2xl font-bold font-royal text-slate-900 dark:text-white mb-2">
                {activeModalRoom.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {activeModalRoom.description}
              </p>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Included Room Amenities
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-8">
                {activeModalRoom.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    ₹{activeModalRoom.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">/ night</span>
                </div>
                <button
                  onClick={() => {
                    const r = activeModalRoom;
                    setActiveModalRoom(null);
                    handleBookClick(r);
                  }}
                  type="button"
                  className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md cursor-pointer"
                >
                  Proceed to Reserve Room
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
