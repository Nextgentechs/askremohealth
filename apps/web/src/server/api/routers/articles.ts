import { z } from 'zod'
import { procedure, publicProcedure } from '../trpc'
import { articleSchema, articleListSchema } from '../validators'
import { ArticleService } from '@web/server/services/articles'
import { db } from '@web/server/db'
import { articles, article_images } from '@web/server/db/schema'
import { eq } from 'drizzle-orm'
import { log } from 'node:console'

export const listArticles = publicProcedure
    .input(articleListSchema)
    .query(async ({ input }) => {
        log("input", input)
        return await ArticleService.getArticles(input)
    })

export const createArticle = procedure
    .input(articleSchema)
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? ""
        if (!userId) throw new Error('Unauthorized')
        const article = await ArticleService.createArticle(input, userId)
        return article
    })

export const updateArticleImage = procedure
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
    .query(async ({ input }) => {
        log("Fetching article with ID:", input.id)
        const article = await db.query.articles.findFirst({
            where: eq(articles.id, input.id),
            columns: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                publishedAt: true,
                updatedAt: true,
            },
            with: {
                image: {
                    columns: {
                        url: true,
                        path: true,
                    },
                },
            },
        })
        if (!article) {
            log("Article not found for ID:", input.id)
            throw new Error('Article not found')
        }
        log("Article found:", article)
        return article
    })