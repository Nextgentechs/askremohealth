import React from "react";
import ContactSection from "@web/components/contact-section";
import ContactHeroSection from "@web/components/contact-hero";
import ContactForm from "@web/components/ContactForm";
import Footer from "@web/components/footer";

const Contact = () => {
  return (
    <div>
      <ContactHeroSection/>
      <ContactSection/>
      <ContactForm/>
      <Footer/>
    </div>
  )
}

export default Contact
