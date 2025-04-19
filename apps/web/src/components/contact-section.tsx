import { Mail, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ContactSection() {
  return (
    <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <div className="relative">
        <div className="flex flex-col lg:flex-row justify-between py-8 gap-6 px-4 sm:px-6 lg:px-8">
          <div className="w-full lg:w-auto flex justify-center lg:block">
            <Image
              className="rounded-[10px] object-cover w-full max-w-[450px] h-auto lg:h-[450px] lg:w-[350px]"
              src="/assets/contact.jpg" 
              alt="Contact Us"
              width={350} 
              height={450} 
              priority={false} 
              quality={85} 
            />
          </div>
          <div className="flex flex-col text-center items-center justify-center w-full lg:min-w-[600px]">
            <div className="text-center w-full">
              <h2 className="section-title text-xl sm:text-2xl lg:text-4xl">
                Our Contacts
              </h2>
            </div>
            <div className="text-center mt-8 w-full">
              <Mail className="h-6 w-6 text-[#402D7C] mx-auto flex-shrink-0 mt-1" />
              <p className="text-muted-foreground mt-2">
                <Link
                  href="mailto:info@askremohealth.com"
                  className="text-gray-600 hover:text-[#402D7C] transition-colors hover:underline"
                >
                  info@askremohealth.com
                </Link>
              </p>
              <p className="text-muted-foreground mt-2">
                <Link
                  href="mailto:virtualhealthcarenetwork@gmail.com"
                  className="text-gray-600 hover:text-[#402D7C] transition-colors hover:underline"
                >
                  virtualhealthcarenetwork@gmail.com
                </Link>
              </p>
            </div>

            <div className="text-center mt-4 w-full">
              <p className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                <Phone className="h-6 w-6 text-[#402D7C] flex-shrink-0 mt-1" />
                <Link
                  href="tel:+254727815187"
                  className="text-gray-600 hover:text-[#402D7C] transition-colors hover:underline"
                >
                  (+254) 727815187
                </Link>
                <span className="hidden sm:inline text-[#402D7C]"> or </span>
                <span className="sm:hidden text-[#402D7C]">or</span>
                <Link
                  href="tel:+254784815187"
                  className="text-gray-600 hover:text-[#402D7C] transition-colors hover:underline"
                >
                  (+254) 784815187
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-[60%_40%] py-8 gap-3">
          <div>
            <h3 className="section-title text-center md:text-left text-xl sm:text-2xl lg:text-4xl">
              Our Office
            </h3>
            <p className="text-muted-foreground mt-4 max-w-[500px]">
              Chandaria Business Innovation and Incubation Centre, The World tta
              University, Off Thika Superhighway, Nairobi, The World
            </p>
          </div>

          <div className="md:pl-4">
            <div className="aspect-video w-full">
              {' '}
              {/* Maintain 16:9 aspect ratio */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d249.31059176461582!2d36.93581253290176!3d-1.1819110319700854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f3f74418122c5%3A0x2bd9a1158ccc560f!2sChandaria%20Business%20Incubation%20and%20Innovation%20Centre%2C%20Kenya%20Drive%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1745057272716!5m2!1sen!2ske"
                className="w-full h-full lg:w-[350px] lg:h-[450px] rounded-lg border-0 shadow-sm"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
