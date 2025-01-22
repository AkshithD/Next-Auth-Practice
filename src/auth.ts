import NextAuth, { CredentialsSignin } from "next-auth"
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Provider } from "next-auth/providers";

class ValidationError extends CredentialsSignin {
  code = "Validation Error"
}

class InvalidLoginError extends CredentialsSignin {
  code = "Incorrect password"
}

class UserNotFoundError extends CredentialsSignin {
  code = "User doesn't exist"
}

class OauthError extends CredentialsSignin {
  code = "Please use the same provider to sign in"
}

const credentialsSchema = z.object({
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
});
const providers: Provider[] = [Google,
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      if (!credentials?.email || !credentials?.password) {
        throw new ValidationError();
      }
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) {
        throw new ValidationError();
      }
      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user) {
        throw new UserNotFoundError();
      }

      const isValidPassword = await bcrypt.compare(
        credentials.password as string,
        user.hashedPassword as string
      );

      if (!isValidPassword) {
        throw new InvalidLoginError();
      }
      return {
        id: `${user.id}`,
        username: `${user.name}`,
        email: `${user.email}`,
      };
    },
  }),
]
export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider()
      return { id: providerData.id, name: providerData.name }
    } else {
      return { id: provider.id, name: provider.name }
    }
  })
  .filter((provider) => provider.id !== "credentials")

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account && account.provider !== "credentials") {
        // Check if this email is already registered
        const existingUser = await prisma.user.findFirst({
          where: { email: user.email as string },
          include: { accounts: true },
        });

        if (existingUser) {
          // If the user is attempting to sign in with an OAuth provider
          // Check if the OAuth provider matches an existing account for this email
          if (existingUser.accounts.some((acc) => acc.provider === account.provider)) {
            return true;
          } else { throw new OauthError(); }
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
  },
});
