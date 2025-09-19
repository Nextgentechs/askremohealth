import CommunityNavbar from '@web/components/community/CommunityNavbar'


export default function CommunityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gradient-to-b from-white to-orange-50 min-h-screen">
        <div className="mx-auto max-w-[1440px] px-4 pt-2 pb-2 transition-all duration-300 sm:px-6 sm:pt-4 lg:px-8 lg:pt-6 xl:px-8">
          <CommunityNavbar />
        </div>
        <div className="px-4 md:px-4 lg:px-4 xl:px-4 2xl:px-4">
          {children}
        </div>
    </div>
  );
}