import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { createFileRoute } from '@tanstack/react-router'
import { Upload, UploadCloud } from 'lucide-react'

export const Route = createFileRoute('/dashboard/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-2">
      <Tabs defaultValue="personalInfo" className="flex flex-col gap-6">
        <TabsList className="gird w-fit grid-cols-3">
          <TabsTrigger value="personalInfo">Personal Info</TabsTrigger>
          <TabsTrigger value="professionalInfo">Professional Info</TabsTrigger>
          <TabsTrigger value="consultationSettings">
            Consultation Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personalInfo">
          <PersonalInfo />
        </TabsContent>
        <TabsContent value="professionalInfo">
          <div>Professional info</div>
        </TabsContent>
        <TabsContent value="consultationSettings">
          <div>Consultation settings</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfilePhoto() {
  return (
    <Card className="col-span-1 w-full shadow-sm">
      <CardHeader></CardHeader>
      <CardContent>
        <img
          className="size-72 rounded-full"
          src="https://do5q0y4otbt6jaho.public.blob.vercel-storage.com/profile-picture-0019313a-9160-4621-80ce-4f55725d410c-ycFnHZ1PvU8jkdVLJy9dmhKStNYE3Y.webp"
        />
      </CardContent>

      <CardFooter className="justify-between pt-6">
        <Button className=" " variant={'outline'} size={'sm'}>
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

function PersonalInfoForm() {
  return (
    <Card className="col-span-2 pt-6">
      <CardContent>
        <form className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" type="text" />

              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {errors.firstName?.message}
              </p> */}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" type="text" />

              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {errors.lastName?.message}
              </p> */}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" />

              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {errors.email?.message}
              </p> */}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" />

              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {errors.phone?.message}
              </p> */}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Date of Birth</Label>
              <Input id="dob" type="date" />
              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {errors.dob?.message}
              </p> */}
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="bio" className="">
                Bio
              </Label>

              <Textarea id="bio" />

              {/* <p className="text-destructive text-[0.8rem] font-medium">
                {errors.bio?.message}
              </p> */}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" size={'sm'}>
              Edit
            </Button>
            <Button type="submit" size={'sm'} disabled>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PersonalInfo() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <ProfilePhoto />
      <PersonalInfoForm />
    </div>
  )
}
