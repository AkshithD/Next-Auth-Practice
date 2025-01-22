"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { SignInWithGoogle } from "../components/auth/signin-button-google"
import { z } from "zod"

// Zod schema for registration
const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one digit")
    .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
    .max(32, "Password must be less than 32 characters"),
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
})

export default function SignUpPage() {
  const router = useRouter()

  // Input states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  // Error states for individual fields
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  // State for form-level error
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Handle dynamic validation for name
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setName(value)

    const result = registerSchema.shape.name.safeParse(value)
    setNameError(result.success ? null : result.error.errors[0].message)
  }

  // Handle dynamic validation for email
  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setEmail(value)

    const result = registerSchema.shape.email.safeParse(value)
    setEmailError(result.success ? null : result.error.errors[0].message)
  }

  // Handle dynamic validation for password
  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setPassword(value)

    const result = registerSchema.shape.password.safeParse(value)
    setPasswordError(result.success ? null : result.error.errors[0].message)
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validate entire form on submit
    const result = registerSchema.safeParse({ email, password, name })
    if (!result.success) {
      setError("Please fix the errors above before submitting.")
      return
    }

    // Make API request if validation passes
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/signin")
      }, 2000)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      setError("Unexpected error. Please try again.")
    }
  }

  return (
    <section className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      {/* Display form-level error */}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && (
        <p className="text-green-500 mb-2">Registration successful! Redirecting...</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name Field */}
        <div>
          <label className="block mb-1">Name</label>
          <input
            className={`border p-2 w-full text-black rounded ${nameError ? "border-red-500" : ""
              }`}
            value={name}
            onChange={handleNameChange}
            placeholder="Your Name"
          />
          {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label className="block mb-1">Email</label>
          <input
            className={`border p-2 w-full text-black rounded ${emailError ? "border-red-500" : ""
              }`}
            value={email}
            onChange={handleEmailChange}
            placeholder="you@example.com"
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            className={`border p-2 w-full text-black rounded ${passwordError ? "border-red-500" : ""
              }`}
            value={password}
            onChange={handlePasswordChange}
            placeholder="********"
          />
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-600 text-white rounded ${emailError || passwordError || nameError ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
          disabled={!!emailError || !!passwordError || !!nameError} // Disable button if there are errors
        >
          Register
        </button>
      </form>

      {/* Google Sign-In */}
      <div className="mt-4">
        <button
          onClick={SignInWithGoogle}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Sign in with Google
        </button>
      </div>

      <p className="mt-4">
        Already have an account?{" "}
        <a href="/signin" className="text-blue-600">
          Sign in
        </a>
      </p>
    </section>
  )
}
