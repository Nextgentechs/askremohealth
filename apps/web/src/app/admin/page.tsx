// app/admin/page.tsx
import { redirect } from 'next/navigation'

export default function AdminPage() {
  // Imperative redirect
  return redirect('/admin/doctors')
}
