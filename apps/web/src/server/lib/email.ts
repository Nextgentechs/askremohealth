import nodemailer from 'nodemailer';
import { env } from 'src/env'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: "Virtualhealthcarenetwork@gmail.com",
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  console.log(to)
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: 'Your One-Time Password for Login',
    html: `
      <html>
        <body>
          <h2>Hello</h2>
          <p>Your one-time password (OTP) is:</p>
          <h3>${otp}</h3>
          <p>Please use this OTP to log in. It will expire in 5 minutes.</p>
        </body>
      </html>
    `,
  });
}