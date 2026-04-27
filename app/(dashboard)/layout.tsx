import type { ReactNode } from "react"
import Sidebar from "@/app/components/layout/sidebar"
import Topbar from "@/app/components/layout/topbar"
import { UserProvider } from "@/app/contexts/user-context"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-gray-100">
          <Topbar />
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </div>
      </div>
    </UserProvider>
  )
}