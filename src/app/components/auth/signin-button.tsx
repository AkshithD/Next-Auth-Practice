import { signIn } from "@/auth"

export function SignInWithCredentials() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("credentials", { redirectTo: "/dashboard" })
      }}
    >
      <button type="submit">Sign in</button>
    </form>
  )
}

export function SignInWithGoogle() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google", { redirectTo: "/dashboard" })
      }}
    >
      <button type="submit">Sign in with Google</button>
    </form>
  )
}