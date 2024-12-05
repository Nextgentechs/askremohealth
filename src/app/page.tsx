import HeroSection, { SearchForm } from '~/components/hero-section'
import HowItWorks from '~/components/how-it-works'
import MedicalSpecialist from '~/components/medical-specialists'
import NavigationBar from '~/components/navigation-bar'
import LatestArticles from '~/components/latest-articles'
import TopSpecialists from '~/components/top-specialists'
import WhatPatientsSay from '~/components/what-patients-say'
import Footer from '~/components/footer'

export default async function Home() {
  return (
    <main className="h-dvh w-full">
      <div className="relative">
        <div className="h-[500px] w-full bg-gradient-to-b from-white to-secondary xl:h-[600px]">
          <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col items-start justify-start rounded-sm px-4 pt-2 transition-all duration-300 sm:px-6 sm:pt-4 lg:px-8 lg:pt-6 xl:px-16">
            <NavigationBar />
            <HeroSection />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex w-full translate-y-1/2 transform justify-center">
          <SearchForm />
        </div>
      </div>

      <div className="mx-auto flex w-full flex-col items-center justify-center">
        <HowItWorks />
        <MedicalSpecialist />
        <TopSpecialists />
        <LatestArticles />
        <WhatPatientsSay />
      </div>

      <Footer />
    </main>
  )
}
