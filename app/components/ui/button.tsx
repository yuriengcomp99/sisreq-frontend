import type { ElementType } from "react"
import { Loader2 } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger"
  loading?: boolean
  icon?: ElementType
}

export function Button({
  children,
  variant = "primary",
  loading = false,
  icon: Icon,
  className,
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"

  const variants = {
    primary: "bg-custom-blue hover:opacity-90 text-sm font-semibold",
    danger: "bg-red-500 hover:bg-red-600",
  }

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      <span className={loading ? "opacity-70" : ""}>{children}</span>
    </button>
  )
}