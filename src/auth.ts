import NextAuth, { CredentialsSignin } from "next-auth"
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/db/prisma";
import bcrypt from "bcryptjs";
import { Provider } from "next-auth/providers";

class InvalidLoginError extends CredentialsSignin {
  code = "Incorrect password"
}

class UserNotFoundError extends CredentialsSignin {
  code = "User doesn't exist"
}

class OauthError extends CredentialsSignin {
  code = "Email already registered with another provider"
}

const providers: Provider[] = [Google,
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
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
