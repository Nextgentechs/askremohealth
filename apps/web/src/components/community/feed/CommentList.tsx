"use client";

import { api } from '@web/trpc/react'
import { comments } from "@web/server/db/schema";
import Image from "next/image";
import { useOptimistic, useState } from "react";
import { useFormStatus } from "react-dom";
import { BadgeCheck, Heart, Ellipsis, Trash2 } from "lucide-react";
import CommentReplies from "./CommentReplies";
import { useRouter } from 'next/navigation';


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
  parentCommentId?: string | null;
  parentCommentUser?: User | null;
};

const ChatPrivatelyButton = () => {
  const { pending } = useFormStatus();
  return (
    <button 
      className="ml-2 px-1 py-0.5 sm:px-2 sm:py-1 bg-violet-900 hover:bg-violet-700 text-white text-xs rounded transition-colors disabled:bg-violet-900/50 disabled:cursor-not-allowed"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center gap-1">
          <div className="inline-block h-[8px] w-[8px] animate-spin rounded-full border-2 border-white-300 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          Initiating Chat
        </div>
      ) : (
        "Chat Privately"
      )}
    </button>
  );
};

const CommentList = ({
  comments,
  repliesMap,
  postId,
  postAuthorId,
}: {
  comments: CommentWithUser[];
  repliesMap: Record<string, CommentWithUser[]>;
  postId: string;
  postAuthorId: string;
}) => {
  const { data: user } = api.users.currentUser.useQuery()
  const { data: doctor } = api.doctors.currentDoctor.useQuery()
  const addCommentMutation = api.community.addComment.useMutation()
  const deleteCommentMutation = api.community.deleteComment.useMutation()
  const initiateConsultMutation = api.community.initiateConsult.useMutation()

  const [commentState, setCommentState] = useState(comments);
  const [desc, setDesc] = useState("");
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const router = useRouter();

  const add = async () => {
    if (!user || !desc) return;

    addOptimisticComment({
      id: Math.random().toString(),
      desc,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      userId: user.id,
      postId: postId,
      parentCommentId: null,
      user: {
        id: user.id,
        firstName: "Sending",
        lastName: "...",
        role: user.role ?? "patient",
      },
      profilePicture: doctor?.profilePicture?.url ?? null,
    });
    try {
      const createdComment = await addCommentMutation.mutateAsync({
        postId,
        desc
      });
      
      const normalizedComment: CommentWithUser = {
        ...createdComment,
        id: createdComment.id ?? "",
        desc: createdComment.desc ?? "",
        createdAt: createdComment.createdAt ?? new Date(),
        updatedAt: createdComment.updatedAt ?? null,
        userId: createdComment.userId ?? "",
        postId: createdComment.postId ?? postId,
        parentCommentId: null,
        user: createdComment.user ?? {
          id: "",
          firstName: "",
          lastName: "",
          role: "patient",
        },
        profilePicture: createdComment.profilePicture ?? null,
      };
      setCommentState((prev) => [normalizedComment, ...prev]);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteCommentAction = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({ commentId });
      setCommentState((prev) => prev.filter(c => c.id !== commentId));
      setShowMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    commentState,
    (state, value: CommentWithUser) => [value, ...state]
  );
  return (
    <>
    {user && (
        <div className="flex items-center gap-4 mt-0">
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
        {optimisticComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4">
            <p className="font-bold">No comments yet</p>
            <p>Start the conversation</p>
          </div>
        ) : (
          optimisticComments.map((comment) => (
            <div key={comment.id}>
              <div className="flex gap-4 justify-between mt-6 ml-4">
                {/* AVATAR */}
                <Image
                  src={comment.profilePicture ?? "/assets/community/noAvatar.png"}
                  alt=""
                  width={24}
                  height={24}
                  className="w-8 h-8 rounded-full"
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
                        <form action={async () => {
                          try {
                            const result = await initiateConsultMutation.mutateAsync({
                              doctorId: comment.user.id
                            });
                            router.push(`/community/chats/${result.chatId}`);
                          } catch (err) {
                            console.error(err);
                          }
                        }}>
                          <ChatPrivatelyButton />
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
                {user?.id === comment.userId && (
                  <div className="relative">
                    <Ellipsis
                      size={16}
                      className="cursor-pointer"
                      onClick={() => setShowMenu(showMenu === comment.id ? null : comment.id)}
                    />
                    {showMenu === comment.id && (
                      <div className="absolute top-6 right-0 bg-white shadow-lg rounded-lg p-2 z-10">
                        <button
                          onClick={() => deleteCommentAction(comment.id)}
                          className="flex items-center gap-2 text-red-500 text-sm hover:bg-gray-50 px-3 py-1 rounded"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <CommentReplies
                commentId={comment.id}
                postId={postId}
                initialReplies={repliesMap[comment.id] ?? []}
                parentCommentUser={comment.user}
              />
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default CommentList;