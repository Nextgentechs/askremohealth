import { LoginForm } from '@web/components/login-form'
import Logo from '@web/components/logo'

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Logo />
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
