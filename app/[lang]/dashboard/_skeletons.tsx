export function TableSkeleton({ rows = 8 }: { rows?: number } = {}) {
  return (
    <div className="rounded-xl border">
      <div className="border-b px-5 py-3">
        <div className="bg-muted h-4 w-40 animate-pulse rounded" />
      </div>
      <ul className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted h-5 w-12 animate-pulse rounded" />
              <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
