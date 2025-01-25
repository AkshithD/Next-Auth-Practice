import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const mailOptions = (to: string, subject: string, text: string) => ({
  from: {
    name: 'Music Vault',
    address: process.env.EMAIL || 'default@example.com',
  },
  to,
  subject,
  text,
});

export async function POST(req: Request) {
  try {
    console.log('EMAIL:', process.env.EMAIL);
    console.log('APP_PASSWORD:', process.env.APP_PASSWORD);


    const body = await req.json();

    // Validate request payload
    const { to, subject, text } = body;
    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: 'All fields (to, subject, text) are required.' },
        { status: 400 }
      );
    }

    // Send the email
    await transporter.sendMail(mailOptions(to, subject, text));
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}
