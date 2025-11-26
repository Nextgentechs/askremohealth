import LeftMenu from "@web/components/community/leftMenu/LeftMenu";
import RightMenu from "@web/components/community/rightMenu/RightMenu";
import SinglePost from "@web/components/community/feed/SinglePost";
import { api } from '@web/trpc/server'
import { notFound } from 'next/navigation'

interface Params {
  postId: string
}

const SinglePostPage = async ({ params }: { params: Promise<Params> }) => {
  const { postId } = await params

  const post = await api.community.getPostById({ postId })
  if (!post) return notFound()

  return (
    <div className="flex gap-6 pt-1 h-[calc(100vh-56px)] lg:h-[calc(100vh-80px)] overflow-hidden">
      <div className="hidden xl:block w-[20%] overflow-y-auto">
        <LeftMenu type="home" />
      </div>

      <div className="w-full lg:w-[70%] xl:w-[50%] overflow-y-auto">
        {/* Pass full post object to SinglePost */}
        <SinglePost postId={postId} />
      </div>

      <div className="hidden lg:block w-[30%] overflow-y-auto">
        <RightMenu />
      </div>
    </div>
  )
}

export default SinglePostPage
