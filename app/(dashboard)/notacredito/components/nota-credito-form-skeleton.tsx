"use client"

function FieldSkeleton({ tall }: { tall?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 max-w-[40%] animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      <div
        className={`w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700 ${
          tall ? "h-[4.5rem]" : "h-10"
        }`}
      />
    </div>
  )
}

/** Espelha o layout dos campos do formulário de nota de crédito (modal). */
export function NotaCreditoFormSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <FieldSkeleton />
      <div className="grid gap-4 sm:grid-cols-3">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <FieldSkeleton />
      <FieldSkeleton />
      <FieldSkeleton tall />
      <FieldSkeleton />
      <FieldSkeleton />
    </div>
  )
}
