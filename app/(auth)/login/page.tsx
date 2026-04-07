"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { login } from "@/app/services/auth-service"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    try {
      setLoading(true)

      const data = await login({ email, password })

      localStorage.setItem("token", data.accessToken)

      await Swal.fire({
        icon: "success",
        title: "Login successful",
        text: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      })

      router.push("/dashboard")
      
    } catch (err: any) {

      await Swal.fire({
        icon: "error",
        title: "Login failed",
        text: err.message || "Invalid credentials",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Email"
        placeholder="Digite seu email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        label="Senha"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button onClick={handleLogin} disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-sm text-center">
        Não tem conta?{" "}
        <a href="/register" className="text-blue-500">
          Criar conta
        </a>
      </p>
    </div>
  )
}