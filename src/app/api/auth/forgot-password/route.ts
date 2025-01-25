import { NextResponse } from "next/server";
import crypto from 'crypto';
import { z } from "zod";
import { prisma } from "@/app/db/prisma";

const registerSchema = z.object({
    Email: z
      .string({ required_error: "Email is required" })
      .min(1, "Email is required")
      .email("Invalid email"),
    });

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const parsedData = registerSchema.parse(body);
        const { Email: email } = parsedData;

        const user = await prisma.user.findUnique({
        where: { email: email as string },
        });
    
        if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const expirationTime = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes from now
        console.log(rawToken, expirationTime);
        await prisma.user.update({
            where: { email: email as string },
            data: {
                resetToken: rawToken,
                resetTokenExpires: expirationTime,
            },
        });
        
        // Send the email
        const data = await fetch('http://localhost:3000/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: email,
                subject: 'Password Reset',
                text: `You have requested a password reset. Click this link to reset your password: http://localhost:3000/reset-password/${rawToken}`,
            }),
        });

        if (data.status === 400) {
            return NextResponse.json(
            { error: "All fields (to, subject, text) are required." },
            { status: 500 }
            );
        }
    
        return NextResponse.json(
        { message: "Password reset link sent" },
        { status: 200 }
        );
    } catch (e) {
        if (e instanceof z.ZodError) {
            return NextResponse.json(
              { error: e.errors.map((e) => e.message).join(", ") },
              { status: 400 }
            );
        }else{
            return NextResponse.json(
            { error: "Something went wrong: "+ e },
            { status: 500 }
            );
        }
    }
    }