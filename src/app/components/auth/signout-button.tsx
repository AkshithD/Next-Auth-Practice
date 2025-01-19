"use client"

import { signOut } from "next-auth/react"

export function SignOut() {
  return (
    <button onClick={() => signOut()} className="px-3 py-1 hover:text-blue-500">
      Sign Out
    </button>
  )
}