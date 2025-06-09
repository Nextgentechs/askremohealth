import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { EmailTemplate } from '@web/components/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { email, otp } = body;

  try {
    const data = await resend.emails.send({
      from: 'info@askremohealth.com',
      to: email,
      subject: 'Your One-Time Password (OTP)',
      react: EmailTemplate({otp}),
    });

    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
