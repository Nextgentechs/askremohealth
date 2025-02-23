'use client'

import { Button } from '@web/components/ui/button'
import { Badge } from '@web/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@web/components/ui/dialog'
import { api, type RouterOutputs } from '@web/trpc/react'
import { Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@web/hooks/use-toast'
import React from 'react'

export function DoctorActions({
  doctor,
}: {
  doctor: RouterOutputs['admin']['getDoctor']
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { mutateAsync, isPending } = api.admin.updateDoctorStatus.useMutation()
  const [actionType, setActionType] = React.useState<
    'approve' | 'reject' | null
  >(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = React.useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false)

  const handleStatusUpdate = async (status: 'verified' | 'rejected') => {
    try {
      setActionType(status === 'verified' ? 'approve' : 'reject')
      await mutateAsync({ id: doctor.id, status })
      setActionType(null)
      setIsApproveDialogOpen(false)
      setIsRejectDialogOpen(false)
      router.refresh()
      toast({
        title: 'Doctor status updated',
        description: 'The doctor status has been updated',
      })
      router.push('/admin/doctors?page=1')
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error updating doctor status',
        description: 'Please try again',
      })
    }
  }

  if (doctor.status === 'pending') {
    return (
      <div className="flex flex-row gap-4">
        <Dialog
          open={isApproveDialogOpen}
          onOpenChange={setIsApproveDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600">
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Doctor</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this doctor? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsApproveDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600"
                disabled={isPending}
                onClick={() => handleStatusUpdate('verified')}
              >
                {actionType === 'approve' ? 'Approving...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <X className="h-4 w-4" />
              Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Doctor</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this doctor? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() => handleStatusUpdate('rejected')}
              >
                {actionType === 'reject' ? 'Rejecting...' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (doctor.status === 'verified') {
    return (
      <Badge className="inline-flex h-10 items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-green-600">
        <Check className="mr-2 h-4 w-4" />
        Verified
      </Badge>
    )
  }

  if (doctor.status === 'rejected') {
    return (
      <Badge className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-red-600">
        <X className="mr-2 h-4 w-4" />
        Rejected
      </Badge>
    )
  }

  return null
}
