import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { CommunityService } from "@web/server/services/community";

export const communityRouter = {
 
  loadPosts: publicProcedure
    .input(z.object({ page: z.number().min(1) }))
    .query(async ({ input }) => {
      return CommunityService.loadPosts(input.page);
    }),

  getPostById: publicProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .query(async ({ input }) => {
      return CommunityService.getPostById(input.postId);
    }),

  addPost: protectedProcedure
    .input(
      z.object({
        desc: z.string().min(1).max(255),
        img: z.string().optional(),
        video: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return CommunityService.createPost(
        input.desc,
        ctx.user.id,
        input.img,
        input.video
      );
    }),

  deletePost: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await CommunityService.deletePost(input.postId, ctx.user.id);
      return { success: true };
    }),

  switchLike: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return CommunityService.toggleLike(input.postId, ctx.user.id);
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        desc: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return CommunityService.addComment(
        input.postId,
        input.desc,
        ctx.user.id
      );
    }),

  addReply: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        parentCommentId: z.string().uuid(),
        desc: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return CommunityService.addReply(
        input.postId,
        input.parentCommentId,
        input.desc,
        ctx.user.id
      );
    }),

  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await CommunityService.deleteComment(input.commentId, ctx.user.id);
      return { success: true };
    }),

  initiateConsult: protectedProcedure
    .input(z.object({ doctorId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return CommunityService.initiateConsult(input.doctorId, ctx.user.id);
    }),
};