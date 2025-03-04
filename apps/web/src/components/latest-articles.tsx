import { type SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client, urlFor } from '@web/sanity/client'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

export type Post = {
  title: string
  slug: {
    current: string
  }
  snippet: string
  image: SanityImageSource
  publishedAt: string
}

async function getPosts(limit: number) {
  const query = `*[_type == "post"] | order(publishedAt desc)[0...$limit] {
    title,
    slug,
    publishedAt,
    image,
    snippet
  }`

  return client.fetch<Post[]>(query, { limit })
}

function ArticleCard({ post }: { post: Post }) {
  return (
    <Card className="h-96 overflow-hidden rounded-none bg-transparent shadow-none border-none transition-all hover:bg-muted/10">
      <Link
        href={`/articles/${post.slug.current}`}
        className="group block h-full"
        aria-label={`Read article: ${post.title}`}
      >
        <CardContent className="h-full p-0">
          <div className="relative h-48 w-full overflow-hidden rounded-md">
            <Image
              src={urlFor(post.image).url()}
              alt={post.title}
              width={450}
              height={350}
              className="h-full w-full object-cover rounded-sm transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex h-[calc(100%-14rem)] flex-col items-start justify-between pt-4">
            <h3 className="line-clamp-2 text-start font-medium text-primary underline-offset-4 group-hover:underline">
              {post.title}
            </h3>

            <p className="line-clamp-3 text-start text-sm text-muted-foreground opacity-75">
              {post.snippet}
            </p>

            <p className="text-xs text-muted-foreground">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
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
  const posts = await getPosts(4)
  return (
    <section id="latest-articles" className="w-full bg-secondary py-16">
      <div className="container mx-auto flex flex-col items-center justify-center gap-10">
        <div className="mx-auto flex w-full flex-col items-center justify-center gap-2">
          <h2 className="section-title">Latest Articles</h2>
          <p className="section-description text-center">
            Expert tips and insights to support your health and wellness
            journey.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <ArticleCard key={post.title} post={post} />
          ))}
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
