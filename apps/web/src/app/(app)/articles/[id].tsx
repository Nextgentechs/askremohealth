'use client'

import { useRouter } from 'next/navigation'
import { api } from '@web/trpc/react'
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card'

interface Article {
    id: string
    title: string
    content: string
    createdAt: string
    publishedAt: string | null
    updatedAt: string
}

export default function ArticlePage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { data: article, isLoading, error } = api.articles.getArticleById.useQuery(
        { id: params.id },
        { enabled: !!params.id }
    )

    if (isLoading) return <div className="container mx-auto p-4">Loading article...</div>
    if (error) return <div className="container mx-auto p-4">Error: {error.message}</div>
    if (!article) return <div className="container mx-auto p-4">Article not found.</div>

    return (
        <div className="container mx-auto p-4">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                        Published: {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                    <div className="prose">
                        {article.content}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}