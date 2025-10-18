"use client";

import { useState, useEffect, useRef } from "react";
import Post from "./Post";
import { loadMorePosts } from "@web/server/services/community/feed_actions";

type PostData = Awaited<ReturnType<typeof loadMorePosts>>[number];

const Feed = ({ initialPosts }: { initialPosts: PostData[] }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length === 5);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          setLoading(true);
          loadMorePosts(page + 1).then(newPosts => {
            if (newPosts.length < 5) setHasMore(false);
            setPosts(prev => [...prev, ...newPosts]);
            setPage(prev => prev + 1);
            setLoading(false);
          });
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-3">
      {posts.length ? (
        posts.map(post => <Post key={post.id} post={post} />)
      ) : (
        "No posts found!"
      )}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-900"></div>
        </div>
      )}
      <div ref={observerRef} className="h-4" />
    </div>
  );
};

export default Feed;