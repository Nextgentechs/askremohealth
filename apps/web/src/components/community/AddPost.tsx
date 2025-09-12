"use client";

import { useUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState } from "react";
import AddPostButton from "@web/components/community/AddPostButton";
import { addPost } from "@web/server/services/community/actions";
import { ImageIcon, Video } from "lucide-react";

const AddPost = () => {
  const { user, isLoaded } = useUser();
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState<any>();
  const [video, setVideo] = useState<any>();

  if (!isLoaded) {
    return "Loading...";
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex gap-4 justify-between text-sm">
      {/* AVATAR */}
      <Image
        src={user?.imageUrl || "/noAvatar.png"}
        alt=""
        width={48}
        height={48}
        className="w-12 h-12 object-cover rounded-full"
      />
      {/* POST */}
      <div className="flex-1">
        {/* TEXT INPUT */}
        <form action={(formData)=>addPost(formData, img?.secure_url || "", video?.secure_url || "")} className="flex gap-4">
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
              setImg(result.info);
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
                    setVideo(result.info);
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