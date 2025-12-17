import { db } from '@web/server/db'
import {
  chats,
  comments,
  doctors,
  likes,
  posts,
  profilePictures,
  users,
} from '@web/server/db/schema'
import { and, count, desc, eq } from 'drizzle-orm'

export class CommunityService {
  private static readonly POSTS_PER_PAGE = 5

  static async loadPosts(page: number) {
    const offset = (page - 1) * this.POSTS_PER_PAGE

    const rawPosts = await db
      .select({
        id: posts.id,
        desc: posts.desc,
        content: posts.content,
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
      .limit(this.POSTS_PER_PAGE)
      .offset(offset)

    const postsData = await Promise.all(
      rawPosts.map(async (post) => {
        const postLikes = await db
          .select({ userId: likes.userId })
          .from(likes)
          .where(eq(likes.postId, post.id))

        const commentCount = await db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.postId, post.id))

        return {
          ...post,
          likes: postLikes,
          _count: { comments: commentCount[0]?.count ?? 0 },
        }
      }),
    )

    return postsData
  }

  static async getPostById(postId: string) {
    const post = await db
      .select({
        id: posts.id,
        desc: posts.desc,
        content: posts.content,
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
      .where(eq(posts.id, postId))
      .limit(1)

    if (!post[0]) {
      throw new Error('Post not found')
    }

    const postLikes = await db
      .select({ userId: likes.userId })
      .from(likes)
      .where(eq(likes.postId, postId))

    const postComments = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))

    return {
      ...post[0],
      likes: postLikes,
      comments: postComments,
      _count: { comments: postComments.length },
    }
  }

  static async createPost(
    desc: string,
    userId: string,
    img?: string,
    video?: string,
  ) {
    const [newPost] = await db
      .insert(posts)
      .values({
        desc,
        userId,
        ...(img?.trim() && { img }),
        ...(video?.trim() && { video }),
      })
      .returning()

    return newPost
  }

  static async deletePost(postId: string, userId: string) {
    await db
      .delete(posts)
      .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
  }

  static async toggleLike(postId: string, userId: string) {
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
      .limit(1)

    if (existingLike.length > 0 && existingLike[0]) {
      await db.delete(likes).where(eq(likes.id, existingLike[0].id))
      return { liked: false }
    } else {
      await db.insert(likes).values({ postId, userId })
      return { liked: true }
    }
  }

  static async addComment(postId: string, desc: string, userId: string) {
    const [createdComment] = await db
      .insert(comments)
      .values({
        content: desc,
        desc,
        userId,
        postId,
      })
      .returning()

    const userData = await db
      .select({
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
        profilePicture: profilePictures.url,
      })
      .from(users)
      .leftJoin(doctors, eq(users.id, doctors.userId))
      .leftJoin(profilePictures, eq(doctors.id, profilePictures.doctorId))
      .where(eq(users.id, userId))
      .limit(1)

    return {
      ...createdComment,
      user: userData[0]?.user ?? {
        id: userId,
        firstName: '',
        lastName: '',
        role: 'patient' as const,
      },
      profilePicture: userData[0]?.profilePicture ?? null,
    }
  }

  static async addReply(
    postId: string,
    parentCommentId: string,
    desc: string,
    userId: string,
  ) {
    const [createdReply] = await db
      .insert(comments)
      .values({
        content: desc,
        desc,
        userId,
        postId,
        parentCommentId,
      })
      .returning()

    // reply user data
    const userData = await db
      .select({
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
        profilePicture: profilePictures.url,
      })
      .from(users)
      .leftJoin(doctors, eq(users.id, doctors.userId))
      .leftJoin(profilePictures, eq(doctors.id, profilePictures.doctorId))
      .where(eq(users.id, userId))
      .limit(1)

    // parent comment user info
    const parentCommentData = await db
      .select({
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, parentCommentId))
      .limit(1)

    return {
      ...createdReply,
      user: userData[0]?.user ?? {
        id: userId,
        firstName: '',
        lastName: '',
        role: 'patient' as const,
      },
      profilePicture: userData[0]?.profilePicture ?? null,
      parentCommentUser: parentCommentData[0]?.user ?? null,
    }
  }

  static async deleteComment(commentId: string, userId: string) {
    await db
      .delete(comments)
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
  }

  static async initiateConsult(doctorId: string, patientId: string) {
    const chatId = `${patientId}-${doctorId}`

    await db
      .insert(chats)
      .values({
        id: chatId,
        doctorId,
        patientId,
      })
      .onConflictDoNothing()

    return { chatId }
  }
}
