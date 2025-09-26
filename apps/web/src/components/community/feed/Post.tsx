import Image from "next/image";
import Comments from "@web/components/community/feed/Comments";
import { posts } from "@web/server/db/schema";
import PostInteraction from "@web/components/community/feed/PostInteraction";
import { Suspense } from "react";
import PostInfo from "@web/components/community/feed/PostInfo";
import { api } from '@web/trpc/server'
import PostVideo from "./PostVideo";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";


type PostType = typeof posts.$inferSelect;

type FeedPostType = PostType & { 
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  profilePicture: string | null;
} & {
  likes: { userId: string; }[];
} & {
  _count: { comments: number };
};


const Post = async ({ post }: { post: FeedPostType }) => {
  const user = await api.users.currentUser();
  const userId = user?.id;
  return (
    <div className="flex flex-col gap-4">
      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={post.profilePicture ?? "/assets/community/noAvatar.png"}
            width={40}
            height={40}
            alt=""
            className="w-10 h-10 rounded-full"
          />
          <span className="font-medium flex items-center gap-1">
            
            {post.user.role === 'patient' 
                ? 'anonymous' 
                : `${post.user.firstName} ${post.user.lastName}`
            }
            {post.user.role !== 'patient' && (
            <BadgeCheck size={20} className="fill-violet-900 text-white" />
            )}
          </span>
        </div>
        {userId === post.user.id && <PostInfo postId={post.id} />}
      </div>
      {/* DESC */}
      <Link href={`/community/${post.id}`} className="cursor-pointer">
        <div className="flex flex-col gap-4">
          <p>{post.desc}</p>
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
                      ? (
                          post.video
                            .split("/upload/")[1]
                            ?.split("/").slice(1).join("/")
                            .replace(/\.[^/.]+$/, "") ?? ""
                        )
                      : ""
                  }
              />
          )}
        </div>
      </Link>
      {/* INTERACTION */}
      <Suspense fallback="Loading...">
        <PostInteraction
          postId={post.id}
          likes={post.likes.map((like) => like.userId)}
          commentNumber={post._count.comments}
        />
      </Suspense>
      <Suspense fallback="Loading...">
        <Comments postId={post.id} postAuthorId={post.user.id}/>
      </Suspense>
      <div className="h-px bg-gray-300 mt-3 w-full"></div>
    </div>
  );
};

export default Post;