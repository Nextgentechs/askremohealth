// apps/web/src/app/community/[postId]/page.tsx
import LeftMenu from "@web/components/community/leftMenu/LeftMenu";
import RightMenu from "@web/components/community/rightMenu/RightMenu";
import SinglePost from "@web/components/community/feed/SinglePost";
import { api } from '@web/trpc/react'
import { notFound } from 'next/navigation'

interface Params {
  postId: string
}

const SinglePostPage = async ({ params }: { params: Promise<Params> }) => {
  const { postId } = await params

  // Fetch the post server-side using TRPC
  const post = await api.community.getPostById.useQuery({ postId })
  if (!post) return notFound()

  return (
    <div className="flex gap-6 pt-1">
      <div className="hidden xl:block w-[20%]">
        <LeftMenu type="home" />
      </div>

      <div className="w-full lg:w-[70%] xl:w-[50%]">
        {/* Pass full post object to SinglePost */}
        <SinglePost postId={postId} />
      </div>

      <div className="hidden lg:block w-[30%]">
        <RightMenu />
      </div>
    </div>
  )
}

export default SinglePostPage
