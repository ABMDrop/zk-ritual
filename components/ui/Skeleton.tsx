export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg ${className}`}
      style={{ background: "rgba(255,252,248,0.06)" }} />
  );
}

export function PageSkeleton() {
  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-14 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}
