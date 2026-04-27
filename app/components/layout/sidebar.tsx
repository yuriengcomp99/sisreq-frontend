"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CircleDollarSign,
  FileCheckCorner,
  FileSearchCorner,
  ListCheck,
} from "lucide-react"
import { FiHome, FiLogOut, FiUsers, FiLayers, FiEdit } from "react-icons/fi"
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
        : path === "/designation"
          ? pathname === "/designation" || pathname.startsWith("/designation/")
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
    <div
      className="
      sticky top-0 flex h-screen min-h-0 w-64 flex-col
      border-r border-gray-200 bg-white p-4
      shadow-[4px_0_10px_rgba(0,0,0,0.05)]
    "
    >

      <div className="mb-5 flex w-full shrink-0 justify-center px-1">
        <div className="relative h-28 w-full max-w-[14rem] shrink-0">
          <Image
            src="/logo_normal.png"
            alt="Logo"
            fill
            className="object-contain object-center"
            sizes="224px"
            priority
          />
        </div>
      </div>

      <div className="mb-4 min-h-[3.5rem] shrink-0 text-center">
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

      <nav
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden pr-1"
        aria-label="Menu principal"
      >

        <Link href="/dashboard" className={getLinkClass("/dashboard")}>
          <FiHome size={18} />
          Dashboard
        </Link>

        <Link href="/pregoes" className={getLinkClass("/pregoes")}>
          <ListCheck size={18} className="shrink-0" aria-hidden />
          Pregões
        </Link>

        <Link href="/capacidade" className={getLinkClass("/capacidade")}>
          <FileSearchCorner size={18} className="shrink-0" aria-hidden />
          Capacidade de Empenho
        </Link>

        <Link href="/notacredito" className={getLinkClass("/notacredito")}>
          <CircleDollarSign size={18} className="shrink-0" aria-hidden />
          Nota de Crédito
        </Link>

        <Link href="/requisicao" className={getLinkClass("/requisicao")}>
          <FileCheckCorner size={18} className="shrink-0" aria-hidden />
          Requisição
        </Link>

        {!loading && isAdminRole(user) && (
          <>
            <span className="text-xs font-semibold text-gray-400 mt-4 mb-1 px-2 uppercase tracking-wider">
              Admin
            </span>

            <Link href="/useradmin" className={getLinkClass("/useradmin")}>
              <FiUsers size={18} />
              Cadastrar Usuários
            </Link>

            <Link href="/designation" className={getLinkClass("/designation")}>
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

      <div className="shrink-0 border-t border-gray-100 pt-4 dark:border-zinc-800">
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