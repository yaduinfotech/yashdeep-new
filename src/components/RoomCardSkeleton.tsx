export default function RoomCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full shadow-xs animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-4/3 w-full bg-slate-200 dark:bg-slate-800 skeleton-shimmer">
        <div className="absolute top-3 left-3 w-20 h-5 bg-slate-300 dark:bg-slate-700 rounded-sm" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Metadata line */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-16 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-20 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-14 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm" />
          </div>

          {/* Title */}
          <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded-sm mb-2" />
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800/60 rounded-sm mb-4" />

          {/* Amenities grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="w-28 h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-sm" />
            <div className="w-24 h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-sm" />
            <div className="w-20 h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-sm" />
            <div className="w-26 h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-sm" />
          </div>
        </div>

        {/* Price and CTA footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="w-12 h-3 bg-slate-200 dark:bg-slate-800 rounded-sm mb-1" />
            <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-sm" />
          </div>
          <div className="w-28 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
