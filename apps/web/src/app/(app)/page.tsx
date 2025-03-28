import Footer from '@web/components/footer'
import HeroSection from '@web/components/hero-section'
import HowItWorks from '@web/components/how-it-works'
import LatestArticles from '@web/components/latest-articles'
import MedicalSpecialist from '@web/components/medical-specialists'
import SearchForm from '@web/components/search-form'
import ServicesSection from '@web/components/services-section'
import TopSpecialists from '@web/components/top-specialists'
import WhatPatientsSay from '@web/components/what-patients-say'

export default async function Home() {
  return (
    <main className="h-full w-full relative">
      <div className="relative">
        <div className="h-80 sm:h-96 w-full bg-gradient-to-b from-white to-secondary lg:h-[416px] xl:h-[496px]">
          <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col items-start justify-start rounded-sm px-4 pt-2 transition-all duration-300 sm:px-6 lg:px-8 xl:px-16">
            <HeroSection />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex w-full translate-y-3/4 sm:translate-y-1/2 transform justify-center">
          <SearchForm />
        </div>
      </div>

      <div className="absolute top-[584px] sm:top-[488px] xl:top-[552px] mx-auto flex w-full flex-col items-center justify-center">
        <ServicesSection />
        <HowItWorks />
        <MedicalSpecialist />
        <TopSpecialists />
        <LatestArticles />
        <WhatPatientsSay />
        <Footer />
      </div>
    </main>
  )
}
