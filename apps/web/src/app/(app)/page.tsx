import Footer from '@web/components/footer'
import HeroSection from '@web/components/hero-section'
import HowItWorks from '@web/components/how-it-works'
import LatestArticles from '@web/components/latest-articles'
import MedicalSpecialist from '@web/components/medical-specialists'
import { PatientServices } from '@web/components/patient-services'
import { ProviderServices } from '@web/components/provider-services'
import SearchForm from '@web/components/search-form'
import StatsSection from '@web/components/stats-section'
import TopSpecialists from '@web/components/top-specialists'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@web/components/ui/tabs'
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

        <div className="absolute top-[584px] sm:top-[488px] xl:top-[552px] mx-auto flex w-full flex-col items-center justify-center">
          <StatsSection />
          <HowItWorks />

          <section className="mx-auto px-4 py-12">
            <h1 className="section-title text-center mb-4">
              Our Services
            </h1>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Connecting patients, healthcare providers, and facilities through
              innovative digital solutions
            </p>

            <Tabs defaultValue="patients" className="w-full max-w-6xl mx-auto">
              <TabsList className="flex flex-col sm:grid sm:grid-cols-2 mb-8 h-auto">
                <TabsTrigger
                  className="justify-start text-start sm:justify-center sm:text-center"
                  value="patients"
                >
                  For Patients
                </TabsTrigger>
                <TabsTrigger
                  className="justify-start text-start sm:justify-center sm:text-center"
                  value="providers"
                >
                  For Healthcare Providers
                </TabsTrigger>
               
              </TabsList>

              <TabsContent value="patients">
                <PatientServices />
              </TabsContent>

              <TabsContent value="providers">
                <ProviderServices />
              </TabsContent>

              
            </Tabs>
          </section>

          <MedicalSpecialist />
          <TopSpecialists />
          <LatestArticles />
          <WhatPatientsSay />
          <Footer />
        </div>
      </div>
    </main>
  )
}
