"use client"

function FieldSkeleton({ tall }: { tall?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="h-4 w-28 max-w-[45%] animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      <div
        className={`w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700 ${
          tall ? "h-[4.5rem]" : "h-10"
        }`}
      />
    </div>
  )
}

/** Layout dos campos do formulário de usuário (modal admin). */
export function UserAdminFormSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <FieldSkeleton />
      <FieldSkeleton />
      <FieldSkeleton />
      <FieldSkeleton />
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <FieldSkeleton />
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
    </div>
  )
}
