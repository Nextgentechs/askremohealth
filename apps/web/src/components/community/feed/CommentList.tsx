"use client";

import { addComment, initiateConsult } from "@web/server/services/community/actions";
import { api } from '@web/trpc/react'
import { comments } from "@web/server/db/schema";
import Image from "next/image";
import { useOptimistic, useState } from "react";
import { BadgeCheck, Heart } from "lucide-react";


type Comment = typeof comments.$inferSelect;

type User = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
};

type CommentWithUser = Comment & { 
  user: User;
  profilePicture: string | null;
};

const CommentList = ({
  comments,
  postId,
  postAuthorId,
}: {
  comments: CommentWithUser[];
  postId: string;
  postAuthorId: string;
}) => {
  const { data: user } = api.users.currentUser.useQuery()
  const { data: doctor } = api.doctors.currentDoctor.useQuery()
  const [commentState, setCommentState] = useState(comments);
  const [desc, setDesc] = useState("");

  const add = async () => {
    if (!user || !desc) return;

    addOptimisticComment({
      id: Math.random().toString(),
      desc,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      userId: user.id,
      postId: postId,
      user: {
        id: user.id,
        firstName: "Sending",
        lastName: "Please Wait...",
        role: user.role ?? "patient",
      },
      profilePicture: doctor?.profilePicture?.url ?? null,
    });
    try {
      const createdComment = await addComment(postId, desc);
      // Ensure createdComment matches CommentWithUser type
      const normalizedComment: CommentWithUser = {
        ...createdComment,
        id: createdComment.id ?? "",
        desc: createdComment.desc ?? "",
        createdAt: createdComment.createdAt ?? new Date(),
        updatedAt: createdComment.updatedAt ?? null,
        userId: createdComment.userId ?? "",
        postId: createdComment.postId ?? postId,
        user: createdComment.user ?? {
          id: "",
          firstName: "",
          lastName: "",
          role: "patient",
        },
        profilePicture: createdComment.profilePicture ?? null,
      };
      setCommentState((prev) => [normalizedComment, ...prev]);
    } catch (err) {}
  };

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    commentState,
    (state, value: CommentWithUser) => [value, ...state]
  );
  return (
    <>
      {user && (
        <div className="flex items-center gap-4">
          <Image
            src={doctor?.profilePicture?.url ?? "/assets/community/noAvatar.png"}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
          <form
            action={add}
            className="flex-1 flex items-center justify-between bg-slate-100 rounded-xl text-sm px-6 py-2 w-full"
          >
            <input
              type="text"
              placeholder="Write a comment..."
              className="bg-transparent outline-none flex-1"
              onChange={(e) => setDesc(e.target.value)}
            />
          </form>
        </div>
      )}
      <div className="">
        {/* COMMENT */}
        {optimisticComments.map((comment) => (
          <div className="flex gap-4 justify-between mt-6 ml-4" key={comment.id}>
            
            {/* AVATAR */}
            <Image
              src={comment.profilePicture ?? "/assets/community/noAvatar.png"}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-full"
            />
            {/* DESC */}
            <div className="flex flex-col gap-2 flex-1">
              <span className="font-medium flex items-center gap-1">
                {comment.user.role === 'patient' 
                    ? 'anonymous' 
                    : `${comment.user.firstName} ${comment.user.lastName}`
                }
                {comment.user.role !== 'patient' && (
                    <BadgeCheck size={20} className="fill-violet-900 text-white" />
                )}
                {comment.user.role === 'doctor' && 
                user?.id === postAuthorId && (
                    <form action={() => initiateConsult(comment.user.id, user.id)}>
                        <button className="ml-2 px-1 py-0.5 sm:px-2 sm:py-1 bg-violet-900 hover:bg-violet-700 text-white text-xs rounded transition-colors">
                        Consult
                        </button>
                    </form>
                )}
              </span>
              <p>{comment.desc}</p>
              <div className="flex items-center gap-8 text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-4">
                  <Heart size={18} className="w-4 h-4 cursor-pointer" />
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">0 Likes</span>
                </div>
                <div className="">Reply</div>
              </div>
            </div>
            {/* ICON */}
            <Image
              src="/more.png"
              alt=""
              width={16}
              height={16}
              className="cursor-pointer w-4 h-4"
            ></Image>
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentList;