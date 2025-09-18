import { db } from "@web/server/db";
import { comments, users, doctors, profilePictures } from "@web/server/db/schema";
import { eq } from "drizzle-orm";
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

  return (
    <div className="">
      {/* WRITE */}
      <CommentList comments={commentsData} postId={postId} postAuthorId={postAuthorId}/>
    </div>
  );
};

export default Comments;