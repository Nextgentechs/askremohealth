'use client'

import { ArrowRight, Users } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'

export default function ResourcesSection() {
  return (
    <section className="bg-gray-50 container mx-auto flex w-full flex-col items-center justify-center gap-10 py-16">
      <div className="mx-auto flex w-full flex-col items-center justify-center gap-2">
        <h2 className="section-title text-center">
          List your Laboratory, Hospital or Clinic!
        </h2>
        <p className="section-description text-center">
          Distinguish your healthcare brand with our strategic approach
        </p>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8  items-center">
          

          <Card className="border-2 border-[#FFF4EB] bg-white shadow-lg max-w-4xl mx-auto overflow-hidden">
            <div className="md:flex">
              <div className="md:w-3/5 p-6 md:p-8">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl text-center sm:text-left md:text-xl font-bold text-[#402E7D]">
                    Register as a Provider
                  </CardTitle>
                  <CardDescription className="text-base text-center sm:text-left mt-2">
                    Doctors, Clinics, Hospitals & Labs - Join our network and
                    start serving patients today
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <ul className="space-y-2">
                    {[
                      'Expand your patient reach',
                      'Streamline appointment scheduling',
                      'Reduce administrative workload',
                      'Increase practice visibility',
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-[#FFF4EB] flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-[#402E7D]"></div>
                        </div>
                        <span className="text-sm md:text-base text-slate-700">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-0 mt-6">
                  <Link href="/register-provider">
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-[#402E7D] text-white"
                  >
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  </Link>
                </CardFooter>
              </div>
              <div className="hidden md:block md:w-2/5 bg-[#402E7D] text-white p-8 flex flex-col justify-center">
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  Already Serving
                </h3>
                <div className="flex justify-center items-center space-x-4 mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">500+</p>
                    <p className="text-xs uppercase">Providers</p>
                  </div>
                  <div className="h-10 w-px bg-teal-400"></div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">50k+</p>
                    <p className="text-xs uppercase">Patients</p>
                  </div>
                </div>
                <p className="text-sm text-teal-100 text-center">
                  &quot;Joining the network has transformed our practice with a
                  30% increase in new patients.&quot;
                </p>
                <p className="text-xs text-center mt-2 text-teal-200">
                  — Dr. Sarah Johnson, Family Medicine
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
