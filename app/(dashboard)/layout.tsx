import type { ReactNode } from "react"
import Sidebar from "@/app/components/layout/sidebar"
import { UserProvider } from "@/app/contexts/user-context"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 p-6 bg-gray-100">{children}</div>
      </div>
    </UserProvider>
  )
}