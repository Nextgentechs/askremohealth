import { count, and } from "drizzle-orm"
import type { ArticleListSchema } from "../api/validators"
import { db } from "../db"
import { articles, article_images } from "../db/schema"
import { eq, isNotNull } from "drizzle-orm"
import { del, put } from '@vercel/blob'
import sharp from 'sharp'

export class ArticleService {
    static async getArticles(input: ArticleListSchema) {
        const offset = (input.page - 1) * input.limit
        const [countResult, articlesList] = await Promise.all([
            db.select({ count: count() }).from(articles).where(isNotNull(articles.createdAt)).then((res) => Number(res[0]?.count)),
            db.query.articles.findMany({
                columns: {
                    id: true,
                    title: true,
                    content: true,
                    publishedAt: true,
                    createdAt: true,
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
                where: isNotNull(articles.createdAt),
                limit: input.limit,
                offset,
                orderBy: (articles, { desc }) => [desc(articles.createdAt)],
            }),
        ])
        return { totalCount: countResult, articlesList }
    }

    static async getLatestArticles(input: { limit: number }) {
        const articlesList = await db.query.articles.findMany({
            columns: {
                id: true,
                title: true,
                content: true,
                publishedAt: true,
                createdAt: true,
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
            limit: input.limit,
            orderBy: (articles, { desc }) => [desc(articles.createdAt)],
        })
        return { articlesList }
    }

    static async getArticleById(id: string) {
        const article = await db.query.articles.findFirst({
            where: and(eq(articles.id, id), isNotNull(articles.publishedAt)),
            columns: {
                id: true,
                title: true,
                content: true,
                publishedAt: true,
                createdAt: true,
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
        return article
    }

    static async createArticle(input: { title: string; content: string }, userId: string) {
        const article = await db
            .insert(articles)
            .values({
                title: input.title,
                content: input.content,
                authorId: userId,
            })
            .returning()
            .then((res) => res[0])
        return article
    }

    static async updateArticleImage(articleId: string, image: string, userId: string) {
        const article = await db.query.articles.findFirst({
            where: eq(articles.id, articleId),
            with: {
                image: true,
            },
        })

        if (!article) {
            throw new Error('Article not found')
        }

        if (article.authorId !== userId) {
            throw new Error('Unauthorized')
        }

        if (article.image) {
            await del(article.image.url)
        }

        const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
        const buffer = await sharp(Buffer.from(base64Data, 'base64'))
            .resize(400, 400, { fit: 'cover', position: 'center' })
            .webp({ quality: 80 })
            .toBuffer()

        const fileName = `article-image-${articleId}.webp`
        const { url, pathname } = await put(fileName, buffer, {
            access: 'public',
            contentType: 'image/webp',
        })

        const [articleImage] = await db
            .insert(article_images)
            .values({
                articleId,
                url,
                path: pathname,
            })
            .onConflictDoUpdate({
                target: article_images.articleId,
                set: {
                    url,
                    path: pathname,
                    updatedAt: new Date(),
                },
            })
            .returning()

        return articleImage
    }
}