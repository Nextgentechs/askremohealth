import AboutSection from '@web/components/about-section'
import { FeaturesSection} from '@web/components/features-section'
import { ChatBot } from '@web/components/chat-bot'
import Footer from '@web/components/footer'
import { PatientServices } from '@web/components/patient-services'
import { ProviderServices } from '@web/components/provider-services'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@web/components/ui/tabs'

const AboutUs = () => {
  return (
    <div>
      <AboutSection />
      <FeaturesSection />

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
                  For Healthcare Providers...
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

      <ChatBot/>
      <Footer />
    </div>
  )
}

export default AboutUs
