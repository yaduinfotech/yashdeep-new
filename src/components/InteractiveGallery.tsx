import { useState } from 'react';
import { useHotelData } from '../context/HotelDataContext';
import { GalleryItem } from '../types/hotel';
import { Heart, Instagram, Sparkles, ZoomIn, X, ExternalLink } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export default function InteractiveGallery() {
  const { gallery } = useHotelData();
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedMap[id];
    setLikedMap((prev) => ({ ...prev, [id]: !isLiked }));
    trackEvent('gallery_like_click', 'click', `PostId: ${id}, NowLiked: ${!isLiked}`);
  };


  const handleOpenPhoto = (item: GalleryItem) => {
    setSelectedPhoto(item);
    trackEvent('gallery_photo_view', 'view', `PostId: ${item.id}`);
  };

  return (
    <section id="gallery" className="py-20 bg-slate-50 dark:bg-slate-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              <Instagram className="w-3.5 h-3.5" />
              <span>Community & Guest Moments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-royal text-slate-900 dark:text-white">
              #YashdeepPalace on Instagram
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Real guest impressions, wedding memories, and culinary highlights shared by our community.
              Tag your stories with #YashdeepPalace to be featured.
            </p>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start md:self-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <Instagram className="w-4 h-4" />
            <span>Follow @yashdeeppalace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Gallery Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {gallery.map((item) => {
            const isLiked = likedMap[item.id];
            const displayLikes = isLiked ? item.likes + 1 : item.likes;
            return (
              <div
                key={item.id}
                onClick={() => handleOpenPhoto(item)}
                className="group relative rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 aspect-square shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 text-white" />

                {/* Top Tag & Zoom icon */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs">
                  <span className="text-[10px] font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-xs">
                    {item.tag}
                  </span>
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>

                {/* Bottom interactive heart & likes */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs">
                  <span className="text-[11px] truncate max-w-[100px] text-slate-200">
                    {item.handle}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleLike(item.id, e)}
                    className="flex items-center gap-1 bg-black/50 hover:bg-black/80 px-2 py-1 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${
                        isLiked ? 'fill-red-500 text-red-500' : 'text-white'
                      }`}
                    />
                    <span className="text-[10px] font-bold tabular-nums text-white">
                      {displayLikes}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Photo Lightbox Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="bg-slate-900 rounded-2xl max-w-2xl w-full overflow-hidden border border-slate-800 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                type="button"
                className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-lg bg-black/40 backdrop-blur-xs"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-16/10 bg-slate-950">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-amber-400">{selectedPhoto.handle}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{selectedPhoto.tag}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300">
                    <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="tabular-nums font-bold">{selectedPhoto.likes} Likes</span>
                  </div>
                </div>

                <p className="text-sm text-slate-200 font-medium">
                  {selectedPhoto.title}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
