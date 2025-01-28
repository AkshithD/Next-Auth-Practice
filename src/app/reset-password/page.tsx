// src/app/reset-password/page.tsx

"use client"; // Marks this component as a Client Component

import { useState } from 'react';
import { z } from "zod";
import { useSearchParams, useRouter } from 'next/navigation';

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

const ResetPasswordPage = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const parsedData = resetPasswordSchema.parse({ password });
            const { password: newPassword } = parsedData;

            if (!token) {
                setError('Invalid or missing reset token.');
                return;
            }

            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password: newPassword }),
            });

            if (response.ok) {
                setSuccess('Password reset successfully. Redirecting to sign in...');
                setError('');
                // Redirect after a short delay
                setTimeout(() => {
                    router.push('/signin');
                }, 3000);
            } else {
                const data = await response.json();
                setError(data.error || 'Something went wrong');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError(error.errors.map((e) => e.message).join(", "));
            } else {
                setError('Something went wrong: ' + (error as Error).message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 border rounded shadow-md mt-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="password" className="block mb-2 font-semibold">
                        New Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your new password"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block mb-2 font-semibold">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Re-enter your new password"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    {loading ? "Resetting Password..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
};
export default ResetPasswordPage;
