import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@web/components/community/Navbar";

export default function CommunityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <div className="bg-gradient-to-b from-white to-orange-50 min-h-screen">
        <div className="w-full px-4 md:px-4 lg:px-4 xl:px-4 2xl:px-4">
          <Navbar />
        </div>
        <div className="px-4 md:px-4 lg:px-4 xl:px-4 2xl:px-4">
          {children}
        </div>
      </div>
    </ClerkProvider>
  );
}