import { Scale, Shield, FileText, Globe, Users, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@web/components/ui/card"
import { Separator } from "@web/components/ui/separator"
import Footer from "@web/components/footer"

export default function TermsOfServicePage() {
  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <div className="w-20 h-1 bg-[#402E7D] mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 text-lg">Legal guidelines and compliance information for RemoHealth services</p>
          </div>

          {/* Main Content */}
          <Card className="mb-8 shadow-lg border-t-4 border-t-[#402E7D]">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Scale className="mr-3 text-blue-600" />
                Legal & Privacy Information
              </h2>

              <div className="space-y-8">
                {/* Terms of Service Section */}
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mt-1">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Terms of Service</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        Users must adhere to ethical healthcare guidelines as outlined in our policies. By using
                        RemoHealth services, you agree to:
                      </p>
                      <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                        <li>Provide accurate and truthful health information</li>
                        <li>Use the platform responsibly and for legitimate healthcare purposes</li>
                        <li>Respect the privacy and confidentiality of other users</li>
                        <li>Follow all applicable healthcare regulations and guidelines</li>
                        <li>Not misuse or abuse the AI-powered diagnostic tools</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Privacy Policy Compliance Section */}
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-green-100 p-2 rounded-full mt-1">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Privacy Policy Compliance</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        We comply with The World&apos;s Data Protection Act, HIPAA, and GDPR, ensuring that all patient
                        information remains private and secure. Our compliance includes:
                      </p>

                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Globe className="h-4 w-4 text-blue-600 mr-2" />
                            <h4 className="font-medium text-gray-800">GDPR</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            European data protection standards for user privacy and data rights
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Users className="h-4 w-4 text-blue-600 mr-2" />
                            <h4 className="font-medium text-gray-800">HIPAA</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            US healthcare privacy standards for protected health information
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Shield className="h-4 w-4 text-blue-600 mr-2" />
                            <h4 className="font-medium text-gray-800">Global Standards</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            International data protection acts and healthcare regulations
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Terms */}
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-amber-100 p-2 rounded-full mt-1">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">3. Service Usage Guidelines</h3>
                      <div className="space-y-3 text-gray-600">
                        <p>
                          <strong>Medical Disclaimer:</strong> RemoHealth services are designed to support, not replace,
                          professional medical advice and treatment.
                        </p>
                        <p>
                          <strong>Data Security:</strong> We implement industry-standard security measures to protect
                          your health information and maintain confidentiality.
                        </p>
                        <p>
                          <strong>Access Control:</strong> You maintain full control over your health data through our
                          OTP-based access system.
                        </p>
                        <p>
                          <strong>AI Recommendations:</strong> AI-powered insights are provided for informational
                          purposes and should be discussed with healthcare professionals.
                        </p>
                      </div>
                    </div>
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
