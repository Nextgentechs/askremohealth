import HeroSection from "~/components/HeroSection";
import NavigationBar from "~/components/NavigationBar";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white py-5">
      <NavigationBar />
      <HeroSection />
    </main>
  );
}
