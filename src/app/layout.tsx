// src/app/layout.tsx
import { auth } from "@/auth"
import Link from "next/link"
import "../app/globals.css"

import { SignOut } from "./components/auth/signout-button"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-1 hover:text-blue-500">
      {children}
    </Link>
  )
}

export const metadata = {
  title: "My NextAuth App",
  description: "A simple NextAuth v5 + Prisma demo",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Check session server-side
  const session = await auth()

  return (
    <html lang="en">
      <body>
        <nav className="flex items-center justify-between px-6 py-3 border-b">
          <div className="flex space-x-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
          </div>

          <div className="flex space-x-4">
            {session ? (
              // If logged in, show sign-out
              <SignOut />
            ) : (
              // If not logged in, just link to the Sign In page
              <NavLink href="/signin">Sign In</NavLink>
            )}
          </div>
        </nav>

        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}
