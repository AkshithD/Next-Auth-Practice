"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error") // Fetch error query param if redirected
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [clientError, setClientError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setClientError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent auto-redirect to handle errors manually
    })

    if (result?.error) {
      setClientError(result.error)
    } else {
      router.push("/dashboard")
    }
  }

  async function handleGoogleSignIn() {
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <section className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      {clientError && <p className="text-red-500 mb-2">{clientError}</p>}
      {error && <p className="text-red-500 mb-2">Error: {error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            className="border p-2 w-full text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            className="border p-2 w-full text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Sign In
        </button>
      </form>

      <button
        onClick={handleGoogleSignIn}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Sign in with Google
      </button>
      <p className="mt-4"> Don&apos;t have an account? <a href="/signup" className="text-blue-600">Sign up</a></p>
    </section>
  )
}
