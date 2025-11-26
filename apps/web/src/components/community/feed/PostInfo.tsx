"use client";

import { api } from '@web/trpc/react'; 
import { useState } from "react";
import { Ellipsis, Trash2 } from "lucide-react";

const PostInfo = ({ postId, onDeletePost }: { postId: string; onDeletePost?: (postId: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const deletePostMutation = api.community.deletePost.useMutation({
    onSuccess: () => {
      onDeletePost?.(postId);
      setOpen(false);
      setShowConfirm(false);
    }
  });

  return (
    <div className="relative">
      <Ellipsis
        size={20}
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer"
      />
      {open && (
        <div className="absolute top-4 right-0 bg-white p-4 w-32 rounded-lg flex flex-col gap-2 text-xs shadow-lg z-30">
          <button 
            className="flex items-center gap-2 text-red-500 text-sm hover:bg-gray-50 rounded"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
      
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
            <p className="mb-4 text-sm">Are you sure you want to delete this post?</p>
            <div className="flex gap-3 justify-end">
              <button 
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => deletePostMutation.mutateAsync({ postId })}
                disabled={deletePostMutation.isPending}
              >
                {deletePostMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostInfo;