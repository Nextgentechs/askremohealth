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
import { Check, X, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@web/hooks/use-toast'
import React from 'react'

// FIXED TYPE: index into articlesList array
type AdminArticle = RouterOutputs['articles']['listArticles']['articlesList'][number]

export function AdminArticleActions({ article }: { article: AdminArticle }) {
  const router = useRouter()
  const { toast } = useToast()

  // Mutations
  const publishMutation = api.articles.publishArticle.useMutation()
  const unpublishMutation = api.articles.unpublishArticle.useMutation()
  const verifyMutation = api.articles.verifyArticle.useMutation()
  const deleteMutation = api.articles.deleteArticle.useMutation()

  // Dialog states
  const [isPublishDialogOpen, setIsPublishDialogOpen] = React.useState(false)
  const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = React.useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const handleMutation = async (
    mutation: typeof publishMutation | typeof unpublishMutation | typeof verifyMutation | typeof deleteMutation,
    actionName: string,
    dialogSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    try {
      await mutation.mutateAsync({ id: article.id })
      toast({
        title: `${actionName} successful`,
        description: `Article ${actionName.toLowerCase()} successfully.`,
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({ title: 'Error', description: `Failed to ${actionName.toLowerCase()}.` })
    } finally {
      dialogSetter(false)
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Publish */}
      {article.status !== 'published' && (
        <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-green-500 hover:bg-green-600">
              <Check className="h-4 w-4 mr-1" /> Publish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish Article</DialogTitle>
              <DialogDescription>Are you sure you want to publish this article?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPublishDialogOpen(false)}
                disabled={publishMutation.status === 'pending'}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600"
                disabled={publishMutation.status === 'pending'}
                onClick={() => handleMutation(publishMutation, 'Publish', setIsPublishDialogOpen)}
              >
                {publishMutation.status === 'pending' ? 'Publishing...' : 'Publish'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Unpublish */}
      {article.status === 'published' && (
        <Dialog open={isUnpublishDialogOpen} onOpenChange={setIsUnpublishDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="bg-yellow-500 hover:bg-yellow-600">
              <X className="h-4 w-4 mr-1" /> Unpublish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unpublish Article</DialogTitle>
              <DialogDescription>Are you sure you want to unpublish this article?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUnpublishDialogOpen(false)}
                disabled={unpublishMutation.status === 'pending'}
              >
                Cancel
              </Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600"
                disabled={unpublishMutation.status === 'pending'}
                onClick={() => handleMutation(unpublishMutation, 'Unpublish', setIsUnpublishDialogOpen)}
              >
                {unpublishMutation.status === 'pending' ? 'Unpublishing...' : 'Unpublish'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Verify */}
      {!article.verified && (
        <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
              <Check className="h-4 w-4 mr-1" /> Verify
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Article</DialogTitle>
              <DialogDescription>Are you sure you want to verify this article?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsVerifyDialogOpen(false)}
                disabled={verifyMutation.status === 'pending'}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                disabled={verifyMutation.status === 'pending'}
                onClick={() => handleMutation(verifyMutation, 'Verify', setIsVerifyDialogOpen)}
              >
                {verifyMutation.status === 'pending' ? 'Verifying...' : 'Verify'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.status === 'pending'}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.status === 'pending'}
              onClick={() => handleMutation(deleteMutation, 'Delete', setIsDeleteDialogOpen)}
            >
              {deleteMutation.status === 'pending' ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Badges */}
      {article.verified && <Badge className="bg-green-500">Verified</Badge>}
      {article.status === 'published' && <Badge className="bg-blue-500">Published</Badge>}
      {article.status === 'draft' && <Badge className="bg-yellow-500">Draft</Badge>}
    </div>
  )
}
