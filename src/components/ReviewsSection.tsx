import { useState } from 'react';
import { useHotelData } from '../context/HotelDataContext';
import { Review } from '../types/hotel';
import { Star, CheckCircle, MessageSquarePlus, Sparkles, X } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export default function ReviewsSection() {
  const { reviews, addReview } = useHotelData();
  const [filterType, setFilterType] = useState<string>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // New review form
  const [newAuthor, setNewAuthor] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newStayType, setNewStayType] = useState<'Business' | 'Family' | 'Wedding & Event' | 'Couple'>('Business');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '4.8';

  const filteredReviews = reviews.filter((r) => {
    if (filterType === 'all') return true;
    return r.stayType.toLowerCase().includes(filterType.toLowerCase());
  });

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await addReview({
      author: newAuthor,
      city: newCity || 'Rajasthan',
      rating: newRating,
      stayType: newStayType,
      comment: newComment,
      date: 'Just now',
      verified: true,
    });
    trackEvent('review_submitted', 'interaction', `Author: ${newAuthor}, Rating: ${newRating}`);
    setIsWriteModalOpen(false);
    setNewAuthor('');
    setNewCity('');
    setNewComment('');
  };


  return (
    <section className="py-20 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Guest Feedback</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-royal text-slate-900 dark:text-white">
              Endorsed by Executives & Families
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{averageRating} / 5.0</span>
              <span className="text-xs text-slate-500">· Over {reviews.length} Verified Reviews</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter segmented buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === 'all'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('business')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === 'business'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Business
              </button>
              <button
                type="button"
                onClick={() => setFilterType('wedding')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === 'wedding'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Weddings
              </button>
            </div>

            <button
              onClick={() => setIsWriteModalOpen(true)}
              type="button"
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Write Review</span>
            </button>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rev.author}
                    </h3>
                    {rev.verified && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle className="w-3 h-3" /> Verified Guest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{rev.city}</span>
                    <span>·</span>
                    <span className="text-amber-600 dark:text-amber-400">{rev.stayType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{rev.comment}"
              </p>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                {rev.date}
              </div>
            </div>
          ))}
        </div>

        {/* Write Review Modal */}
        {isWriteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold font-royal text-slate-900 dark:text-white mb-1">
                Share Your Experience
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Your feedback helps us continually elevate our regal standards.
              </p>

              <form onSubmit={handleAddReview} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Amit Verma"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="e.g. New Delhi"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Stay Category
                    </label>
                    <select
                      value={newStayType}
                      onChange={(e) => setNewStayType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="Business">Business Trip</option>
                      <option value="Family">Family Holiday</option>
                      <option value="Corporate Gathering">Corporate Gathering</option>
                      <option value="Couple">Couple Stay</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Review Comments
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tell us about the room, dining, staff, or amenities..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase tracking-wider rounded-lg shadow-md cursor-pointer"
                >
                  Submit Verified Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
