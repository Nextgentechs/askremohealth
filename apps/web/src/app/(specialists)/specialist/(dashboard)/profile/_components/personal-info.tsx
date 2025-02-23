'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Card, CardContent } from '@web/components/ui/card'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { Textarea } from '@web/components/ui/textarea'
import { toast } from '@web/hooks/use-toast'
import { fileToBase64 } from '@web/lib/utils'
import { api, type RouterOutputs } from '@web/trpc/react'
import { Loader, Upload, UploadCloud } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  type PersonalDetails,
  personalDetailsSchema,
} from '../../../onboarding/personal-details/_components/personal-details-form'

const updatePersonalDetailsSchema = personalDetailsSchema.omit({
  title: true,
  gender: true,
  profilePicture: true,
})

function PersonalInfoForm({
  doctor,
}: {
  doctor: RouterOutputs['doctors']['currentDoctor']
}) {
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<PersonalDetails>({
    resolver: zodResolver(updatePersonalDetailsSchema),
    defaultValues: {
      firstName: doctor?.firstName,
      lastName: doctor?.lastName,
      email: doctor?.email ?? '',
      phone: doctor?.phone ?? '',
      dob: doctor?.dob ? doctor.dob.toISOString().split('T')[0] : '',
      bio: doctor?.bio ?? '',
    },
  })

  const utils = api.useUtils()
  const { mutateAsync: updatePersonalDetails, isPending } =
    api.doctors.updatePersonalDetails.useMutation()

  const onSubmit = async (data: PersonalDetails) => {
    try {
      await updatePersonalDetails(data)
      utils.doctors.currentDoctor.invalidate()
      toast({
        title: 'Success',
        description: 'Personal details updated',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to update personal details',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="col-span-2 pt-6">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
            <Button size={'sm'} type="submit" disabled={isPending || !isDirty}>
              {isPending ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function PersonalInfo() {
  const [doctor] = api.doctors.currentDoctor.useSuspenseQuery()
  const [selectedImage, setSelectedImage] = useState<string | null>(
    doctor?.profilePicture?.url ?? null,
  )
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const utils = api.useUtils()
  const { mutateAsync: updateProfilePicture, isPending } =
    api.doctors.updateProfilePicture.useMutation()

  return (
    <div className="grid grid-cols-3 gap-6 rounded-xl">
      <div className="flex flex-col gap-8 border rounded-xl h-fit pb-6">
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          <Image
            src={selectedImage ?? ''}
            alt={doctor?.firstName ?? ''}
            className="object-cover"
            fill
          />
        </div>
        <div className="flex justify-between px-6 gap-4">
          <Label htmlFor="imageUpload" className="sr-only">
            Upload profile picture
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="imageUpload"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                const imageUrl = URL.createObjectURL(file)
                setSelectedImage(imageUrl)

                const base64String = await fileToBase64(file)
                setNewImage(base64String)
              }
            }}
            aria-label="Upload profile picture"
          />
          <Button
            className=""
            variant={'outline'}
            size={'sm'}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload New
          </Button>
          <Button
            disabled={!newImage || isPending}
            size={'sm'}
            onClick={async () => {
              if (!newImage) return
              await updateProfilePicture({ profilePicture: newImage })
              utils.doctors.currentDoctor.invalidate()
              toast({
                title: 'Profile picture updated',
              })
            }}
          >
            {isPending ? (
              <Loader className="mr-2 size-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 size-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
      <PersonalInfoForm doctor={doctor} />
    </div>
  )
}
