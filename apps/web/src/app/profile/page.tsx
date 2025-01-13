import {
  Breadcrumb,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
} from '@web/components/ui/breadcrumb'
import { api } from '@web/trpc/server'
import React from 'react'
import { ProfileForm, UpdatePassword } from './profile-form'

export default async function Page() {
  const user = await api.users.currentUser()
  return (
    <main className="container mx-auto mb-40 mt-12 flex min-h-screen w-full flex-col gap-12 xl:mb-2">
      <Breadcrumb className="lg:ps-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              {user?.firstName} {user?.lastName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex w-full flex-col justify-between gap-4 lg:flex-row lg:gap-8">
        <ProfileForm />
        <UpdatePassword />
      </div>
    </main>
  )
}
