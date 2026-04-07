"use client"

import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { useState } from "react"
import { register, login } from "@/app/services/auth-service"
import Swal from "sweetalert2"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    try {
      setLoading(true)
      const data = await register({ name, email, password})

      await Swal.fire({
        icon: "success",
        title: "Register successful",
        text: "Welcome!",
        timer: 1500,
        showConfirmButton: false,
      })

      const loginUser = await login({ email, password })

      localStorage.setItem("token", loginUser.accessToken)

      router.push("/dashboard")

    } catch (err: any) {
    
      await Swal.fire({
        icon: "error",
        title: "Register failed",
        text: err.message || "Register User Error",
      })
      
    } finally {
      setLoading(false)
    }
   
  }

  return (
    <div className="flex flex-col gap-4">
      <Input 
        label="Nome" 
        onChange={(e) => setName(e.target.value)}
      />
      <Input 
        label="Email" 
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input 
        label="Senha" 
        type="password" 
        onChange={(e) => setPassword(e.target.value) }
      />

      <Button onClick={handleRegister} disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </Button>

      <p className="text-sm text-center">
        Já tem conta? <a href="/login" className="text-blue-500">Entrar</a>
      </p>
    </div>
  )
}