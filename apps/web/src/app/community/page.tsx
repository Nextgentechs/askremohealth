import AddPost from "@web/components/community/AddPost";
import Feed from "@web/components/community/feed/Feed";
import LeftMenu from "@web/components/community/leftMenu/LeftMenu";
import RightMenu from "@web/components/community/rightMenu/RightMenu";

const Homepage = () => {
  return (
    <div className="flex gap-0 lg:gap-6 pt-1">
      <div className="hidden xl:block w-[20%]">
        <LeftMenu type="home" />
      </div>
      <div className="w-full lg:w-[70%] xl:w-[50%]">
        <div className="flex flex-col gap-6">
          <AddPost />
          <Feed />
        </div>
      </div>
      <div className="hidden lg:block w-[30%]">
        <RightMenu />
      </div>
    </div>
  );
};

export default Homepage;