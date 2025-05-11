'use client'

import { api } from '@web/trpc/react'
import { Button } from '@web/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import React from 'react'

interface Article {
    id: string
    title: string
    content: string
    createdAt: Date
    publishedAt: Date | null
    updatedAt: Date | null
    image?: {
        url: string
        path: string
    } | null
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params)
    const { data: article, isLoading, error } = api.articles.getArticleById.useQuery({ id: resolvedParams.id })

    if (isLoading) return <div className="container mx-auto p-4">Loading article...</div>
    if (error || !article) return notFound()

    return (
        <article className="container mx-auto mb-40 max-w-4xl px-6 py-8">
            <div className="mb-8 space-y-4">
                <Button variant="link" className="ps-0" size={'lg'} asChild>
                    <Link href="/articles">
                        <ArrowLeft className="h-8 w-8" />
                        <span className="text-base">Back to all articles</span>
                    </Link>
                </Button>
                <h1 className="text-4xl font-bold tracking-tight text-foreground/90">
                    {article.title}
                </h1>
                <p className="text-muted-foreground">
                    {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                          })
                        : 'Not published'}
                </p>
            </div>
            {article.image?.url && (
                <div className="mb-8">
                    <Image
                        src={article.image.url}
                        alt={article.title}
                        width={800}
                        height={400}
                        className="object-cover w-full rounded-lg"
                        priority
                    />
                </div>
            )}
            <div className="prose prose-lg dark:prose-invert">
                <p>{article.content}</p>
            </div>
        </article>
    )
}