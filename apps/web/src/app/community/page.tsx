import AddPost from "@web/components/community/AddPost";
import Feed from "@web/components/community/feed/Feed";
import LeftMenu from "@web/components/community/leftMenu/LeftMenu";
import RightMenu from "@web/components/community/rightMenu/RightMenu";
import { api } from "@web/trpc/server";

const Homepage = async () => {
  const initialPosts = await api.community.loadPosts({ page: 1 });
  
  return (
    <div className="flex gap-0 lg:gap-6 pt-1 h-[calc(100vh-56px)] lg:h-[calc(100vh-80px)] overflow-hidden">
      <div className="hidden xl:block w-[20%] overflow-y-auto">
        <LeftMenu type="home" />
      </div>
      <div className="w-full lg:w-[70%] xl:w-[50%] overflow-y-auto">
        <div className="flex flex-col gap-6">
          <AddPost />
          <Feed initialPosts={initialPosts} />
        </div>
      </div>
      <div className="hidden lg:block w-[30%] overflow-y-auto">
        <RightMenu />
      </div>
    </div>
  );
};

export default Homepage;