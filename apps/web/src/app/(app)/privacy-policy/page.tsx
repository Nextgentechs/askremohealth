import { Shield, Lock, UserCog, Key, Brain } from "lucide-react"
import { Card, CardContent } from "@web/components/ui/card"
import Footer from "@web/components/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <div className="w-20 h-1 bg-[#402E7D] mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 text-lg">Your health data privacy and security are our top priorities</p>
          </div>

          {/* Main content */}
          <Card className="mb-8 shadow-lg border-t-4 border-t-[#402E7D]">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="mr-3 text-blue-600" />
                Patient Data Ownership and Security
              </h2>

              <div className="space-y-8">
                {/* Data Ownership Section */}
                <div className="flex gap-6">
                  <div className="hidden md:flex items-start pt-1">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <UserCog className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Your Data, Your Control</h3>
                    <p className="text-gray-600 leading-relaxed">
                      You have full control over your health data, deciding who can access it and when. With a simple
                      one-time password (OTP), you can grant temporary access to doctors or healthcare facilities,
                      ensuring your records remain private and secure.
                    </p>
                  </div>
                </div>

                {/* Security Approach Section */}
                <div className="flex gap-6">
                  <div className="hidden md:flex items-start pt-1">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Patient-First Security</h3>
                    <p className="text-gray-600 leading-relaxed">
                      This patient-first approach protects your sensitive information while allowing you to manage your
                      medical history. Our security protocols ensure your data is encrypted and protected at all times.
                    </p>
                  </div>
                </div>

                {/* AI Analysis Section */}
                <div className="flex gap-6">
                  <div className="hidden md:flex items-start pt-1">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Brain className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">AI-Powered Health Insights</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our AI-powered system goes beyond security by using machine learning (ML) to analyze your records,
                      predict potential health risks, and offer personalized health recommendations. This technology
                      works while maintaining strict privacy standards.
                    </p>
                  </div>
                </div>

                {/* Balance Section */}
                <div className="flex gap-6">
                  <div className="hidden md:flex items-start pt-1">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Key className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Technology with Privacy</h3>
                    <p className="text-gray-600 leading-relaxed">
                      With smart technology and strict privacy safeguards, you get better healthcare while keeping your
                      data in your hands. We believe advanced healthcare and strong privacy protection can work together
                      seamlessly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        
        </div>
      </div>
      <Footer />
    </div>
  )
}
