'use client'

import React from 'react'
import { api, type RouterOutputs } from '@web/trpc/react'
import { AdminArticleActions } from '@web/components/ArticleActions'

type AdminArticle = RouterOutputs['articles']['listArticles']['articlesList'][number]

export default function AdminArticlesPage() {
  const { data, isLoading } = api.articles.listArticles.useQuery({ page: 1, limit: 20 })

  if (isLoading) return <p>Loading articles...</p>
  if (!data) return <p>No articles found.</p>

  return (
    <div className="space-y-4">
      {data.articlesList.map((article: AdminArticle) => (
        <div key={article.id} className="p-4 border rounded">
          <h2 className="text-lg font-bold">{article.title}</h2>
          <p className="text-sm text-gray-500">{article.content.slice(0, 100)}...</p>
          <AdminArticleActions article={article} />
        </div>
      ))}
    </div>
  )
}
