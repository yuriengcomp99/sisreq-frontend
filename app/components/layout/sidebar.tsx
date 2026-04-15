"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FiHome, FiUser, FiLogOut, FiUsers, FiLayers, FiEdit } from "react-icons/fi"

export default function Sidebar() {
  const pathname = usePathname()

  function getLinkClass(path: string) {
    const isActive = pathname === path

    return `
      flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition
      ${
        isActive
          ? "bg-custom-blue text-white"
          : "text-gray-text hover:bg-gray-100"
      }
    `
  }

  function handleLogout() {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-[4px_0_10px_rgba(0,0,0,0.05)] p-4 flex flex-col">
      
      <h2 className="text-xl font-semibold mb-2 text-black text-center">
        1º Ten - Cavalcanti
      </h2>
      <p className="text-sm text-center mb-4 text-gray-text">
        Aprovisionador
      </p>

      <nav className="flex flex-col gap-2">

        <Link href="/dashboard" className={getLinkClass("/dashboard")}>
          <FiHome size={18} />
          Dashboard
        </Link>

        <Link href="/profile" className={getLinkClass("/profile")}>
          <FiUser size={18} />
          Profile
        </Link>

        <span className="text-xs font-semibold text-gray-400 mt-4 mb-1 px-2 uppercase tracking-wider">
          Admin
        </span>

        <Link href="/users/create" className={getLinkClass("/users/create")}>
          <FiUsers size={18} />
          Cadastrar Usuários
        </Link>

        <Link href="/setor/create" className={getLinkClass("/setor/create")}>
          <FiLayers size={18} />
          Cadastrar Setor
        </Link>

        <Link href="/update" className={getLinkClass("/update")}>
          <FiEdit size={18} />
          Atualizar Dados
        </Link>

      </nav>

      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition text-gray-text hover:bg-gray-100 w-full cursor-pointer"
        >
          <FiLogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  )
}