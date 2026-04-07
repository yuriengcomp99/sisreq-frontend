import Sidebar from "@/app/components/layout/sidebar"

export default function DashboardLayout({ children }: any) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6 bg-gray-100">
        {children}
      </div>
    </div>
  )
}