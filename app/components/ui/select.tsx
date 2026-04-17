import { forwardRef } from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, className, children, ...props }, ref) {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm text-gray-text">{label}</label>}
        <select
          ref={ref}
          {...props}
          className={`w-full cursor-pointer border border-gray-300 bg-white rounded px-3 py-2 outline-none text-sm font-medium text-gray-text ${className ?? ""}`}
        >
          {children}
        </select>
      </div>
    )
  }
)
