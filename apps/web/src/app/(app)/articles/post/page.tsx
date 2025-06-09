'use client'

import { useUser } from '@clerk/nextjs'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { api } from '@web/trpc/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Wysiwyg from '@web/components/wysiwyg'

export default function PostArticle() {
  const { user } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createArticle = api.articles.createArticle.useMutation({
    onSuccess: async (article) => {
      if (!article) {
        setError('Failed to create article')
        return
      }
      if (image) {
        await updateImage.mutateAsync({
          articleId: article.id,
          image: await convertToBase64(image),
        })
      }
      router.push(`/articles/${article.id}`)
    },
    onError: (error) => setError(error.message),
  })

  const updateImage = api.articles.updateArticleImage.useMutation({
    onError: (error) => setError(error.message),
  })

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to submit an article')
      return
    }
    if (!formData.title || !formData.content) {
      setError('Title and content are required')
      return
    }

    createArticle.mutate({
      title: formData.title,
      content: formData.content, // Already sanitized by Wysiwyg
    })
  }

  // Debug Wysiwyg content
  useEffect(() => {
    console.warn('PostArticle formData.content:', formData.content)
  }, [formData.content])

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Submit a New Article</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter article title"
            disabled={createArticle.isPending}
          />
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Wysiwyg
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>
        <div>
          <Label htmlFor="image">Featured Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            disabled={createArticle.isPending}
          />
        </div>
        <Button
          type="submit"
          disabled={createArticle.isPending}
        >
          {createArticle.isPending ? 'Submitting...' : 'Submit Article'}
        </Button>
      </form>
    </div>
  )
}