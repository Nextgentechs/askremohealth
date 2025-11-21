"use client";

import { useState, useEffect, useRef } from "react";
import Post from "./Post";
import { api } from '@web/trpc/react';

type PostData = Parameters<typeof Post>[0]['post'];

const Feed = ({ initialPosts }: { initialPosts: PostData[] }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length === 5);
  const observerRef = useRef<HTMLDivElement>(null);

  const { data: newPosts, isLoading, refetch } = api.community.loadPosts.useQuery(
    { page: 1 }
  );

  // Listen for invalidations and prepend new posts
  useEffect(() => {
    if (newPosts && newPosts.length > 0) {
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const freshPosts = newPosts.filter(p => !existingIds.has(p.id));
        return [...freshPosts, ...prev];
      });
    }
  }, [newPosts]);

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) { 
          refetch().then(({ data }) => { 
            if (data && data.length < 5) setHasMore(false);
            if (data) setPosts(prev => [...prev, ...data]);
            setPage(prev => prev + 1);
          });
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, isLoading, refetch]);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-3">
      {posts.length ? (
        posts.map(post => (
          <Post 
            key={post.id} 
            post={post} 
            onDeletePost={handleDeletePost}
          />
        ))
      ) : (
        "No posts found!"
      )}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-900"></div>
        </div>
      )}
      <div ref={observerRef} className="h-4" />
    </div>
  );
};

export default Feed;