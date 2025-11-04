import { z } from 'zod'
import { protectedProcedure, publicProcedure, adminProcedure} from '../trpc'
import { articleSchema, articleListSchema } from '../validators'
import { ArticleService } from '@web/server/services/articles'
import { db } from '@web/server/db'
import { articles, article_images } from '@web/server/db/schema'
import { eq } from 'drizzle-orm'
import { log } from 'node:console'

export const listArticles = publicProcedure
    .input(articleListSchema)
    .query(async ({ input, ctx }) => {
        log("input", input)
        return await ArticleService.getArticles(input, ctx.user ?? undefined)
    })

export const createArticle = protectedProcedure
    .input(articleSchema)
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? ""
        if (!userId) throw new Error('Unauthorized')
        const article = await ArticleService.createArticle(input, userId)
        return article
    })

export const updateArticleImage = protectedProcedure
    .input(z.object({
        articleId: z.string().uuid(),
        image: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? ""
        if (!userId) throw new Error('Unauthorized')
        return await ArticleService.updateArticleImage(input.articleId, input.image, userId)
    })

 export const getArticleById = publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
        log("Fetching article with ID:", input.id)
        const article = await ArticleService.getArticleById(input.id, ctx.user ?? undefined) // ✅ pass user

        if (!article) {
            log("Article not found for ID:", input.id)
            throw new Error('Article not found')
        }

        log("Article found:", article)
        return article
    })

export const getLatestArticles = publicProcedure
    .input(z.object({ limit: z.number().int().positive().max(100) }))
    .query(async ({ input, ctx }) => {
        log("Fetching latest articles with limit:", input.limit)
        return await ArticleService.getLatestArticles(input, ctx.user ?? undefined)
    })

export const publishArticle = adminProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
    return await ArticleService.publishArticle(input.id);
  });

export const unpublishArticle = adminProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
    return await ArticleService.unpublishArticle(input.id);
  })

export const verifyArticle = adminProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
    return await ArticleService.verifyArticle(input.id)
  })

export const deleteArticle = adminProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
    return await ArticleService.deleteArticle(input.id);
  })