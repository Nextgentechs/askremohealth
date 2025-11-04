"use server";

import { db } from "@web/server/db";
import { posts, users, likes, comments, doctors, profilePictures } from "@web/server/db/schema";
import { eq, desc, count } from "drizzle-orm";

export async function loadMorePosts(page: number) {
  const POSTS_PER_PAGE = 5;
  const offset = (page - 1) * POSTS_PER_PAGE;

  const rawPosts = await db
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
    .orderBy(desc(posts.createdAt))
    .limit(POSTS_PER_PAGE)
    .offset(offset);

  const postsData = await Promise.all(
    rawPosts.map(async (post) => {
      const postLikes = await db
        .select({ userId: likes.userId })
        .from(likes)
        .where(eq(likes.postId, post.id));

      const commentCount = await db
        .select({ count: count() })
        .from(comments)
        .where(eq(comments.postId, post.id));

      return {
        ...post,
        likes: postLikes,
        _count: { comments: commentCount[0]?.count ?? 0 },
      };
    })
  );

  return postsData;
}