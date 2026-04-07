"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { getProfile, updateUser} from "@/app/services/user-service"

export default function ProfilePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleUpdate() {
      try {
        setLoading(true)
        const updateDate = await updateUser({name, email, password})

        await Swal.fire({
          icon: "success",
          title: "Register successful",
          text: "Welcome!",
          timer: 1500,
          showConfirmButton: false,
        })

        console.log(updateDate)

      } catch (err: any){

        await Swal.fire({
          icon: "error",
          title: "Update failed",
          text: err.message || "Update User Error",
        })

      } finally {
        setLoading(false)
      }
  }

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getProfile()

        setName(data.name)
        setEmail(data.email)
      } catch {
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white p-6 rounded shadow flex flex-col gap-4 w-full">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input 
          label="Senha" 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value) }
        />

        <Button onClick={handleUpdate} disabled={loading}>
          {loading ? "updating..." : "Update Profile"} 
        </Button>
      </div>
    </div>
  )
}