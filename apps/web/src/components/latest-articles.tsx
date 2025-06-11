import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { api } from '@web/trpc/server'
import parse, { domToReact } from 'html-react-parser'
import type { DOMNode, Element } from 'html-react-parser'
import truncateHtml from 'truncate-html'

export interface Article {
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

function ArticleCard({ article }: { article: Article }) {
  // Truncate HTML content to ~100 characters, preserving tags
  const snippet = truncateHtml(article.content, {
    length: 100,
    stripTags: false,
    ellipsis: '...',
  })

  // Custom parser to unwrap outer <p> tags, preserving inner content
  const parseOptions = {
    replace: (domNode: DOMNode, _index: number) => {
      if ('name' in domNode && domNode.name === 'p' && 'children' in domNode) {
        return <>{domToReact(domNode.children as DOMNode[], parseOptions)}</>
      }
    },
  }

  return (
    <Card className="h-96 overflow-hidden rounded-none bg-transparent shadow-none border-none transition-all hover:bg-muted/10">
      <Link
        href={`/articles/${article.id}`}
        className="group block h-full"
        aria-label={`Read article: ${article.title}`}
      >
        <CardContent className="h-full flex flex-col p-0">
          <div className="relative h-48 w-full overflow-hidden rounded">
            {article.image?.url ? (
              <Image
                src={article.image.url}
                alt={article.title}
                width={450}
                height={350}
                className="h-full w-full object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1 justify-between pt-4 px-4">
            <h3 className="line-clamp-2 text-start font-semibold text-primary hover:underline">
              {article.title}
            </h3>
            <div className="line-clamp-3 text-start text-sm text-gray-600 prose">
              {parse(snippet, parseOptions)}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

export default async function LatestArticles() {
  const { articlesList } = await api.articles.getLatestArticles({
    limit: 4,
  })

  return (
    <section id="latest-articles" className="w-full bg-gray-100 py-16">
      <div className="container mx-auto flex flex-col items-center gap-10">
        <div className="w-full flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800">Latest Articles</h2>
          <p className="text-center text-gray-600">
            Expert tips and insights to support your health and wellness journey.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articlesList.length > 0 ? (
            articlesList.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <p className="text-center text-gray-600">No articles available.</p>
          )}
        </div>
        <div className="w-full flex justify-center">
          <Button variant="link">
            <Link href="/articles" className="flex items-center gap-1">
              <span className="text-gray-600">Explore More Articles</span>
              <ArrowRight className="text-gray-600" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}