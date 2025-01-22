"use server"

import { signIn } from "@/auth"
export async function SignInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}
