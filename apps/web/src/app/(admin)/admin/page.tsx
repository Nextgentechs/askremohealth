import LoginForm from './login-form'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-sm border shadow-sm">
        <CardHeader className="flex flex-col items-start">
          <CardTitle className="text-start text-xl font-semibold">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent className="content-start px-0 pb-0 pt-6 text-foreground">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
