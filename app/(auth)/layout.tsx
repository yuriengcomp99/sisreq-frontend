import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div
        className="w-1/2 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bcmsbackground.jpg')" }}
      />
      <div className="flex w-1/2 items-center justify-center bg-gray-easy px-12 py-6">
        {children}
      </div>
    </div>
  )
}