import { Upload, UploadCloud } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useForm } from 'react-hook-form'
import {
  PersonalDetails,
  personalDetailsSchema,
} from '../auth/personal-details'
import { zodResolver } from '@hookform/resolvers/zod'
import { api, RouterOutputs } from '@/lib/trpc'

function ProfilePhoto({
  doctor,
}: {
  doctor: RouterOutputs['doctors']['currentDoctor']
}) {
  return (
    <Card className="col-span-1 w-full shadow-sm">
      <CardHeader></CardHeader>
      <CardContent>
        <img
          className="size-72 rounded-full"
          src={doctor?.user?.profilePicture?.url}
          alt={doctor?.user.firstName}
        />
      </CardContent>

      <CardFooter className="justify-between pt-6">
        <Button className=" " variant={'outline'} size={'sm'} disabled>
          <Upload />
          <span>Upload New</span>
        </Button>

        <Button disabled size={'sm'}>
          <UploadCloud />
          <span>Save Changes</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

function PersonalInfoForm({
  doctor,
}: {
  doctor: RouterOutputs['doctors']['currentDoctor']
}) {
  const {
    register,
    formState: { errors },
  } = useForm<PersonalDetails>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: doctor?.user.firstName,
      lastName: doctor?.user.lastName,
      email: doctor?.user.email ?? '',
      phone: doctor?.user.phone ?? '',
      dob: doctor?.user.dob ? doctor.user.dob.toISOString().split('T')[0] : '',
      bio: doctor?.bio ?? '',
    },
  })

  return (
    <Card className="col-span-2 pt-6">
      <CardContent>
        <form className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input {...register('firstName')} id="firstName" type="text" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.firstName?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input {...register('lastName')} id="lastName" type="text" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.lastName?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input {...register('email')} id="email" type="email" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.email?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input {...register('phone')} id="phone" type="tel" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.phone?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input {...register('password')} id="password" type="password" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.password?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="">
                Confirm Password
              </Label>
              <Input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
              />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.confirmPassword?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Date of Birth</Label>
              <Input {...register('dob')} id="dob" type="date" />
              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.dob?.message}
              </p>
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="bio" className="">
                Bio
              </Label>

              <Textarea {...register('bio')} id="bio" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.bio?.message}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size={'sm'} disabled>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function PersonalInfo() {
  const [doctor] = api.doctors.currentDoctor.useSuspenseQuery()

  return (
    <div className="grid grid-cols-3 gap-4">
      <ProfilePhoto doctor={doctor} />
      <PersonalInfoForm doctor={doctor} />
    </div>
  )
}
