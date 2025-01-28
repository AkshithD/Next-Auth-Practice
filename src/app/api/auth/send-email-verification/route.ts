// src/app/api/auth/send-verification/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/db/prisma";
import { sendEmail } from "@/app/utils/email";
import crypto from 'crypto';

export async function POST() {
    try {
        // Retrieve the session
        const session = await auth();

        // Check if the user is authenticated
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch user data with selective fields and include related tokens with selective fields
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                tokens: {
                    select: {
                        id: true,
                        type: true,
                        createdAt: true,
                    },
                    where: { type: 'EMAIL_VERIFICATION' },
                    orderBy: { createdAt: 'desc' },
                    take: 1, // Fetch only the latest token
                },
            },
        });

        // If user not found
        if (!user) {
            return NextResponse.json(
                { error: "User not found." },
                { status: 404 }
            );
        }

        // If email is already verified
        if (user.emailVerified) {
            return NextResponse.json(
                { message: "Email is already verified." },
                { status: 200 }
            );
        }

        // Check the latest EMAIL_VERIFICATION token
        const latestToken = user.tokens[0];

        if (latestToken) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (latestToken.createdAt > oneHourAgo) {
                return NextResponse.json(
                    { error: "Verification email already sent. Please check your inbox." },
                    { status: 429 }
                );
            }
        }
        // Delete existing EMAIL_VERIFICATION tokens older than 1 hour
        await prisma.verificationToken.deleteMany({
            where: {
                userId: user.id,
                type: 'EMAIL_VERIFICATION',
            },
        });

        // Create a new Verification Token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.verificationToken.create({
            data: {
                identifier: user.email,
                token: hashedToken,
                type: 'EMAIL_VERIFICATION',
                expires: expirationTime,
                userId: user.id,
            },
        });

        // Construct the verification link
        const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${rawToken}`;
        const htmlContent = `
            <p>Hello ${user.name},</p>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
        `;

        // Send the verification email
        await sendEmail({
            to: user.email,
            subject: "Email Verification",
            html: htmlContent,
        });

        return NextResponse.json(
            { message: "Verification email sent. Please check your inbox." },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
