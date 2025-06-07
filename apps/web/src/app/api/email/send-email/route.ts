import { NextResponse } from 'next/server'
import { SMTPClient } from 'emailjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      console.error("Missing form data:", body)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const client = new SMTPClient({
      user: process.env.SMTP_USER!,
      password: process.env.SMTP_PASSWORD!,
      host: process.env.SMTP_HOST!,
      ssl: true,
    })

    const result = await new Promise((resolve, reject) => {
      client.send(
        {
          text: `From: ${name}\nEmail: ${email}\n\n${message}`,
          from: `Contact Form <${process.env.SMTP_FROM}>`,
          to: `Recipient <${process.env.SMTP_TO}>`,
          subject: 'New Contact Form Message',
        },
        (err, message) => {
          if (err) {
            console.error("Error sending email:", err)
            reject(err)
          } else {
            console.log("Email sent successfully:", message)
            resolve(message)
          }
        }
      )
    })

    return NextResponse.json({ success: true, message: result })
  } catch (error) {
    console.error('Error in sending email:', error)
    return NextResponse.json({ success: false, error: 'Email sending failed.' }, { status: 500 })
  }
}
