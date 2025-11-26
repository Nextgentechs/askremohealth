import { db } from "@web/server/db";
import { posts, users, likes, comments, doctors, profilePictures } from "@web/server/db/schema";
import { eq, desc, count } from "drizzle-orm";
import Image from "next/image";
import Comments from "@web/components/community/feed/Comments";
import PostInteraction from "@web/components/community/feed/PostInteraction";
import { Suspense } from "react";
import PostInfo from "@web/components/community/feed/PostInfo";
import { api } from '@web/trpc/server';
import PostVideo from "@web/components/community/feed/PostVideo";
import { BadgeCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SinglePostProps {
  postId: string;
}

const SinglePost = async ({ postId }: SinglePostProps) => {
  const rawPost = await db
    .select({
      id: posts.id,
      desc: posts.desc,
      img: posts.img,
      video: posts.video,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      userId: posts.userId,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      },
      profilePicture: profilePictures.url,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(doctors, eq(users.id, doctors.userId))
    .leftJoin(profilePictures, eq(doctors.id, profilePictures.doctorId))
    .where(eq(posts.id, postId))
    .limit(1);

  if (!rawPost.length) {
    notFound();
  }

  const postBase = rawPost[0]!;

  const postLikes = await db
    .select({ userId: likes.userId })
    .from(likes)
    .where(eq(likes.postId, postBase.id));

  const commentCount = await db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.postId, postBase.id));

  const post = {
    ...postBase,
    likes: postLikes,
    _count: {
      comments: commentCount[0]?.count ?? 0,
    },
  };

  const user = await api.users.currentUser();
  const userId = user?.id;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <div className="flex items-center gap-6 mb-6">
        <Link 
          href="/community" 
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="text-xl font-semibold">Post</div>
      </div>

      {/* Post content */}
      <div className="flex flex-col gap-2">
        {/* USER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={post.profilePicture ?? "/assets/community/noAvatar2.png"}
              width={40}
              height={40}
              alt=""
              className="w-9 h-9 rounded-full"
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

        {/* INTERACTION */}
        <Suspense fallback="Loading...">
          <PostInteraction
            postId={post.id}
            likes={post.likes.map((like) => like.userId)}
            commentNumber={post._count.comments}
          />
        </Suspense>

        {/* COMMENTS */}
        <Suspense fallback="Loading...">
          <Comments postId={post.id} postAuthorId={post.user.id}/>
        </Suspense>
      </div>
    </div>
  );
};

export default SinglePost;