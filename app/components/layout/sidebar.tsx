"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FiHome, FiUser, FiLogOut } from "react-icons/fi"

export default function Sidebar() {
  const pathname = usePathname()

  function getLinkClass(path: string) {
    const isActive = pathname === path

    return `
      flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition
      ${isActive 
        ? "bg-primary text-white" 
        : "text-white hover:bg-gray-100 hover:text-primary"}
    `
  }

  return (
    <div className="w-64 bg-primary border-r border-gray-200 shadow-sm p-4 flex flex-col">
      
      <h2 className="text-xl font-semibold mb-8 text-white text-center">
        Auth FullStack
      </h2>

      <nav className="flex flex-col gap-2">

        <Link href="/dashboard" className={getLinkClass("/dashboard")}>
          <FiHome size={18} />
          Dashboard
        </Link>

        <Link href="/profile" className={getLinkClass("/profile")}>
          <FiUser size={18} />
          Profile
        </Link>

      </nav>

      <div className="mt-auto pt-6">
        <button
          className="w-full flex items-center gap-3 text-sm font-semibold text-red-500 bg-red-50 px-3 py-2 rounded-md transition"
          onClick={() => {
            localStorage.removeItem("token")
            window.location.href = "/login"
          }}
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}