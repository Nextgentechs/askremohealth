import { db } from "@web/server/db";
import { comments, users, doctors, profilePictures } from "@web/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import CommentList from "./CommentList";

const Comments = async ({postId, postAuthorId}:{postId:string, postAuthorId: string}) => {

  const commentsData = await db
    .select({
      id: comments.id,
      desc: comments.desc,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userId: comments.userId,
      postId: comments.postId,
      parentCommentId: comments.parentCommentId,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      },
      profilePicture: profilePictures.url,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .leftJoin(doctors, eq(users.id, doctors.userId))
    .leftJoin(profilePictures, eq(doctors.id, profilePictures.doctorId))
    .where(eq(comments.postId, postId));

  // Get parent comment users for replies
  const parentCommentIds = commentsData
    .filter(c => c.parentCommentId)
    .map(c => c.parentCommentId!);

  const parentUsers = parentCommentIds.length > 0 
    ? await db
        .select({
          commentId: comments.id,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
          },
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(inArray(comments.id, parentCommentIds))
    : [];

  const commentsWithParentUsers = commentsData.map(comment => ({
    ...comment,
    parentCommentUser: comment.parentCommentId
      ? parentUsers.find(p => p.commentId === comment.parentCommentId)?.user ?? null
      : null,
  }));

  // Separate top-level comments and replies
  const topLevelComments = commentsWithParentUsers.filter(c => !c.parentCommentId);
  const repliesMap = commentsWithParentUsers
    .filter((c): c is typeof c & { parentCommentId: string } => c.parentCommentId !== null)
    .reduce((acc, reply) => {
      acc[reply.parentCommentId] ??= [];
      acc[reply.parentCommentId]!.push(reply);
      return acc;
    }, {} as Record<string, Array<typeof commentsWithParentUsers[number]>>);

  return (
    <div className="mt-3">
      <CommentList 
        comments={topLevelComments} 
        repliesMap={repliesMap}
        postId={postId} 
        postAuthorId={postAuthorId}
      />
    </div>
  );
};

export default Comments;