"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FiHome, FiUser, FiLogOut, FiUsers, FiLayers, FiEdit } from "react-icons/fi"
import { logout } from "@/app/services/auth-service"
import { useUser, type ProfileUser } from "@/app/contexts/user-context"

function sidebarHeadline(user: ProfileUser | null) {
  if (!user) return ""
  const parts = [user.graduation, user.army_name].filter(Boolean)
  return parts.length ? parts.join(" ") : user.first_name
}

function sidebarRole(user: ProfileUser | null) {
  if (!user) return ""
  return user.designation?.position || user.role || ""
}

function isAdminRole(user: ProfileUser | null) {
  return user?.role?.toUpperCase() === "ADMIN"
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, loading } = useUser()

  function getLinkClass(path: string) {
    const isActive =
      path === "/requisicao"
        ? pathname === "/requisicao" || pathname.startsWith("/requisicao/")
        : pathname === path

    return `
      flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition
      ${isActive
        ? "bg-custom-blue text-white"
        : "text-gray-text hover:bg-gray-100"
      }
    `
  }

  async function handleLogout() {
    await logout()
    window.location.href = "/login"
  }

  return (
    <div className="
      w-64 
      h-screen 
      bg-white 
      border-r 
      border-gray-200 
      shadow-[4px_0_10px_rgba(0,0,0,0.05)] 
      p-4 
      flex 
      flex-col
      sticky top-0
    ">

      <div className="mb-4 min-h-[3.5rem] text-center">
        {loading ? (
          <>
            <div className="mx-auto mb-2 h-7 w-44 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-100" />
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-black">
              {sidebarHeadline(user) || "—"}
            </h2>
            <p className="text-sm text-gray-text">
              {sidebarRole(user) || "—"}
            </p>
          </>
        )}
      </div>

      <nav className="flex flex-col gap-2">

        <Link href="/dashboard" className={getLinkClass("/dashboard")}>
          <FiHome size={18} />
          Dashboard
        </Link>

        <Link href="/pregoes" className={getLinkClass("/pregoes")}>
          <FiUser size={18} />
          Pregões
        </Link>

        <Link href="/capacidade" className={getLinkClass("/capacidade")}>
          <FiUser size={18} />
          Capacidade de Empenho
        </Link>

        <Link href="/notacredito" className={getLinkClass("/notacredito")}>
          <FiUser size={18} />
          Nota de Crédito
        </Link>

        <Link href="/requisicao" className={getLinkClass("/requisicao")}>
          <FiUser size={18} />
          Requisição
        </Link>

        <Link href="/profile" className={getLinkClass("/profile")}>
          <FiUser size={18} />
          Perfil
        </Link>

        {!loading && isAdminRole(user) && (
          <>
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
          </>
        )}

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