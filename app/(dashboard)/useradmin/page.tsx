"use client"

import { useCallback, useEffect, useState } from "react"
import { FiPlus } from "react-icons/fi"
import { UserAdminFormModal } from "@/app/(dashboard)/useradmin/components/user-admin-form-modal"
import { UsersAdminListSkeleton } from "@/app/(dashboard)/useradmin/components/users-admin-list-skeleton"
import { UsersAdminTable } from "@/app/(dashboard)/useradmin/components/users-admin-table"
import { Button } from "@/app/components/ui/button"
import type { User } from "@/app/services/auth-service"
import { listAdminUsers } from "@/app/services/admin-users-service"

type FormModalState = {
  open: boolean
  userId: string | null
}

const closedFormModal: FormModalState = {
  open: false,
  userId: null,
}

export default function UserAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [formModal, setFormModal] = useState<FormModalState>(closedFormModal)

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

  const openCreateModal = useCallback(() => {
    setFormModal({ open: true, userId: null })
  }, [])

  const handleEdit = useCallback((row: User) => {
    setFormModal({ open: true, userId: row.id })
  }, [])

  const handleSaved = useCallback((user: User, isCreate: boolean) => {
    if (isCreate) {
      setUsers((prev) =>
        [...prev, user].sort((a, b) =>
          (a.first_name ?? "").localeCompare(b.first_name ?? "", "pt-BR")
        )
      )
    } else {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)))
    }
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
          onClick={openCreateModal}
        >
          Novo usuário
        </Button>
      </div>

      <UsersAdminTable data={users} onEdit={handleEdit} />

      <UserAdminFormModal
        open={formModal.open}
        onClose={() => setFormModal(closedFormModal)}
        userId={formModal.userId}
        onSaved={handleSaved}
      />
    </div>
  )
}
