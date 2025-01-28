// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import crypto from 'crypto';
import { z } from "zod";
import { prisma } from "@/app/db/prisma";
import { sendEmail } from "@/app/utils/email";

const emailSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
});

export async function POST(req: Request) {
    try {

        const body = await req.json();
        console.log(body);
        const parsedData = emailSchema.parse(body);
        const { email } = parsedData;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { accounts: true },
        });

        if (!user) {
            // For security, respond with a generic message
            return NextResponse.json(
                { message: "If that email is registered, a reset link has been sent." },
                { status: 200 }
            );
        }

        if (user.accounts.some((acc) => acc.provider !== "credentials")) {
            //Restrict password resets to credentials accounts
            return NextResponse.json(
                { error: "Account is not a credentials account" },
                { status: 400 }
            );
        }

        // Check for existing active PASSWORD_RESET token
        const existingToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                type: 'PASSWORD_RESET',
                expires: {
                    gt: new Date(),
                },
            },
        });

        if (existingToken) {
            return NextResponse.json(
                { message: "A password reset link has already been sent. Please check your email or try again later." },
                { status: 200 }
            );
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expirationTime = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes from now
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: hashedToken,
                type: 'PASSWORD_RESET',
                expires: expirationTime,
                userId: user.id,
            },
        });
        // Prepare password reset email content
        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token={rawToken}`;
        const htmlContent = `
      <p>Hello ${user.name},</p>
      <p>You have requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 20 minutes.</p>
    `;
        // Send password reset email
        await sendEmail({
            to: email,
            subject: "Password Reset Request",
            html: htmlContent,
        });

        return NextResponse.json(
            { message: "If that email is registered, a reset link has been sent." },
            { status: 200 }
        );
    } catch (e) {
        if (e instanceof z.ZodError) {
            return NextResponse.json(
                { error: e.errors.map((e) => e.message).join(", ") },
                { status: 400 }
            );
        } else {
            console.error(e);
            return NextResponse.json(
                { error: "Internal server error" },
                { status: 500 }
            );
        }
    }
}
