"use client"

import { useCallback, useEffect, useState } from "react"
import { FiPlus } from "react-icons/fi"
import { UsersAdminListSkeleton } from "@/app/(dashboard)/useradmin/components/users-admin-list-skeleton"
import { UsersAdminTable } from "@/app/(dashboard)/useradmin/components/users-admin-table"
import { Button } from "@/app/components/ui/button"
import type { User } from "@/app/services/auth-service"
import { listAdminUsers } from "@/app/services/admin-users-service"

export default function UserAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const loadList = useCallback(async () => {
    const res = await listAdminUsers()
    setUsers(res.dados ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        await loadList()
      } catch (e) {
        console.error(e)
        if (!cancelled) setUsers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [loadList])

  const handleNewUser = useCallback(() => {
    // Modal de cadastro será implementada na sequência
  }, [])

  if (loading) {
    return <UsersAdminListSkeleton />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Users</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Lista de usuários do sistema (administrador).
          </p>
        </div>
        <Button
          type="button"
          icon={FiPlus}
          className="self-start sm:self-auto"
          onClick={handleNewUser}
        >
          Novo usuário
        </Button>
      </div>

      <UsersAdminTable data={users} />
    </div>
  )
}
