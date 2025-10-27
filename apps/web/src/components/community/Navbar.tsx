import Link from "next/link";
import MobileMenu from "@web/components/community/MobileMenu";
import Image from "next/image";
import { api } from '@web/trpc/server'

const Navbar = async () => {
  const user = await api.users.currentUser();
  return (
    <div className="h-24 flex items-center justify-between">
      {/* LEFT */}
      <div className="lg:block w-[20%]">
        <Link href="/community" className="font-bold text-xl text-purple-900">
          COMMUNITY
        </Link>
      </div>
      {/* CENTER */}
      <div className="hidden md:flex w-[50%] text-sm items-center justify-between">
        {/* LINKS */}
        <div className='hidden xl:flex p-2 bg-slate-100 items-center rounded-xl ml-12'>
          <input type="text" placeholder="search..." className="bg-transparent outline-none"/>
          <Image src="/assets/community/search.png" alt="" width={14} height={14}/>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-[30%] flex items-center gap-4 xl:gap-8 justify-end">
        {user ? (
          <>
            <div className="cursor-pointer">
              <Image src="/assets/community/people.png" alt="" width={24} height={24} />
            </div>
            <div className="cursor-pointer">
              <Image src="/assets/community/messages.png" alt="" width={20} height={20} />
            </div>
            <div className="cursor-pointer">
              <Image src="/assets/community/notifications.png" alt="" width={20} height={20} />
            </div>
            <div className="cursor-pointer">
              <Image src="/assets/community/user.png" alt="" width={20} height={20} />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Image src="/assets/community/login.png" alt="" width={20} height={20} />
            <Link href="/auth">Login/Register</Link>
          </div>
        )}
        <MobileMenu />
      </div>
    </div>
  );
};

export default Navbar;