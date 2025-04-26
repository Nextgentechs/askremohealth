'use client'

import { Mail, MapPin, Phone } from 'lucide-react'
import React, { useState } from 'react'

type FormData = {
  name: string
  email: string
  message: string
}

const initialFormData: FormData = {
  name: '',
  email: '',
  message: '',
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Simulate sending data (you can replace with API call)
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setFormData(initialFormData)
  }

  return (
    <section className="container flex flex-col md:flex-row justify-center items-center gap-20 py-16">
      <div className="w-full flex flex-col p-10 gap-10 bg-gradient-to-r from-secondary to-[#FFFBF8] shadow-md md:max-w-[400px]">
        <h4 className="text-xl font-bold text-gray-600">Contact Us</h4>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <p className="m-0">+254727 815 187
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <p className="m-0">info@askremohealth.com</p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <p className="m-0">Nairobi, Kenya</p>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          We Value Your Feedback
        </h2>
        {submitted && (
          <p className="mb-4 text-green-600">
            Thanks for reaching out! We’ll be in touch.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="lg:flex gap-10">
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-600" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-600" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-600" htmlFor="message">
              Message
            </label>
            <textarea
              name="message"
              id="message"
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.message}
              onChange={handleChange}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#3B006E] text-white py-2 rounded hover:bg-[#5600A1] transition"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </section>
  )
}

export default ContactForm
