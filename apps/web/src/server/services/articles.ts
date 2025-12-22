import { and, count, eq, isNotNull } from 'drizzle-orm'
import sharp from 'sharp'
import type { ArticleListSchema } from '../api/validators'
import { db } from '../db'
import { article_images, articles } from '../db/schema'
import { deleteFile, uploadFile } from '../lib/storage'

export class ArticleService {
  /**
   * Fetch paginated articles.
   * - Admins: See all articles.
   * - Public users: See only verified + published articles.
   */
  static async getArticles(input: ArticleListSchema, user?: { role?: string }) {
    const offset = (input.page - 1) * input.limit
    const isAdmin = user?.role === 'admin'

    const whereClause = isAdmin
      ? isNotNull(articles.createdAt)
      : and(
          eq(articles.status, 'published'),
          eq(articles.verified, true),
          isNotNull(articles.publishedAt),
        )

    const [countResult, articlesList] = await Promise.all([
      db
        .select({ count: count() })
        .from(articles)
        .where(whereClause)
        .then((res) => Number(res[0]?.count ?? 0)),

      db.query.articles.findMany({
        columns: {
          id: true,
          title: true,
          content: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          verified: true,
          status: true,
        },
        with: {
          image: {
            columns: { url: true, path: true },
          },
        },
        where: whereClause,
        limit: input.limit,
        offset,
        orderBy: (articles, { desc }) => [desc(articles.createdAt)],
      }),
    ])

    return { totalCount: countResult, articlesList }
  }

  /**
   * Get the latest articles.
   * - Admins: All.
   * - Public: Verified + published only.
   */
  static async getLatestArticles(
    input: { limit: number },
    user?: { role?: string },
  ) {
    const isAdmin = user?.role === 'admin'

    const whereClause = isAdmin
      ? isNotNull(articles.createdAt)
      : and(
          eq(articles.status, 'published'),
          eq(articles.verified, true),
          isNotNull(articles.publishedAt),
        )

    const articlesList = await db.query.articles.findMany({
      columns: {
        id: true,
        title: true,
        content: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        verified: true,
        status: true,
      },
      with: {
        image: {
          columns: { url: true, path: true },
        },
      },
      where: whereClause,
      limit: input.limit,
      orderBy: (articles, { desc }) => [desc(articles.publishedAt)],
    })

    return { articlesList }
  }

  /**
   * Get a single article by ID.
   * - Public: only published + verified.
   * - Admin: any.
   */
  static async getArticleById(id: string, user?: { role?: string }) {
    const isAdmin = user?.role === 'admin'

    const whereClause = isAdmin
      ? eq(articles.id, id)
      : and(
          eq(articles.id, id),
          eq(articles.status, 'published'),
          eq(articles.verified, true),
          isNotNull(articles.publishedAt),
        )

    const article = await db.query.articles.findFirst({
      where: whereClause,
      columns: {
        id: true,
        title: true,
        content: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        verified: true,
        status: true,
      },
      with: {
        image: {
          columns: { url: true, path: true },
        },
      },
    })

    return article
  }

  /**
   * Create a new article (author action).
   */
  static async createArticle(
    input: { title: string; content: string },
    userId: string,
  ) {
    const article = await db
      .insert(articles)
      .values({
        title: input.title,
        content: input.content,
        authorId: userId,
        status: 'draft',
        verified: false,
      })
      .returning()
      .then((res) => res[0])
    return article
  }

  /**
   * Update or replace an article's image.
   * Only author can update their article image.
   */
  static async updateArticleImage(
    articleId: string,
    image: string,
    userId: string,
  ) {
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
      with: { image: true },
    })

    if (!article) throw new Error('Article not found')
    if (article.authorId !== userId) throw new Error('Unauthorized')

    // Delete old image
    if (article.image) await deleteFile(article.image.url)

    // Convert + upload new one
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = await sharp(Buffer.from(base64Data, 'base64'))
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toBuffer()

    const fileName = `article-image-${articleId}.webp`
    const { url, pathname } = await uploadFile(fileName, buffer, {
      contentType: 'image/webp',
      access: 'public',
    })

    const [articleImage] = await db
      .insert(article_images)
      .values({ articleId, url, path: pathname })
      .onConflictDoUpdate({
        target: article_images.articleId,
        set: { url, path: pathname, updatedAt: new Date() },
      })
      .returning()

    return articleImage
  }
  static async unpublishArticle(articleId: string) {
    await db
      .update(articles)
      .set({
        status: 'draft',
        publishedAt: null,
      })
      .where(eq(articles.id, articleId))
    return { success: true, message: 'Article unpublished successfully' }
  }

  static async verifyArticle(articleId: string) {
    await db
      .update(articles)
      .set({ verified: true })
      .where(eq(articles.id, articleId))
    return { success: true, message: 'Article verified successfully' }
  }

  static async deleteArticle(articleId: string) {
    await db.delete(articles).where(eq(articles.id, articleId))
    return { success: true, message: 'Article deleted' }
  }
  static async publishArticle(articleId: string) {
    await db
      .update(articles)
      .set({
        status: 'published',
        publishedAt: new Date(),
      })
      .where(eq(articles.id, articleId))
    return { success: true, message: 'Article published successfully' }
  }
}
