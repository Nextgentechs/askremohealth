"use client";

import { api } from '@web/trpc/react'; 
import { useState } from "react";
import { Ellipsis } from "lucide-react";

const PostInfo = ({ postId }: { postId: string }) => {
  const [open, setOpen] = useState(false);

  const deletePostMutation = api.community.deletePost.useMutation({
    onSuccess: () => {
      window.location.reload();
    }
  });
  const utils = api.useUtils();

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
            className="text-red-500"
            onClick={async () => {
              await deletePostMutation.mutateAsync({ postId });
              utils.community.loadPosts.invalidate();
              setOpen(false);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PostInfo;