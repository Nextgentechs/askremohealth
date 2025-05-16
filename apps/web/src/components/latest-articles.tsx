import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { api } from '@web/trpc/server'

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

function ArticleCard({ article }: { article: Article }) {
  // Generate snippet by truncating content to 100 characters
  const snippet = article.content.length > 100 
    ? article.content.slice(0, 100) + '...' 
    : article.content

  return (
    <Card className="h-96 overflow-hidden rounded-none bg-transparent shadow-none border-none transition-all hover:bg-muted/10">
      <Link
        href={`/articles/${article.id}`}
        className="group block h-full"
        aria-label={`Read article: ${article.title}`}
      >
        <CardContent className="h-full p-0">
          <div className="relative h-48 w-full overflow-hidden rounded-md">
            {article.image?.url ? (
              <Image
                src={article.image.url}
                alt={article.title}
                width={450}
                height={350}
                className="h-full w-full object-cover rounded-sm transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            )}
          </div>
          <div className="flex h-[calc(100%-14rem)] flex-col items-start justify-between pt-4">
            <h3 className="line-clamp-2 text-start font-medium text-primary underline-offset-4 group-hover:underline">
              {article.title}
            </h3>
            <p className="line-clamp-3 text-start text-sm text-muted-foreground opacity-75">
              {snippet}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                month: 'long',
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
    <section id="latest-articles" className="w-full bg-secondary py-16">
      <div className="container mx-auto flex flex-col items-center justify-center gap-10">
        <div className="mx-auto flex w-full flex-col items-center justify-center gap-2">
          <h2 className="section-title">Latest Articles</h2>
          <p className="section-description text-center">
            Expert tips and insights to support your health and wellness journey.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {articlesList.length > 0 ? (
            articlesList.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <p className="text-center text-muted-foreground">No articles available.</p>
          )}
        </div>
        <Button variant={'link'}>
          <Link href="/articles" className="flex items-center gap-1">
            <span>Explore More Articles</span>
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  )
}