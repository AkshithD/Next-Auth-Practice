// src/utils/email.ts

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    },
});

interface MailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: MailOptions) => {
    const mailOptions = {
        from: {
            name: 'Music Vault',
            address: process.env.EMAIL || 'default@example.com',
        },
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};
