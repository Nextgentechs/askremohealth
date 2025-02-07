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
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
