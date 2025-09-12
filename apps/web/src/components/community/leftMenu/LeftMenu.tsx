import Link from "next/link";
import { Bookmark, BookOpenText, Calendar1, HomeIcon, ListCheck, MessageCircleMore, Newspaper, Settings, Store, User } from "lucide-react";
import ProfileCard from "./ProfileCard";
import Ad from "../Ad";

const LeftMenu = ({ type }: { type: "home" | "profile" }) => {
  return (
    <div className="flex flex-col gap-6">
      {type === "home" && <ProfileCard />}
      <div className="p-4 bg-white rounded-lg shadow-md text-sm text-gray-500 flex flex-col gap-2">
        <Link
          href="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
        >
          <HomeIcon/>
          <span>Home</span>
        </Link>
        <hr className="border-t-1 border-gray-50 w-36 self-center" />
        <Link
          href="/chats"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
        >
          <MessageCircleMore/>
          <span>My Chats</span>
        </Link>
        <hr className="border-t-1 border-gray-50 w-36 self-center" />
        <Link
          href="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
        >
          <User/>
          <span>My Profile</span>
        </Link>
        <hr className="border-t-1 border-gray-50 w-36 self-center" />
        <Link
          href="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
        >
          <Store/>
          <span>Marketplace</span>
        </Link>
        <hr className="border-t-1 border-gray-50 w-36 self-center" />
        <Link
          href="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
        >
          <Calendar1/>
          <span>Events</span>
        </Link>
        <hr className="border-t-1 border-gray-50 w-36 self-center" />
        <Link
          href="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
        >
          <Bookmark/>
          <span>Bookmarks</span>
        </Link>
        <hr className="border-t-1 border-gray-50 w-36 self-center" />
        <Link
          href="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
        >
          <Newspaper/>
          <span>News</span>
        </Link>
        <hr className="border-t-1 border-gray-50 w-36 self-center" />
        <Link
          href="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
        >
          <BookOpenText/>
          <span>Courses</span>
        </Link>
        <hr className="border-t-1 border-gray-50 w-36 self-center" />
        <Link
          href="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
        >
          <ListCheck/>
          <span>Lists</span>
        </Link>
        <hr className="border-t-1 border-gray-50 w-36 self-center" />
        <Link
          href="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
        >
          <Settings/>
          <span>Settings</span>
        </Link>
      </div>
      <Ad size="sm"/>
    </div>
  );
};

export default LeftMenu;