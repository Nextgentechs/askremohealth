import { PortableText } from '@portabletext/react'
import { type SanityImageSource } from '@sanity/image-url/lib/types/types'
import { AspectRatio } from '@web/components/ui/aspect-ratio'
import { Button } from '@web/components/ui/button'
import { client, urlFor } from '@web/sanity/client'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type Post = {
  title: string
  publishedAt: string
  image: SanityImageSource
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
  slug: string
}

async function getPost(slug: string): Promise<Post> {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    title,
    publishedAt,
    image,
    body,
    slug
  }`
  return client.fetch(query, { slug })
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const slugObject = await params
  const post = await getPost(slugObject.slug)

  if (!post) return <div>Article not found</div>

  return (
    <article className="container mx-auto mb-40 max-w-4xl px-6 py-8">
      <div className="mb-8 space-y-4">
        <Button variant="link" className="ps-0" size={'lg'} asChild>
          <Link href="/articles">
            <ArrowLeft className="h-8 w-8" />
            <span className="text-base">Back to all articles</span>
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight text-foreground/90">
          {post.title}
        </h1>
        <p className="text-muted-foreground">
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-lg">
        <AspectRatio ratio={3 / 4}>
          <Image
            src={urlFor(post.image).url()}
            alt={post.title}
            fill
            className="rounded-md object-cover shadow-sm"
          />
        </AspectRatio>
      </div>

      <div className="prose prose-lg dark:prose-invert">
        <PortableText
          value={post.body}
          components={{
            block: {
              normal: ({ children }) => <p className="mb-4">{children}</p>,
            },
            marks: {
              link: ({ value, children }) => (
                <a
                  href={value.href}
                  className="text-primary underline underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
            },
          }}
        />
      </div>
    </article>
  )
}
