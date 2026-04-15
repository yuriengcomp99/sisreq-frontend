"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Bem Vindo
      </h1>

      <div className="bg-white p-6 rounded shadow">
        <p className="text-gray-600">
          Você está logado
        </p>
      </div>
    </div>
  )
}