// app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] bg-background">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Admin • Ask Remo Health</h1>
        <nav className="text-sm opacity-70">
          {/* add links if you grow sections: Doctors, Labs, Users, etc. */}
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}