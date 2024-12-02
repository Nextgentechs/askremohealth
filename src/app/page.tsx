import HeroSection, { SearchForm } from '~/components/heroSection'
import HowItWorks from '~/components/howItWorks'
import NavigationBar from '~/components/navigationBar'

export default async function Home() {
  return (
    <main className="h-dvh w-full">
      <div className="relative">
        <div className="h-[500px] w-full bg-gradient-to-b from-white to-secondary xl:h-[600px]">
          <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col items-start justify-start rounded-sm px-4 pt-6 transition-all duration-300 sm:px-6 lg:px-8 xl:px-16">
            <NavigationBar />
            <HeroSection />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex w-full translate-y-1/2 transform justify-center">
          <SearchForm />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-16">
        <HowItWorks />
      </div>
    </main>
  )
}
