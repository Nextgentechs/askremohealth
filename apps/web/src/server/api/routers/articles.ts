import { z } from 'zod'
import { procedure, publicProcedure } from '../trpc'
import { articleSchema, articleListSchema } from '../validators'
import { ArticleService } from '@web/server/services/articles'
import { db } from '@web/server/db'
import { articles } from '@web/server/db/schema'
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
        const article = await ArticleService.createArticle(input, userId)
        return article
    })

export const getArticleById = publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
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
        })
        if (!article) throw new Error('Article not found')
        return article
    })