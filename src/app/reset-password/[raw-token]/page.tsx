"use client"
import { useState } from 'react';
import { z } from "zod";

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
    const rawToken = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : null; // Extract token from URL
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const parsedData = resetPasswordSchema.parse({ password });
            const { password: newPassword } = parsedData;

            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: rawToken, password: newPassword }),
            });

            if (response.ok) {
                setSuccess('Password reset successfully');
                setError('');
            } else {
                const data = await response.json();
                setError(data.error || 'Something went wrong');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError(error.errors.map((e) => e.message).join(", "));
            }else{
                setError('Something went wrong: ' + error);
            }
        }
    };

    return (
        <div>
            <h1>Reset Password</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="password">New Password</label>
                    <input
                        className="border p-2 text-black"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        className="border p-2 text-black"
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;