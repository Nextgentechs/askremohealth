'use client'

import { Button } from '@web/components/ui/button'
import Footer from '@web/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'
import { api } from '@web/trpc/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'

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

interface ArticleListResponse {
    totalCount: number
    articlesList: Article[]
}

export default function ArticlesPage() {
    const [page, setPage] = useState(1)
    const { data: user } = api.users.currentUser.useQuery()
    
    useEffect(() => {
        console.log('Current user data:', user)
    }, [user])

    const { data, isLoading, error } = api.articles.listArticles.useQuery(
        { page, limit: 10 },
        { staleTime: 1000 * 60 }
    )

    const isDoctor = user?.role === 'doctor'

    return (
        <main className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/articles">Articles</BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    {isDoctor && (
                        <div className="flex items-center">
                            <Button 
                                asChild 
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Link href="/articles/post" className="flex items-center bg-primary text-white">
                                    Submit a New Article
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {isLoading && <div className="text-center py-8">Loading articles...</div>}
                {error && <div className="text-center py-8 text-red-500">Error: {error.message}</div>}
                {!isLoading && !error && (!data?.articlesList || data.articlesList.length === 0) && (
                    <div className="text-center py-8 text-gray-500">No articles found.</div>
                )}

                {data?.articlesList && data.articlesList.length > 0 && (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {data.articlesList.map((article) => (
                                <Card key={article.id} className="shadow-md">
                                    <CardHeader>
                                        <CardTitle>{article.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative h-48 w-full overflow-hidden rounded-md mb-4">
                                            {article.image?.url ? (
                                                <Image
                                                    src={article.image.url}
                                                    alt={article.title}
                                                    width={450}
                                                    height={350}
                                                    className="h-full w-full object-cover rounded-sm"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-sm">
                                                    <span className="text-gray-500">No image</span>
                                                </div>
                                            )}
                                        </div>
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
                        {data.totalCount > data.articlesList.length && (
                            <Button
                                onClick={() => setPage(page + 1)}
                                className="mt-6"
                                disabled={isLoading}
                            >
                                Load More
                            </Button>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </main>
    )
}