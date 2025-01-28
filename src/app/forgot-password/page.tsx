"use client"
import React, { useState } from 'react';
import { z } from "zod";

const registerSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
});

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const parsedData = registerSchema.parse({ email });
            const { email: Email } = parsedData;

            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: Email }),
            });

            const data = await response.json();

            if (response.status === 200) {
                setMessage('If the email exists, a reset link has been sent.');
            } else {
                setMessage(data.error);
            }
        } catch (e) {
            if (e instanceof z.ZodError) {
                setError(e.errors.map((err) => err.message).join(", "));
            } else {
                setMessage('An error occurred. Please try again. Error: ' + e);
            }
        }
    };

    return (
        <div>
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    className='border p-2 text-black'
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Submit</button>
            </form>
            {message && <p className='text-red-500 mb-4'>{message}</p>}
            {error && <p className='text-red-500 mb-4'>{error}</p>}
        </div>
    );
};

export default ForgotPasswordPage;