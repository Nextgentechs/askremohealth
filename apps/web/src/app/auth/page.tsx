import AuthForm from '@web/components/auth-form'
import Logo from '@web/components/logo'
import { Button } from '@web/components/ui/button'

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="fixed left-0 right-0 top-0 flex items-end justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
        <Logo href="/" />
        <Button variant="outline" className="rounded-full">
          Back
        </Button>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <AuthForm />
      </div>
    </div>
  )
}
