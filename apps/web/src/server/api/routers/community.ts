// apps/web/src/server/trpc/routers/community.ts
import { z } from "zod";
import { db } from "@web/server/db";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { posts, comments, likes, users } from "@web/server/db/schema";
import { protectedProcedure, publicProcedure } from "../trpc";

export const communityRouter = {
  // Fetch paginated posts
  loadPosts: publicProcedure
    .input(z.object({ page: z.number().min(1) }))
    .query(async ({ input }) => {
      const POSTS_PER_PAGE = 5;
      const offset = (input.page - 1) * POSTS_PER_PAGE;

      const rawPosts = await db.query.posts.findMany({
        limit: POSTS_PER_PAGE,
        offset,
        orderBy: sql`${posts.createdAt} DESC`, // call desc() as function
        with: {
          user: true,
          likes: true,
          comments: {
            with: {
              user: true,
              likes: true,
              replies: {
                with: { user: true, likes: true }
              }
            }
          }
        }
      });

      return rawPosts.map(post => ({
        id: post.id,
        desc: post.desc,
        img: post.img,
        video: post.video,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
        likes: post.likes.map(l => ({ userId: l.userId })),
        comments: post.comments,
        _count: { comments: post.comments?.length ?? 0 }
      }));
    }),

  // Fetch a single post
  getPostById: publicProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.postId),
        with: {
          user: true,
          likes: true,
          comments: {
            with: {
              user: true,
              likes: true,
              replies: { with: { user: true, likes: true } }
            }
          }
        }
      });

      if (!post) throw new Error("Post not found");

      return {
        id: post.id,
        desc: post.desc,
        img: post.img,
        video: post.video,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
        likes: post.likes.map(l => ({ userId: l.userId })),
        comments: post.comments,
        _count: { comments: post.comments?.length ?? 0 }
      };
    }),

  // Add a post
  addPost: protectedProcedure
    .input(z.object({
      desc: z.string().min(1).max(255),
      img: z.string().optional(),
      video: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const [newPost] = await db.insert(posts).values({
        desc: input.desc,
        userId: ctx.user.id,
        ...(input.img && { img: input.img }),
        ...(input.video && { video: input.video }),
      }).returning();

      return newPost;
    }),

  // Delete a post
  deletePost: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db.delete(posts).where(eq(posts.id, input.postId));
      return { success: true };
    }),

  // Add a comment
  addComment: protectedProcedure
    .input(z.object({
      postId: z.string().uuid(),
      desc: z.string().min(1).max(255),
      parentCommentId: z.string().uuid().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const [newComment] = await db.insert(comments).values({
        desc: input.desc,
        postId: input.postId,
        parentCommentId: input.parentCommentId,
        userId: ctx.user.id,
      }).returning();

      return newComment;
    }),

  // Toggle a like
  switchLike: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await db.query.likes.findFirst({
        where: and(
          eq(likes.postId, input.postId),
          eq(likes.userId, ctx.user.id)
        )
      });

      if (existing) {
        await db.delete(likes).where(eq(likes.id, existing.id));
      } else {
        await db.insert(likes).values({ postId: input.postId, userId: ctx.user.id });
      }

      return { success: true };
    }),
};
