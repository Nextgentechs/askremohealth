import { type Post } from '@web/components/latest-articles'
import Article from '@web/components/ui/article'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@web/components/ui/pagination'
import { client } from '@web/sanity/client'
import { notFound } from 'next/navigation'

async function getPosts(page: number, limit: number) {
  const start = (page - 1) * limit
  const end = start + limit

  const totalQuery = `count(*[_type == "post"])`
  const totalPosts = await client.fetch<number>(totalQuery)

  const query = `*[_type == "post"] | order(publishedAt desc)[$start...$end] {
    title,
    slug,
    publishedAt,
    image,
    snippet
  }`
  const posts = await client.fetch<Post[]>(query, { start, end })

  return {
    posts,
    totalPages: Math.ceil(totalPosts / limit),
  }
}

export default async function Articles({
  searchParams,
}: {
  searchParams?: { page?: string }
}) {
  const limit = 2
  const page = Number(searchParams?.page) || 1

  const { posts, totalPages } = await getPosts(page, limit)

  if (posts.length === 0) return notFound()

  return (
    <div className="py-6">
      <h2 className="text-center font-bold text-6xl py-11 text-primary font-sans">
        Blog &amp; Resources
      </h2>
      <div className="flex px-36 flex-col gap-14">
        {posts.map((post) => (
          <Article key={post.slug.current} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent>
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
                  className="hover:cursor-pointer text-primary"
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
    </div>
  )
}
