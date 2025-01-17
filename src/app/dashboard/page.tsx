// src/app/dashboard/page.tsx

import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    // If user is not logged in, redirect to sign in
    redirect("/signin")
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {session.user && <p>Welcome, {session.user.email}!</p>}
      {/* You could also show session.user.id, session.user.name, etc. */}
    </section>
  )
}
