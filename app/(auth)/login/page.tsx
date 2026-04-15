"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Swal from "sweetalert2"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { LogIn } from "lucide-react"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { login } from "@/app/services/auth-service"

const loginSchema = z.object({
  email: z.string().min(1, "Email e obrigatorio").email("Email invalido"),
  password: z.string().min(1, "Senha e obrigatoria"),
})

type FormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: FormData) {
    try {
      const response = await login(data)

      localStorage.setItem("token", response.accessToken)

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
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full max-w-md flex-col gap-4">
      <div className="mb-2 flex items-center justify-center gap-4">
        <Image src="/logo_bcms.png" alt="Logo BCMS" width={68} height={68} />
        <div className="flex flex-col leading-tight text-gray-text">
          <span className="text-[40px] font-semibold">SisReq</span>
          <span className="text-[20px] font-normal">Sistema de Requisições</span>
        </div>
      </div>

      <Input
        label="Email"
        placeholder="Digite seu email"
        {...register("email")}
      />
      {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}

      <Input
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        {...register("password")}
      />
      {errors.password && (
        <span className="text-sm text-red-500">{errors.password.message}</span>
      )}

      <Button type="submit" loading={isSubmitting} icon={LogIn}>
        Entrar
      </Button>
    </form>
  )
}