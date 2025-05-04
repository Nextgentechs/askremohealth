'use client'

import { useState } from 'react'
import { api } from '@web/trpc/react'
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card'
import { Button } from '@web/components/ui/button'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

interface Article {
    id: string
    title: string
    content: string
    createdAt: Date
    publishedAt: Date | null
    updatedAt: Date | null
}

interface ArticleListResponse {
    totalCount: number
    articlesList: Article[]
}

export default function ArticlesPage() {
    const [page, setPage] = useState(1)
    const { user } = useUser()
    const { data, isLoading, error } = api.articles.listArticles.useQuery(
        { page, limit: 10 },
        { staleTime: 1000 * 60 } // Retain data for 1 minute
    )

    if (isLoading) return <div className="container mx-auto p-4">Loading articles...</div>
    if (error) return <div className="container mx-auto p-4">Error: {error.message}</div>
    if (!data || !data.articlesList || data.articlesList.length === 0) {
        return <div className="container mx-auto p-4">No articles found.</div>
    }

    const { articlesList, totalCount } = data as ArticleListResponse

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Articles</h1>
                {user && (
                    <Button asChild>
                        <Link href="/articles/post">Submit a New Article</Link>
                    </Button>
                )}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articlesList.map((article) => (
                    <Card key={article.id} className="shadow-md">
                        <CardHeader>
                            <CardTitle>{article.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Published: {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Not published'}
                            </p>
                            <Button asChild className="mt-4">
                                <Link href={`/articles/${article.id}`}>Read More</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {totalCount > articlesList.length && (
                <Button
                    onClick={() => setPage(page + 1)}
                    className="mt-6"
                    disabled={isLoading}
                >
                    Load More
                </Button>
            )}
        </div>
    )
}