"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { getProfile, type User } from "@/app/services/auth-service"

export type ProfileUser = User & { name: string }

type UserContextValue = {
  user: ProfileUser | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProfile()
      setUser(data)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <UserContext.Provider value={{ user, loading, error, refresh }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error("Error")
  }
  return ctx
}
