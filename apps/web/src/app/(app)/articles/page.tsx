'use client'

import { Button } from '@web/components/ui/button'
import Footer from '@web/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@web/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'
import { api } from '@web/trpc/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'



// Utility to strip HTML tags from a string
function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use regex
    return html.replace(/<[^>]+>/g, '');
  } else {
    // Client-side: use DOMParser for more safety
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent ?? div.innerText ?? '';
  }
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
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
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
                        <Button 
                            asChild 
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold"
                        >
                            <Link href="/articles/post" className="flex items-center bg-primary">
                                Submit a New Article
                            </Link>
                        </Button>
                    )}
                </div>

                {isLoading && <div className="text-center py-16 text-lg font-medium">Loading articles...</div>}
                {error && <div className="text-center py-16 text-red-500 text-lg">Error: {error.message}</div>}
                {!isLoading && !error && (!data?.articlesList || data.articlesList.length === 0) && (
                    <div className="text-center py-16 text-gray-500 text-lg">No articles found.</div>
                )}

                {data?.articlesList && data.articlesList.length > 0 && (
                    <>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {data.articlesList.map((article) => {
                                const date = article.updatedAt ?? article.publishedAt ?? article.createdAt;
                                const dateLabel = article.updatedAt ? 'Updated on' : (article.publishedAt ? 'Published on' : 'Created on');
                                const formattedDate = new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                                const plainContent = stripHtml(article.content);
                                const preview = plainContent.length > 120 ? plainContent.slice(0, 120) + '...' : plainContent;
                                return (
                                    <Card
                                        key={article.id}
                                        className="group transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-0 bg-white/90 backdrop-blur rounded-lg overflow-hidden flex flex-col h-full"
                                    >
                                        <CardHeader className="p-0">
                                            <div className="relative h-48 w-full overflow-hidden">
                                                {article.image?.url ? (
                                                    <Image
                                                        src={article.image.url}
                                                        alt={article.title}
                                                        width={450}
                                                        height={350}
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-400">No image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col gap-2 pt-4 pb-2 px-5">
                                            <CardTitle className="text-lg font-bold truncate" title={article.title}>
                                                {article.title.length > 60 ? article.title.slice(0, 60) + '...' : article.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-3 text-gray-600 min-h-[60px]">
                                                {preview}
                                            </CardDescription>
                                        </CardContent>
                                        <CardFooter className="flex items-center justify-between px-5 pb-4 pt-0 mt-auto">
                                            <span className="text-xs text-gray-400">{dateLabel} {formattedDate}</span>
                                            <Button asChild className="ml-2 px-4 py-1.5 text-sm font-semibold rounded-md shadow">
                                                <Link className="bg-primary" href={`/articles/${article.id}`}>Read More</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                        {data.totalCount > data.articlesList.length && (
                            <div className="flex justify-center mt-10">
                                <Button
                                    onClick={() => setPage(page + 1)}
                                    className="px-8 py-2 text-base font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                                    disabled={isLoading}
                                >
                                    Load More
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
