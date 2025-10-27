'use client'

import { useState } from 'react'
import { api, type RouterOutputs } from '@web/trpc/react'
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
import { Check, X } from 'lucide-react'
import { useToast } from '@web/hooks/use-toast'
import Image from 'next/image'

// Utility to strip HTML tags from content
function stripHtml(html: string) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent ?? div.innerText ?? ''
}

// Admin Actions for each article
function ArticleActions({ article }: { article: RouterOutputs['articles']['listArticles']['articlesList'][number] }) {
  const { toast } = useToast()
  const utils = api.useContext()
  const [actionType, setActionType] = useState<'publish' | 'unpublish' | 'verify' | 'delete' | null>(null)

  const publishMutation = api.articles.publishArticle.useMutation({
    onSuccess: () => {
      toast({ title: 'Article published!' })
      utils.articles.listArticles.invalidate()
      setActionType(null)
    },
  })

  const unpublishMutation = api.articles.unpublishArticle.useMutation({
    onSuccess: () => {
      toast({ title: 'Article unpublished!' })
      utils.articles.listArticles.invalidate()
      setActionType(null)
    },
  })

  const verifyMutation = api.articles.verifyArticle.useMutation({
    onSuccess: () => {
      toast({ title: 'Article verified!' })
      utils.articles.listArticles.invalidate()
      setActionType(null)
    },
  })

  const deleteMutation = api.articles.deleteArticle.useMutation({
    onSuccess: () => {
      toast({ title: 'Article deleted!' })
      utils.articles.listArticles.invalidate()
      setActionType(null)
    },
  })

  return (
    <div className="flex flex-wrap gap-2">
      {/* Publish/Unpublish */}
      {article.status === 'draft' ? (
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          disabled={publishMutation.isLoading}
          onClick={() => {
            setActionType('publish')
            publishMutation.mutate({ articleId: article.id })
          }}
        >
          Publish
        </Button>
      ) : (
        <Button
          variant="outline"
          disabled={unpublishMutation.isLoading}
          onClick={() => {
            setActionType('unpublish')
            unpublishMutation.mutate({ articleId: article.id })
          }}
        >
          Unpublish
        </Button>
      )}

      {/* Verify */}
      {!article.verified && (
        <Button
          className="bg-green-600 hover:bg-green-700"
          disabled={verifyMutation.isLoading}
          onClick={() => {
            setActionType('verify')
            verifyMutation.mutate({ articleId: article.id })
          }}
        >
          Verify
        </Button>
      )}

      {/* Delete */}
      <Button
        variant="destructive"
        disabled={deleteMutation.isLoading}
        onClick={() => {
          setActionType('delete')
          deleteMutation.mutate({ articleId: article.id })
        }}
      >
        Delete
      </Button>

      {/* Status badges */}
      {article.verified && <Badge className="bg-green-600">Verified</Badge>}
      {article.status === 'published' && <Badge className="bg-blue-600">Published</Badge>}
      {article.status === 'draft' && <Badge className="bg-gray-500">Draft</Badge>}
    </div>
  )
}

export default function AdminArticlesPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = api.articles.listArticles.useQuery(
    { page, limit: 10 },
    { staleTime: 1000 * 60 }
  )

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Articles</h1>

        {isLoading && <div className="text-center py-16 text-lg">Loading articles...</div>}
        {error && <div className="text-center py-16 text-red-500 text-lg">{error.message}</div>}
        {!isLoading && !error && (!data?.articlesList || data.articlesList.length === 0) && (
          <div className="text-center py-16 text-gray-500 text-lg">No articles found.</div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.articlesList.map((article) => {
            const date = article.updatedAt ?? article.publishedAt ?? article.createdAt
            const dateLabel = article.updatedAt
              ? 'Updated on'
              : article.publishedAt
              ? 'Published on'
              : 'Created on'
            const formattedDate = new Date(date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
            const plainContent = stripHtml(article.content)
            const preview = plainContent.length > 120 ? plainContent.slice(0, 120) + '...' : plainContent

            return (
              <div key={article.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                {article.image?.url ? (
                  <Image src={article.image.url} alt={article.title} width={450} height={250} className="rounded-md object-cover mb-4" />
                ) : (
                  <div className="h-48 bg-gray-200 rounded-md flex items-center justify-center mb-4">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <h2 className="text-lg font-semibold">{article.title}</h2>
                <p className="text-gray-600 text-sm mb-2">{preview}</p>
                <span className="text-xs text-gray-400 mb-4">{dateLabel} {formattedDate}</span>
                <ArticleActions article={article} />
              </div>
            )
          })}
        </div>

        {data?.totalCount && data.totalCount > page * 10 && (
          <div className="flex justify-center mt-6">
            <Button onClick={() => setPage(page + 1)}>Load More</Button>
          </div>
        )}
      </div>
    </main>
  )
}
