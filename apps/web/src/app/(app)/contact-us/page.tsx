import React from "react";
import ContactSection from "@web/components/contact-section";
import ContactHeroSection from "@web/components/contact-hero";
import ContactForm from "@web/components/ContactForm";
import Footer from "@web/components/footer";
import { ChatBot } from "@web/components/chat-bot";

const Contact = () => {
  return (
    <div>
      <ContactHeroSection/>
      <ContactSection/>
      <ContactForm/>
      <ChatBot/>
      <Footer/>
    </div>
  )
}

export default Contact
