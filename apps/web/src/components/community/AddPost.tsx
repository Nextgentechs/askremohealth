"use client";

import { api } from '@web/trpc/react'
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState } from "react";
import AddPostButton from "@web/components/community/AddPostButton";
import { addPost } from "@web/server/services/community/actions";
import { ImageIcon, Video } from "lucide-react";


const AddPost = () => {
  
  const { data: user, isLoading } = api.users.currentUser.useQuery()
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState<{ secure_url: string } | null>(null);
  const [video, setVideo] = useState<{ secure_url: string } | null>(null);

  

  if (isLoading) {
    return "Loading...";
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex gap-4 justify-between text-sm">
      {/* AVATAR */}
      <Image
        src="/assets/community/noAvatar.png"
        alt=""
        width={48}
        height={48}
        className="w-12 h-12 object-cover rounded-full"
      />
      {/* POST */}
      <div className="flex-1">
        {/* TEXT INPUT */}
        <form action={async (formData) => {
            await addPost(formData, img?.secure_url ?? "", video?.secure_url ?? "");
        }} className="flex gap-4">
          <textarea
            placeholder="Make a new post anonymously"
            className="flex-1 bg-slate-100 rounded-lg p-2"
            name="desc"
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
          <div className="">
            <AddPostButton />
          </div>
        </form>
        {/* POST OPTIONS */}
        <div className="flex items-center gap-4 mt-4 text-gray-400 flex-wrap">
          <CldUploadWidget
          signatureEndpoint="/api/community/signed-cloudinary"
          onSuccess={(result, { widget }) => {
                if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
                    setImg(result.info as { secure_url: string });
                }
                widget.close();
            }}
          >
            {({ open }) => {
              return (
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => open()}
                >
                  <ImageIcon className="text-green-500"/>
                  Photo
                </div>
              );
            }}
          </CldUploadWidget>
          <CldUploadWidget
                signatureEndpoint="/api/community/signed-cloudinary"
                options={{
                resourceType: "video"
                }}
                onSuccess={(result, { widget }) => {
                    if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
                        setVideo(result.info as { secure_url: string });
                    }
                    widget.close();
                }}
          >
                {({ open }) => {
                return (
                    <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => open()}
                    >
                    <Video className="text-red-500"/>
                    Video
                    </div>
                );
                }}
          </CldUploadWidget>
        </div>
      </div>
    </div>
  );
};

export default AddPost;