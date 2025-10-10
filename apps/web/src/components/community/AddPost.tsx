"use client";

import { api } from '@web/trpc/react'
import Image from "next/image";
import { useState, useRef } from "react";
import AddPostButton from "@web/components/community/AddPostButton";
import { addPost } from "@web/server/services/community/actions";
import { ImageIcon, Video, X } from "lucide-react";
import toast from 'react-hot-toast'
import imageCompression from 'browser-image-compression';


const AddPost = () => {
  const { data: user, isLoading } = api.users.currentUser.useQuery()
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState<{ secure_url: string } | null>(null);
  const [video, setVideo] = useState<{ secure_url: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const [imageFileName, setImageFileName] = useState<string>("");
  const [videoFileName, setVideoFileName] = useState<string>("");
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Compression failed:', error);
      return file;
    }
  };

  const uploadToCloudinary = async (file: File, resourceType: 'image' | 'video') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resource_type', resourceType);

    const response = await fetch('/api/community/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const compressedFile = await compressImage(file);
      const result = await uploadToCloudinary(compressedFile, 'image');
      setImg({ secure_url: result.secure_url });
      setImageFileName(file.name);
    } catch (error) {
      toast.error('Image upload failed');
      console.error('Upload error:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const result = await uploadToCloudinary(file, 'video');
      setVideo({ secure_url: result.secure_url });
      setVideoFileName(file.name);
    } catch (error) {
      toast.error('Video upload failed');
      console.error('Upload error:', error);
    } finally {
      setIsUploadingVideo(false);
    }
  };

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
            const result = await addPost(formData, img?.secure_url ?? "", video?.secure_url ?? "");
            if (result?.success) {
                toast.success('Your post was sent');
                setDesc("");
                setImg(null);
                setVideo(null);
                setImageFileName("");
                setVideoFileName("");
                window.location.href = window.location.href;
            } else if (result?.error) {
              toast.error(result.error);
            }
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

        {(imageFileName || videoFileName) && (
          <div className="mt-2 text-sm flex flex-col gap-1 border-2 border-gray-300 rounded-lg p-1 w-fit shadow-[-2px_2px_0px_0px_rgba(76,29,149,0.3)]">
            {imageFileName && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Image:</span>
                <span className="text-violet-900">{imageFileName}</span>
                <X 
                  className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500" 
                  onClick={() => {
                    setImageFileName("");
                    setImg(null);
                    if (imageInputRef.current) imageInputRef.current.value = "";
                  }}
                />
              </div>
            )}
            {videoFileName && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Video:</span>
                <span className="text-violet-900 underline">{videoFileName}</span>
                <X 
                  className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500" 
                  onClick={() => {
                    setVideoFileName("");
                    setVideo(null);
                    if (videoInputRef.current) videoInputRef.current.value = "";
                  }}
                />
              </div>
            )}
          </div>
        )}
        
        {/* POST OPTIONS */}
        <div className="flex items-center gap-4 mt-4 text-gray-500 flex-wrap">
          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />
          
          {/* Image upload button */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon className="text-green-500"/>
            {isUploadingImage ? "Uploading..." : "Photo"}
          </div>

          {/* Video upload button */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => videoInputRef.current?.click()}
          >
            <Video className="text-red-500"/>
            {isUploadingVideo ? "Uploading..." : "Video"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPost;