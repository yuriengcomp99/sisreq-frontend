const HEADER_CELLS = 5
const ROWS = 6

export function UsersAdminListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-48 max-w-full animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-full max-w-lg animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-10 w-44 animate-pulse rounded-md bg-gray-200 sm:shrink-0" />
      </div>
      <div className="space-y-4 rounded-xl">
        <div className="flex justify-end">
          <div className="h-9 w-full max-w-xs animate-pulse rounded-md border border-transparent bg-gray-200" />
        </div>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            {Array.from({ length: HEADER_CELLS }).map((_, i) => (
              <div
                key={i}
                className="h-3.5 min-w-[4rem] flex-1 animate-pulse rounded bg-gray-200 dark:bg-zinc-700 first:max-w-[140px] last:max-w-[100px] last:flex-none"
              />
            ))}
          </div>
          {Array.from({ length: ROWS }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-t border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              {Array.from({ length: HEADER_CELLS }).map((_, j) => (
                <div
                  key={j}
                  className="h-4 min-w-[3rem] flex-1 animate-pulse rounded bg-gray-200 dark:bg-zinc-800 first:max-w-[140px] last:max-w-[88px] last:flex-none"
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-10 shrink-0 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
