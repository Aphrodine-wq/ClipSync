/**
 * Skeleton Loader for Clip List
 * Shows loading placeholders while clips are being fetched
 */

const ClipListSkeleton = () => {
  return (
    <div className="space-y-0">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-2xl mb-3 bg-white border border-zinc-200 animate-shimmer"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-16 h-5 bg-zinc-200 rounded-full"></div>
              <div className="w-4 h-4 bg-zinc-200 rounded"></div>
            </div>
            <div className="w-20 h-4 bg-zinc-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-zinc-200 rounded"></div>
            <div className="w-3/4 h-4 bg-zinc-200 rounded"></div>
            <div className="w-1/2 h-4 bg-zinc-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClipListSkeleton;

