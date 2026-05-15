export function GameGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] animate-pulse rounded-xl bg-zinc-900 ring-1 ring-white/5"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}
