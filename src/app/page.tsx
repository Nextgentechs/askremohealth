import NavigationBar from "~/components/NavigationBar";

export default async function Home() {
  return (
    <main className="h-dvh w-full">
      <div className="h-[656px] w-full bg-gradient-to-b from-white to-secondary">
        <div className="mx-auto h-dvh w-full max-w-[1440px] px-4 pt-5 transition-all duration-300 sm:px-6 lg:px-8 xl:px-16">
          <NavigationBar />
          {/* <HeroSection /> */}
        </div>
      </div>

      {/* <HowItWorks /> */}
    </main>
  );
}
