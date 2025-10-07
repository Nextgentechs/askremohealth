// app/admin/page.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../auth' 

export default async function AdminRoot() {
  try {
    const user = await getCurrentUser()

    // Not signed in → show admin login
    if (!user) {
      return redirect('/admin/login')
    }

    // Signed in but not an admin → send them to public home (or another page)
    if (user.role !== 'admin') {
      return redirect('/')
    }

    // Signed in admin → landing page (doctors dashboard)
    return redirect('/admin/doctors')
  } catch (err) {
    // On any unexpected error, send to login (keeps behavior safe)
    return redirect('/admin/login')
  }
}
