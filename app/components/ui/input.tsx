interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm">{label}</label>}

      <input
        {...props}
        className="border border-gray-300 rounded px-3 py-2 outline-none text-sm font-medium"
      />
    </div>
  )
}