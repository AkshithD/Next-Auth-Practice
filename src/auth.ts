import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"
import bcrypt from "bcryptjs"

import { z } from "zod"


const credentialsSchema = z.object({
  email: z.string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z.string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [Google, Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("Please provide both email and password.")
  }
const parsed = credentialsSchema.safeParse(credentials)
 if (!parsed.success) {
          // Combine all error messages
          throw new Error(
            parsed.error.issues.map(i => i.message).join(", ")
          )
        }
  const user = await prisma.user.findUnique({ where: { email: credentials.email as string} })

  if (!user) {
    throw new Error("No account found for this email.")
  }

  const isValidPassword = await bcrypt.compare(credentials.password as string, user.hashedPassword as string)

  if (!isValidPassword) {
    throw new Error("Incorrect password.")
  }

  return { id: user.id, email: user.email }
      },
    }),],
    callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.user.id = token.userId as string
      }
      if (token?.email) {
        session.user.email = token.email as string
      }
      return session
    },
  },
})