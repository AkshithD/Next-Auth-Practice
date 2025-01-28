"use client"; // This directive marks the component as a Client Component

import { useState } from "react";

const SendVerificationButton = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sendVerificationEmail = async () => {
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            const response = await fetch("/api/auth/send-email-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send verification email.");
            }
            setMessage(data.message || "Verification email sent successfully.");
        } catch (err) {
            setError((err as Error).message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <button
                onClick={sendVerificationEmail}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
                {loading ? "Sending..." : "Send Verification Email"}
            </button>
            {message && <p className="text-green-500 mt-2">{message}</p>}
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default SendVerificationButton;
