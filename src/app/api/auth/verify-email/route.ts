// src/app/api/auth/verify-email/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import crypto from 'crypto';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const token = url.searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: "Token is required." },
                { status: 400 }
            );
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const verificationEntry = await prisma.verificationToken.findFirst({
            where: {
                token: hashedToken,
                type: 'EMAIL_VERIFICATION',
                expires: {
                    gt: new Date(),
                },
            },
            include: { user: true },
        });

        if (!verificationEntry) {
            return NextResponse.json(
                { error: "Invalid or expired verification token." },
                { status: 400 }
            );
        }

        const user = verificationEntry.user;

        if (!user) {
            return NextResponse.json(
                { error: "User associated with this token does not exist." },
                { status: 400 }
            );
        }
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: new Date(),
                },
            }),
            prisma.verificationToken.delete({
                where: { id: verificationEntry.id },
            }),
        ]);
        return NextResponse.json(
            { message: "Email verified successfully." },
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
