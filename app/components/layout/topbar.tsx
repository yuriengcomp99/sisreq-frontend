"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserRound } from "lucide-react"
import { getUnreadNotificationCount } from "@/app/services/notifications-service"
import { subscribeNotificationsWebSocketWithSession } from "@/app/services/ws-gateway-service"
import NotificationBellMenu from "@/app/components/layout/notification-bell-menu"

function normalizeCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

export default function Topbar() {
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const profileWrapRef = useRef<HTMLDivElement>(null)

  const refreshUnreadCount = useCallback(() => {
    getUnreadNotificationCount()
      .then((res) => {
        if (res.sucesso && res.dados) {
          setUnreadCount(normalizeCount(res.dados.count))
        } else {
          setUnreadCount(0)
        }
      })
      .catch(() => setUnreadCount(0))
  }, [])

  useEffect(() => {
    refreshUnreadCount()
  }, [refreshUnreadCount])

  useEffect(() => {
    return subscribeNotificationsWebSocketWithSession({
      onUnreadCount: (count) => {
        setUnreadCount(normalizeCount(count))
      },
    })
  }, [])

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        refreshUnreadCount()
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", refreshUnreadCount)
    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", refreshUnreadCount)
    }
  }, [refreshUnreadCount])

  useEffect(() => {
    queueMicrotask(() => setProfileOpen(false))
  }, [pathname])

  useEffect(() => {
    if (!profileOpen) return
    function handlePointerDown(e: PointerEvent) {
      const el = profileWrapRef.current
      if (el && !el.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [profileOpen])

  return (
    <header
      className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-end gap-2 border-b border-l-0 border-gray-200 bg-white px-6 shadow-[2px_2px_10px_rgba(0,0,0,0.06)]"
      role="banner"
    >
      <div className="flex items-center gap-1">
        <NotificationBellMenu
          unreadCount={unreadCount}
          pathname={pathname}
          onUnreadCountUpdated={refreshUnreadCount}
        />

        <div className="relative" ref={profileWrapRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-gray-text transition hover:bg-gray-100 hover:text-black"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Menu do perfil"
          >
            <UserRound className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>

          {profileOpen ? (
            <div
              className="absolute right-0 top-full mt-1 w-48 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              role="menu"
              aria-label="Ações do perfil"
            >
              <Link
                href="/profile"
                role="menuitem"
                className="block px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                onClick={() => setProfileOpen(false)}
              >
                Editar perfil
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
