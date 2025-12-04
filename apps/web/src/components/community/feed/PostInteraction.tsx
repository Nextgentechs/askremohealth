"use client";

import { api } from '@web/trpc/react'
import { Heart, MessageCircleMore, Send, Link as LinkIcon, X } from "lucide-react";
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

  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = async () => {
    const postLink = `${window.location.origin}/community/${postId}`;
    try {
      await navigator.clipboard.writeText(postLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
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
        <button 
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <Send size={18}/>
        </button>
      </div>
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Share Post</h2>
              <button 
                onClick={() => setShowShareModal(false)}
                className="hover:bg-slate-100 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LinkIcon size={20} />
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      )}
      <div className="">
        
      </div>
    </div>
  );
};

export default PostInteraction;