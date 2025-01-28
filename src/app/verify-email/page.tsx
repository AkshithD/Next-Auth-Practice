// src/app/verify-email/page.tsx

import { prisma } from "@/app/db/prisma";
import crypto from "crypto";
import { Metadata } from "next";
import React from "react";

// Define metadata for the page
export const metadata: Metadata = {
    title: "Email Verification",
    description: "Verify your email address",
};

// Define the VerifyEmailPage as an async Server Component
const VerifyEmailPage = async ({ searchParams }: { searchParams: { token?: string } }) => {
    const token = searchParams.token;

    // If no token is provided in the URL
    if (!token) {
        return (
            <section className="p-8 max-w-md mx-auto">
                <h1 className="text-3xl font-bold mb-4">Invalid Verification Link</h1>
                <p className="text-red-500">No verification token provided.</p>
            </section>
        );
    }

    // Hash the token to match the stored hashed token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Attempt to find the verification token in the database
    const verificationEntry = await prisma.verificationToken.findFirst({
        where: {
            token: hashedToken,
            type: "EMAIL_VERIFICATION",
            expires: {
                gt: new Date(), // Ensure the token hasn't expired
            },
        },
        include: { user: true }, // Include the associated user
    });

    // If no valid verification entry is found
    if (!verificationEntry || !verificationEntry.user) {
        return (
            <section className="p-8 max-w-md mx-auto">
                <h1 className="text-3xl font-bold mb-4">Verification Failed</h1>
                <p className="text-red-500">Invalid or expired verification token.</p>
            </section>
        );
    }

    const user = verificationEntry.user;

    // Update the user's emailVerified status
    await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
    });

    // Delete the verification token from the database
    await prisma.verificationToken.delete({
        where: { id: verificationEntry.id },
    });

    return (
        <section className="p-8 max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4">Email Verified Successfully!</h1>
            <p className="text-green-500">Your email has been verified. You can now log in.</p>
            <p className="mt-4 text-gray-500">Redirecting to sign in...</p>
            <meta httpEquiv="refresh" content="5;url=/signin" />
        </section>
    );

};

export default VerifyEmailPage;
