import { count, and } from "drizzle-orm"
import type { ArticleListSchema } from "../api/validators"
import { db } from "../db"
import { articles } from "../db/schema"
import { eq, isNotNull } from "drizzle-orm"

export class ArticleService {
    static async getArticles(input: ArticleListSchema) {
        const offset = (input.page - 1) * input.limit
        const [countResult, articlesList] = await Promise.all([
            db.select({ count: count() }).from(articles).then((res) => Number(res[0]?.count)),
            db.query.articles.findMany({
                columns: {
                    id: true,
                    title: true,
                    content: true,
                    publishedAt: true,
                    createdAt: true,
                    updatedAt: true
                },
                limit: input.limit,
                offset,
                orderBy: (articles, { desc }) => [desc(articles.createdAt)],
            }),
        ])
        return { totalCount: countResult, articlesList }
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
                updatedAt: true
            }
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
}