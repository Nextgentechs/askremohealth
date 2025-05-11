'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { Textarea } from '@web/components/ui/textarea'
import { fileToBase64 } from '@web/lib/utils'
import { api } from '@web/trpc/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useToast } from '@web/hooks/use-toast'

export const articleSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(150, 'Content must be at least 150 characters'),
})

export type ArticleFormData = z.infer<typeof articleSchema>

export default function PostArticle() {
    const router = useRouter()
    const { toast } = useToast()
    const form = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            title: '',
            content: '',
        },
    })

    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [newImage, setNewImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const createArticle = api.articles.createArticle.useMutation()
    const updateArticleImage = api.articles.updateArticleImage.useMutation()

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            const article = await createArticle.mutateAsync(data)
            if (!article) {
                throw new Error('Failed to create article')
            }
            if (newImage) {
                await updateArticleImage.mutateAsync({
                    articleId: article.id,
                    image: newImage,
                })
                toast({
                    title: 'Success',
                    description: 'Article and image created successfully!',
                })
            } else {
                toast({
                    title: 'Success',
                    description: 'Article created successfully!',
                })
            }
            form.reset()
            setNewImage(null)
            setSelectedImage(null)
            router.push('/articles')
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to create article',
                variant: 'destructive',
            })
        }
    })

    return (
        <section className="container mx-auto max-w-4xl px-6 py-8">
            <h1 className="mb-8 text-3xl font-bold">Create a New Article</h1>
            <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col gap-8 border rounded-xl h-fit pb-6">
                    <div className="relative aspect-square overflow-hidden rounded-t-xl">
                        {selectedImage ? (
                            <Image
                                src={selectedImage}
                                alt="Article preview"
                                className="object-cover"
                                fill
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gray-200">
                                <span className="text-gray-500">No image selected</span>
                            </div>
                        )}
                    </div>
                    <div className="px-6">
                        <Label htmlFor="imageUpload" className="sr-only">
                            Upload article image
                        </Label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                            id="imageUpload"
                            onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    try {
                                        const imageUrl = URL.createObjectURL(file)
                                        setSelectedImage(imageUrl)
                                        const base64String = await fileToBase64(file)
                                        setNewImage(base64String)
                                    } catch (err) {
                                        console.error('Error converting file to base64:', err)
                                        toast({
                                            title: 'Error',
                                            description: 'Failed to process image',
                                            variant: 'destructive',
                                        })
                                    }
                                }
                            }}
                            aria-label="Upload article image"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={form.formState.isSubmitting}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                        </Button>
                    </div>
                </div>
                <div className="col-span-2">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                {...form.register('title')}
                                id="title"
                                placeholder="Enter article title"
                                disabled={form.formState.isSubmitting}
                            />
                            <p className="text-[0.8rem] font-medium text-destructive">
                                {form.formState.errors.title?.message}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                {...form.register('content')}
                                id="content"
                                placeholder="Write your article content here (minimum 150 characters)"
                                className="h-96"
                                disabled={form.formState.isSubmitting}
                            />
                            <p className="text-[0.8rem] font-medium text-destructive">
                                {form.formState.errors.content?.message}
                            </p>
                        </div>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Article'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    )
}