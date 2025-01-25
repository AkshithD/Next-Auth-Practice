import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import { z } from "zod";
import { prisma } from "@/app/db/prisma";

const resetPasswordSchema = z.object({
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
      .max(32, "Password must be less than 32 characters"),
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    const parsedData = resetPasswordSchema.parse({ password });
    const { password: newPassword } = parsedData;

    if (!token) {
      return NextResponse.json({ error: 'Token is required.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpires: { gt: new Date() }, // Ensure token is not expired
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            hashedPassword,
            resetToken: null,
            resetTokenExpires: null,
        },
    });

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error("Error details:", error.message);
      return NextResponse.json(
        { error: `Error occurred: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
