'use client'

import Image from 'next/image'
import React from 'react'



const AboutSection = () => {
  return (
    <section id="about" className="about py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image Column */}
          <div
            className="lg:w-1/2 relative self-start"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <Image
              src="/assets/about.png"
              alt="Telemedicine platform"
              width={600}
              height={400}
              className="w-full h-auto rounded-lg shadow-lg"
              priority
            />
          </div>
 
          {/* Content Column */}
          <div className="lg:w-1/2" data-aos="fade-up" data-aos-delay="100">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-primary">
              About Us
            </h2>

            <div className="mb-12">
              <p className="text-lg text-gray-500 mb-6">
                Ask RemoHealth is a leading web and mobile telemedicine platform
                dedicated to making healthcare more accessible and affordable.
                Our AI assistant sets us apart by providing smart pre-screening,
                symptom analysis, and linking you to the most suitable doctor
                based on urgency, availability, and convenience.
              </p>
              <p className="text-lg text-gray-500">
                By combining advanced technology with expert medical care, we
                bridge the healthcare gap and ensure you get the right treatment
                when you need it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  Our Mission
                </h3>
                <p className="text-primary italic">
                  &quot;Quality healthcare, anytime, anywhere&quot;
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  Our Vision
                </h3>
                <p className="text-primary">
                  To establish an inclusive and connected healthcare ecosystem
                  where patients, healthcare providers, and medical facilities
                  seamlessly interact, ensuring efficient, high-quality
                  healthcare for all.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection