import { EmailTemplate } from "@web/components/email-template";
import { redisClient } from "@web/redis/redis"
import { generateOtp } from "@web/server/lib/generateOtp"
import { NextResponse } from "next/server"
import { Resend } from "resend";
import { z } from "zod"
import { env } from 'src/env'


const resend = new Resend(env.RESEND_API_KEY);

const bodySchema = z.object({
  email:z.string().email()
})
export async function POST(req:Request) {
  const body = await req.json()
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({error:'invalid email'},{status:400})
  }
  
  const { email } = parsed.data
  
  try {
    const otp = generateOtp()
    await redisClient.del(`otp:${email}`);

    await redisClient.set(`otp:${email}`, otp, {
      ex:300
    })

    const emailResult = await resend.emails.send({
      from: 'info@askremohealth.com',
      to: email,
      subject: 'Your New OTP Code',
      react: EmailTemplate({ otp:otp }),
    });

    return NextResponse.json({ success: true, emailResult });
    
  } catch{
    return NextResponse.json({error:'failed to send otp, try again'},{status:500})
  }
}