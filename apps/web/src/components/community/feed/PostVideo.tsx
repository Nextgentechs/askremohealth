"use client";
import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";

export default function PostVideo({ id, src }: { id: string; src: string }) {
  return (
    <div className="w-full">
      <CldVideoPlayer
        id={id}
        width="100%"
        height="auto"
        src={src}
        aspectRatio="16:9"
        className="rounded-md"
        controls
      />
    </div>
  );
}
