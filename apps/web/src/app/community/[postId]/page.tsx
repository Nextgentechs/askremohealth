import LeftMenu from "@web/components/community/leftMenu/LeftMenu";
import RightMenu from "@web/components/community/rightMenu/RightMenu";
import SinglePost from "@web/components/community/feed/SinglePost";

interface SinglePostPageProps {
  params: {
    postId: string;
  };
}

// Make this a normal function, NOT async (unless you do async work inside)
const SinglePostPage = ({ params }: SinglePostPageProps) => {
  const { postId } = params;

  return (
    <div className="flex gap-6 pt-1">
      <div className="hidden xl:block w-[20%]">
        <LeftMenu type="home" />
      </div>
      <div className="w-full lg:w-[70%] xl:w-[50%]">
        <SinglePost postId={postId} />
      </div>
      <div className="hidden lg:block w-[30%]">
        <RightMenu />
      </div>
    </div>
  );
};

export default SinglePostPage;
