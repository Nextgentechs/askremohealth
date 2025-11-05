"use client";

import { useState } from "react";
import { api } from '@web/trpc/react';
import Image from "next/image";
import { BadgeCheck, Heart, Ellipsis, Trash2 } from "lucide-react";
import { useOptimistic } from "react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
};

type Reply = {
  id: string;
  desc: string;
  createdAt: Date;
  updatedAt: Date | null;
  userId: string;
  postId: string;
  parentCommentId: string | null;
  user: User;
  profilePicture: string | null;
  parentCommentUser?: User | null;
};

const CommentReplies = ({
  commentId,
  postId,
  initialReplies,
  parentCommentUser,
}: {
  commentId: string;
  postId: string;
  initialReplies: Reply[];
  parentCommentUser: User;
}) => {
  const { data: user } = api.users.currentUser.useQuery();
  const { data: doctor } = api.doctors.currentDoctor.useQuery();
  const addReplyMutation = api.community.addReply.useMutation();
  const deleteCommentMutation = api.community.deleteComment.useMutation();

  const [showReplies, setShowReplies] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [repliesState, setRepliesState] = useState(initialReplies);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const addReplyAction = async () => {
    if (!user || !replyInput) return;

    addOptimisticReply({
      id: Math.random().toString(),
      desc: replyInput,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
      postId,
      parentCommentId: commentId,
      user: {
        id: user.id,
        firstName: "Sending",
        lastName: "Please Wait...",
        role: user.role ?? "patient",
      },
      profilePicture: doctor?.profilePicture?.url ?? null,
      parentCommentUser,
    });

    try {
      const createdReply = await addReplyMutation.mutateAsync({
        postId,
        parentCommentId: commentId,
        desc: replyInput
      });
      setRepliesState((prev) => [...prev, createdReply as Reply]);
      setReplyInput("");
    } catch (err) {
      console.log(err);
    }
  };

  const deleteReplyAction = async (replyId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({ commentId: replyId });
      setRepliesState((prev) => prev.filter(r => r.id !== replyId));
      setShowMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const [optimisticReplies, addOptimisticReply] = useOptimistic(
    repliesState,
    (state, value: Reply) => [...state, value]
  );

  const getDisplayName = (u: User) => {
    return u.role === 'patient' ? 'anonymous' : `${u.firstName} ${u.lastName}`;
  };

  return (
    <div className="ml-12 mt-2">
      {optimisticReplies.length > 0 && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          {showReplies ? 'Hide replies' : `View replies (${optimisticReplies.length})`}
        </button>
      )}

      {showReplies && (
        <div className="space-y-4">
          {optimisticReplies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Image
                src={reply.profilePicture ?? "/assets/community/noAvatar.png"}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      {getDisplayName(reply.user)}
                      {reply.parentCommentUser && (
                        <>
                          <span className="text-gray-400 mx-1">›</span>
                          {getDisplayName(reply.parentCommentUser)}
                        </>
                      )}
                      {reply.user.role !== 'patient' && (
                        <BadgeCheck size={16} className="fill-violet-900 text-white" />
                      )}
                    </span>
                    {user?.id === reply.userId && (
                      <div className="relative">
                        <Ellipsis
                          size={16}
                          className="cursor-pointer"
                          onClick={() => setShowMenu(showMenu === reply.id ? null : reply.id)}
                        />
                        {showMenu === reply.id && (
                          <div className="absolute top-6 right-0 bg-white shadow-lg rounded-lg p-2 z-10">
                            <button
                              onClick={() => deleteReplyAction(reply.id)}
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
                  <p className="text-sm">{reply.desc}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 ml-2">
                  <Heart size={14} className="cursor-pointer" />
                  <span>0 Likes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && (
        <form action={addReplyAction} className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={replyInput}
            placeholder="Write a reply..."
            className="flex-1 bg-gray-50 rounded-full text-sm px-4 py-1.5 outline-none"
            onChange={(e) => setReplyInput(e.target.value)}
          />
        </form>
      )}
    </div>
  );
};

export default CommentReplies;