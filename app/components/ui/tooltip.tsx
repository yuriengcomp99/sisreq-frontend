"use client"

import { useState } from "react"

export function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: string
}) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  function handleMouseMove(e: React.MouseEvent) {
    setPosition({
      x: e.clientX,
      y: e.clientY,
    })
  }

  return (
    <div
      className="inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {visible && (
        <div
          className="
            fixed
            pointer-events-none
            bg-zinc-900 text-white text-xs
            px-3 py-2 rounded-md shadow-lg
            z-[9999]
            max-w-[300px]
            break-words
            whitespace-normal
          "
          style={{
            top: position.y - 40,
            left: position.x,
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}