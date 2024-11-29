import HeroSection from "~/components/HeroSection";
import HowItWorks from "~/components/HowItWorks";
import NavigationBar from "~/components/NavigationBar";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col py-5">
      <div className="bg-gradient-to-b from-[#FFFFFF] to-secondary">
        <NavigationBar />
        <HeroSection />
      </div>

      <HowItWorks />
    </main>
  );
}
