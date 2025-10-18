"use client";

import { deletePost } from "@web/server/services/community/actions";
import { useState } from "react";
import { Ellipsis } from "lucide-react";

const PostInfo = ({ postId }: { postId: string }) => {
  const [open, setOpen] = useState(false);

  const deletePostWithId = deletePost.bind(null, postId);
  return (
    <div className="relative">
      <Ellipsis
        size={20}
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer"
      />
      {open && (
        <div className="absolute top-4 right-0 bg-white p-4 w-32 rounded-lg flex flex-col gap-2 text-xs shadow-lg z-30">
          
          <form action={async () => {
            await deletePostWithId();
            window.location.reload();
          }}>
            <button className="text-red-500">Delete</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostInfo;