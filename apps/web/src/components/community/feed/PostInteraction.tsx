"use client";

import { api } from '@web/trpc/react'
import { Heart, MessageCircleMore, Send } from "lucide-react";
import Link from 'next/link';
import { useOptimistic, useState, useEffect, startTransition } from "react";

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
  const switchLikeMutation = api.community.switchLike.useMutation();

  const utils = api.useUtils();

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
    const previousLikeState = { ...likeState };
    
    startTransition(() => {
      switchOptimisticLike("");
    });
    
    setLikeState(prev => ({
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      isLiked: !prev.isLiked,
    }));
    
    try {
      await switchLikeMutation.mutateAsync({ postId });
    } catch (err) {
      setLikeState(previousLikeState);
      startTransition(() => {
        switchOptimisticLike("");
      });
      console.log("Failed to switch like:", err);
    }
  };

  return (
    <div className="flex items-center justify-between text-sm -my-1">
      <div className="flex gap-8 mt-3">
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
          <button onClick={likeAction}>
            {optimisticLike.isLiked ? (
              <Heart size={18} className="w-4 h-4 fill-red-500 text-red-500 cursor-pointer" />
            ) : (
              <Heart size={18} className="w-4 h-4 cursor-pointer" />
            )}
          </button>
          <span className="text-gray-500">
            {optimisticLike.likeCount}
          </span>
        </div>
        <Link href={`/community/${postId}`}>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
            <MessageCircleMore size={18} />
            <span className="text-gray-500">
              {commentNumber}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
          <Send size={18}/>
        </div>
      </div>
      <div className="">
        
      </div>
    </div>
  );
};

export default PostInteraction;