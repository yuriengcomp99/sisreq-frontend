"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bell, Inbox } from "lucide-react"
import {
  getUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/app/services/notifications-service"

function NotificationListSkeleton() {
  return (
    <div
      className="divide-y divide-gray-100 py-1"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2 px-3 py-3">
          <div className="h-3 w-[92%] animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-[68%] animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

type NotificationBellMenuProps = {
  /** Contador do sino (GET unread-count), mantido pela topbar. */
  unreadCount: number
  /** Atualiza o contador do sino na topbar (ex.: após marcar como lida). */
  onUnreadCountUpdated?: () => void
  pathname: string
}

export default function NotificationBellMenu({
  unreadCount,
  onUnreadCountUpdated,
  pathname,
}: NotificationBellMenuProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)
  /** Esconde o número do sino enquanto o painel está aberto (sincronizado com `open`). */
  const [suppressBellNumber, setSuppressBellNumber] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setSuppressBellNumber(true)
      return
    }
    setSuppressBellNumber(false)
  }, [open])

  const refetchListOnly = useCallback(() => {
    setLoading(true)
    getUnreadNotifications()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  /**
   * Ao abrir o painel: primeiro carrega as não lidas para exibir o texto;
   * só depois marca todas como lidas no servidor e atualiza o contador (sem apagar a lista na tela).
   */
  const runOpenPanelFlow = useCallback(async () => {
    setLoading(true)
    setItems([])
    try {
      const list = await getUnreadNotifications()
      setItems(Array.isArray(list) ? list : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }

    try {
      await markAllNotificationsRead()
    } catch {
      /* servidor pode falhar; lista já está visível */
    } finally {
      onUnreadCountUpdated?.()
    }
  }, [onUnreadCountUpdated])

  useEffect(() => {
    queueMicrotask(() => setOpen(false))
  }, [pathname])

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      const el = wrapRef.current
      if (el && !el.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [open])

  async function handleItemClick(item: NotificationItem) {
    const id = String(item.id)
    if (markingId) return
    setMarkingId(id)
    try {
      await markNotificationRead(item.id)
      setItems((prev) => prev.filter((x) => String(x.id) !== id))
      onUnreadCountUpdated?.()
    } catch {
      refetchListOnly()
      onUnreadCountUpdated?.()
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((wasOpen) => {
            if (wasOpen) {
              setSuppressBellNumber(false)
              setLoading(false)
              setItems([])
              return false
            }
            setSuppressBellNumber(true)
            setLoading(true)
            setItems([])
            void runOpenPanelFlow()
            return true
          })
        }}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-gray-text transition hover:bg-gray-100 hover:text-black"
        aria-label="Notificações"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" strokeWidth={2} aria-hidden />
        {!suppressBellNumber && unreadCount > 0 ? (
          <span
            className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white"
            aria-live="polite"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-40 mt-1 w-[min(100vw-2rem,22rem)] max-w-md overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
          role="region"
          aria-label="Notificações"
        >
          <div className="border-b border-gray-100 px-3 py-2 text-sm font-semibold text-gray-800">
            Notificação
          </div>
          <div
            className="max-h-80 overflow-y-auto"
            aria-busy={loading}
          >
            {loading ? (
              <NotificationListSkeleton />
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-3 py-8 text-center text-sm text-gray-text">
                <Inbox className="h-10 w-10 text-gray-300" strokeWidth={1.5} aria-hidden />
                <span>Nenhuma notificação</span>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  const id = String(item.id)
                  const busy = markingId === id
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleItemClick(item)}
                        className="w-full cursor-pointer px-3 py-3 text-left text-sm text-gray-800 transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
                      >
                        {item.message}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
