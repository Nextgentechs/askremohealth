'use client'

import { api } from '@web/trpc/react'
import { Button } from '@web/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import React from 'react'

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params)
    const { data: article, isLoading, error } = api.articles.getArticleById.useQuery({ id: resolvedParams.id })

    if (isLoading) return <div className="container mx-auto p-4">Loading article...</div>
    if (error || !article) return notFound()

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-1 flex justify-center items-start">
            <article className="w-full max-w-7xl rounded-2xl p-3 md:p-8 mx-auto flex flex-col gap-8">
                <div className="flex flex-col gap-4 mb-2">
                    <Button variant="link" className="ps-0 w-fit text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-2" size="lg" asChild>
                        <Link href="/articles">
                            <ArrowLeft className="h-7 w-7" />
                            <span className="text-base">Back to all articles</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground/90 leading-tight break-words">
                        {article.title}
                    </h1>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-7 gap-10 items-start">
                    {article.image?.url && (
                        <div className="w-full aspect-[2/1] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center xl:col-span-3">
                            <Image
                                src={article.image.url}
                                alt={article.title}
                                width={1000}
                                height={500}
                                className="object-cover w-full h-full"
                                priority
                            />
                        </div>
                    )}
                    <div className={`prose prose-lg dark:prose-invert max-w-none w-full text-gray-800 xl:col-span-4 ${article.image?.url ? '' : 'xl:col-span-7'}`}
                        style={{ wordBreak: 'break-word' }}
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </div>
            </article>
        </section>
    )
}
