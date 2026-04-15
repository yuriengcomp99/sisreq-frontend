"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"

export default function ProfilePage() {


  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white p-6 rounded shadow flex flex-col gap-4 w-full">
        <Input
          label="Name"
        />

        <Input
          label="Email"
        />

        <Input 
          label="Senha" 
          type="password" 
        />

      </div>
    </div>
  )
}