import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-text">{label}</label>}

      <input
        ref={ref}
        {...props}
        className={`w-full border border-gray-300 bg-white rounded px-3 py-2 outline-none text-sm font-medium bold text-gray-text ${className ?? ""}`}
      />
    </div>
  )
})