interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger"
}

export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base = "px-4 py-2 rounded text-white transition"

  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-sm font-medium",
    danger: "bg-red-500 hover:bg-red-600",
  }

  return (
    <button {...props} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  )
}