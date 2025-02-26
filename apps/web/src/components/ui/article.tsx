import { urlFor } from '@web/sanity/client'
import Image from 'next/image'
import Link from 'next/link'
import { type Post } from '../latest-articles'
import { Card, CardContent } from './card'

export default function Article({ post }: { post: Post }) {
  return (
    <Card className="border-none shadow-none overflow-hidden rounded-none p-0 transition-all hover:bg-muted/10">
      <Link
        href={`/articles/${post.slug.current}`}
        className="group block h-full"
        aria-label={`Read article: ${post.title}`}
      >
        <CardContent className="h-full flex flex-col sm:flex-row gap-6 sm:gap-10 py-4 sm:py-6">
          <div className="relative h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full sm:w-[350px] md:w-[450px] flex-shrink-0 overflow-hidden">
            <Image
              src={urlFor(post.image).url()}
              alt={post.title}
              width={450}
              height={350}
              className="h-full w-full object-cover rounded-sm transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex flex-col md:gap-24 sm:gap-10">
            <p className="text-sm sm:text-base text-muted-foreground">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <div className="flex flex-col gap-3 sm:gap-6">
              <p className="font-medium text-xl sm:text-2xl md:text-3xl text-primary">
                {post.title}
              </p>
              <p className="line-clamp-3 text-start text-sm sm:text-base text-muted-foreground opacity-75">
                {post.snippet}
              </p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
