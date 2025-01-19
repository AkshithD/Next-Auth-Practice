// src/app/layout.tsx
import "../app/globals.css";
import { Navbar } from "@/app/components/Navbar";
import { SessionProvider } from "next-auth/react"

export const metadata = {
  title: "My NextAuth App",
  description: "A simple NextAuth v5 + Prisma demo",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <body>
      <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
