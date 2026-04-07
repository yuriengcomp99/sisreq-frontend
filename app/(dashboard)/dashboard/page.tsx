"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProfile } from "@/app/services/user-service"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getProfile()
        setUser(data)
      } catch (error) {
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  if (loading || !user) {
    return <p>Carregando...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Bem Vindo, {user.name}
      </h1>

      <div className="bg-white p-6 rounded shadow">
        <p className="text-gray-600">
          Você está logado
        </p>
      </div>
    </div>
  )
}