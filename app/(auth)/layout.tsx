export default function AuthLayout({ children }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          Auth FullStack
        </h1>

        {children}
      </div>
    </div>
  )
}