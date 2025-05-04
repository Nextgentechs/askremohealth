import { count } from "drizzle-orm"
import type { ArticleListSchema } from "../api/validators"
import { db } from "../db"
import { articles } from "../db/schema"

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