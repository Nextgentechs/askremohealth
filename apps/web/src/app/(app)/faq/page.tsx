import Footer from '@web/components/footer'
import FAQSection from '@web/components/faq-section'
import FaqHeroSection from '@web/components/faq-hero'
import { ChatBot } from '@web/components/chat-bot'


const Faq = () => {
  return (
    <div>
      <FaqHeroSection/>
      <FAQSection/>
      
      <ChatBot/>
      <Footer />
    </div>
  )
}

export default Faq