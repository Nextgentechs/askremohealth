import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'
import { Loader } from 'lucide-react'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="my-auto h-full">
      <LoginCard />
    </div>
  )
}

const loginSchema = z.object({
  phone: z
    .string()
    .refine((val) => /^\d{10}$/.test(val) || /^254\d{9}$/.test(val), {
      message:
        'Phone number must be 10 digits starting with 07 or 01, or 12 digits starting with 254',
    })
    .refine(
      (val) =>
        val.startsWith('07') ||
        val.startsWith('01') ||
        val.startsWith('2547') ||
        val.startsWith('2541'),
      {
        message: 'Phone number must start with 07, 01, 2547, or 2541',
      },
    )
    .transform((val) => {
      if (val.startsWith('0')) {
        return `254${val.slice(1)}`
      }
      return val
    }),
  password: z.string().min(8),
})

function LoginForm() {
  const router = useRouter()
  const search = useSearch({ from: '/auth' })
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  })

  const { toast } = useToast()
  const { mutateAsync, isPending } = api.auth.doctorLogin.useMutation()

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(values)
      await utils.invalidate()
      await utils.users.currentUser.refetch()
      await router.invalidate()
      router.navigate({ to: search.redirect })
      toast({
        description: 'Login successful',
        variant: 'default',
      })
    } catch (err) {
      toast({
        description: err.message,
        variant: 'destructive',
      })
      console.error(err)
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 254712344567"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel>Password</FormLabel>
                <Link
                  to="/auth/signup"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password ?
                </Link>
              </div>

              <FormControl>
                <Input id="password" type="password" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {isPending && <Loader className={`animate-spin`} />}
          Login
        </Button>
      </form>
    </Form>
  )
}

function LoginCard() {
  return (
    <Card className="m-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your phone and password below to log in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/auth/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
