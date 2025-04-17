import Footer from '@web/components/footer'
import { type Post } from '@web/components/latest-articles'
import Article from '@web/components/ui/article'
import { Button } from '@web/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@web/components/ui/pagination'
import { client } from '@web/sanity/client'
import { FileSearch } from 'lucide-react'

const LIMIT = 10

async function getPosts(page: number, limit: number) {
  const start = (page - 1) * limit
  const end = start + limit

  const totalQuery = `count(*[_type == "post"])`
  const postsQuery = `*[_type == "post"] | order(publishedAt desc)[${start}...${end}] {
    title,
    slug,
    publishedAt,
    image,
    snippet
  }`

  const [totalPosts, posts] = await Promise.all([
    client.fetch<number>(totalQuery),
    client.fetch<Post[]>(postsQuery),
  ])

  return {
    posts,
    totalPages: Math.ceil(totalPosts / limit),
  }
}

export default async function Articles({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | number }>
}) {
  const params = await searchParams

  const page = Number(params.page) || 1

  const { posts, totalPages } = await getPosts(page, LIMIT)

  if (posts.length === 0) {
    return (
      <div className="flex h-full px-6 py-20 sm:px-10 md:px-20 lg:px-40 flex-col items-center justify-center text-center">
        <div className="bg-background">
          <FileSearch size={48} color="#0F172A" />
        </div>
        <p className="text-3xl sm:text-4xl lg:text-5xl text-primary">
          We do not have any articles for now!
        </p>
        <p className="text-lg sm:text-xl text-muted-foreground opacity-75">
          You can check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="container pt-6">
      <div className="flex items-center justify-between">
      <h2 className="text-center font-bold text-4xl sm:text-3xl md:text-6xl py-6 sm:py-11 text-primary font-sans">
        Blogs &amp; Resources
        </h2>
        <Button variant="default">Post Article</Button>
      </div>
      <div className="flex flex-col gap-8 sm:gap-12 lg:gap-14">
        {posts.map((post) => (
          <Article key={post.slug.current} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="my-10 flex justify-center">
          <PaginationContent className="flex flex-wrap gap-2 justify-center">
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  className="hover:cursor-pointer text-primary"
                  href={`?page=${page - 1}`}
                />
              </PaginationItem>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href={`?page=${p}`}
                  isActive={p === page}
                  className="hover:cursor-pointer px-3 py-2 sm:px-4 sm:py-3 text-primary text-sm sm:text-base"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext
                  className="hover:cursor-pointer text-primary"
                  href={`?page=${page + 1}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
      {/* <Footer /> */}
    </div>
  )
}
