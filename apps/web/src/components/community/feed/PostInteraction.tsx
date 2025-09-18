"use client";

import { switchLike } from "@web/server/services/community/actions";
import { api } from '@web/trpc/react'
import { Heart, MessageCircleMore, Send } from "lucide-react";
import { useOptimistic, useState, useEffect } from "react";

const PostInteraction = ({
  postId,
  likes,
  commentNumber,
}: {
  postId: string;
  likes: string[];
  commentNumber: number;
}) => {
  const { data: user, isLoading } = api.users.currentUser.useQuery()
  const userId = user?.id;
  const isLoaded = !isLoading;
  const [likeState, setLikeState] = useState({
    likeCount: likes.length,
    isLiked: false,
  });

  useEffect(() => {
    if (isLoaded && userId) {
        setLikeState(prev => ({
        ...prev,
        isLiked: likes.includes(userId)
        }));
    }
    }, [isLoaded, userId, likes]);

  const [optimisticLike, switchOptimisticLike] = useOptimistic(
    likeState,
    (state, value) => {
      return {
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      };
    }
  );

  const likeAction = async () => {
    switchOptimisticLike("");
    try {
      switchLike(postId);
      setLikeState((state) => ({
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      }));
    } catch (err) {}
  };
  return (
    <div className="flex items-center justify-between text-sm my-4">
      <div className="flex gap-8">
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
          <form action={likeAction}>
            <button>
            {optimisticLike.isLiked ? (
            <Heart size={18} className="w-4 h-4 fill-red-500 text-red-500 cursor-pointer" />
            ) : (
            <Heart size={18} className="w-4 h-4 cursor-pointer" />
            )}
            </button>
          </form>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            {optimisticLike.likeCount}
            <span className="hidden md:inline"> Likes</span>
          </span>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
          <MessageCircleMore size={18} />
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            {commentNumber}<span className="hidden md:inline"> Comments</span>
          </span>
        </div>
      </div>
      <div className="">
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
          <Send size={18}/>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            <span className="hidden md:inline"> Share</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostInteraction;