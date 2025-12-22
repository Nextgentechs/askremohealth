import PostInfo from '@web/components/community/feed/PostInfo'
import PostInteraction from '@web/components/community/feed/PostInteraction'
import type { posts } from '@web/server/db/schema'
import { api } from '@web/trpc/react'
import { BadgeCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import PostVideo from './PostVideo'

type PostType = typeof posts.$inferSelect

type FeedPostType = PostType & {
  user: {
    id: string
    firstName: string
    lastName: string
    role: string
  }
  profilePicture: string | null
} & {
  likes: { userId: string }[]
} & {
  _count: { comments: number }
}

const Post = ({
  post,
  onDeletePost,
}: {
  post: FeedPostType
  onDeletePost?: (postId: string) => void
}) => {
  const { data: user } = api.users.currentUser.useQuery()
  const userId = user?.id
  return (
    <div className="flex flex-col gap-4">
      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={post.profilePicture ?? '/assets/community/noAvatar2.png'}
            width={40}
            height={40}
            alt=""
            className="w-9 h-9 rounded-full"
          />
          <span className="font-medium flex items-center gap-1">
            {post.user.role === 'patient'
              ? 'anonymous'
              : `${post.user.firstName} ${post.user.lastName}`}
            {post.user.role !== 'patient' && (
              <BadgeCheck size={20} className="fill-violet-900 text-white" />
            )}
          </span>
        </div>
        {userId === post.user.id && (
          <PostInfo postId={post.id} onDeletePost={onDeletePost} />
        )}
      </div>
      {/* DESC */}
      <div className="flex flex-col gap-4">
        <Link href={`/community/${post.id}`} className="cursor-pointer">
          <p>{post.desc}</p>
        </Link>
        {post.img && (
          <div className="w-full min-h-96 relative">
            <Image
              src={post.img}
              fill
              className="object-cover rounded-md"
              alt=""
            />
          </div>
        )}
        {post.video && (
          <PostVideo
            id={`video-${post.id}`}
            src={
              post.video
                ? (post.video
                    .split('/upload/')[1]
                    ?.split('/')
                    .slice(1)
                    .join('/')
                    .replace(/\.[^/.]+$/, '') ?? '')
                : ''
            }
          />
        )}
      </div>
      {/* INTERACTION */}
      <Suspense fallback="Loading...">
        <PostInteraction
          postId={post.id}
          likes={post.likes.map((like) => like.userId)}
          commentNumber={post._count.comments}
        />
      </Suspense>
      <div className="h-px bg-gray-300 mt-0 w-full"></div>
    </div>
  )
}

export default Post
