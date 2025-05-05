'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

type FAQItemProps = {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <button
        className="flex w-full items-center justify-between p-6 text-left focus:outline-none border-0"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        <div className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180 transform' : ''}`}
          />
        </div>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        aria-hidden={!isOpen}
      >
        <div className="px-6 py-4">
          <p className="text-gray-600">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const patientFAQs = [
    {
      question: 'How do I book a consultation?',
      answer:
        'Visit our platform, choose a doctor, and schedule an appointment through video, chat, or call.',
    },
    {
      question: 'Is my health information secure?',
      answer:
        'Yes! We use end-to-end encryption and strict authentication protocols to ensure your data privacy.',
    },
    {
      question: 'Can I get prescriptions online?',
      answer:
        'Yes! Your doctor can provide an e-prescription, which you can redeem at partnered pharmacies.',
    },
  ]

  const providerFAQs = [
    {
      question: 'How do I join as a healthcare provider?',
      answer:
        'Sign up, create a professional profile and complete the verification process.  ',
    },
    {
      question: 'Are there any fees for listing my practice?',
      answer:
        'A basic listing is free, but premium options are available for greater visibility.',
    },
    
  ]

 

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="max-w-[1300px] mx-auto py-12 px-4 sm:px-6">
  <div className="relative">
    {/* Decorative elements - hidden on mobile for better performance */}
    <div className="hidden sm:block absolute -left-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-200 to-purple-100 opacity-70 blur-2xl"></div>
    <div className="hidden sm:block absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-200 to-purple-100 opacity-70 blur-2xl"></div>

    {/* FAQ items */}
    <div className="relative space-y-8 md:space-y-12">
      {/* Patients Section */}
      <div className="flex flex-col md:flex-row gap-6 md:justify-between md:gap-8">
        <h3 className="section-title text-xl md:text-2xl text-center">
          For Patients
        </h3>
        <div className="flex-1 md:max-w-[600px] lg:max-w-[800px] space-y-4">
          {patientFAQs.map((faq, index) => (
            <FAQItem
              key={`patient-${index}`}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>

      {/* Providers Section */}
      <div className="flex flex-col md:flex-row gap-6 md:justify-between md:gap-8">
        <h3 className="section-title text-xl md:text-2xl text-center">
          For Providers
        </h3>
        <div className="flex-1 md:max-w-[600px] lg:max-w-[800px] space-y-4">
          {providerFAQs.map((faq, index) => (
            <FAQItem
              key={`provider-${index}`}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index + patientFAQs.length}
              onClick={() => toggleFAQ(index + patientFAQs.length)}
            />
          ))}
        </div>
      </div>

    </div>
  </div>
</section>
  )
}
