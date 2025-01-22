"use client"
import Link from "next/link";
import React from "react";
import "../globals.css";
import { SignOut } from "./auth/signout-button";
import { useSession } from "next-auth/react";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-1 hover:text-blue-500">
      {children}
    </Link>
  )
}

export function Navbar() {
  const { data: session } = useSession()
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b">
      <div className="flex space-x-4">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/dashboard">Dashboard</NavLink>
      </div>
      <div className="flex space-x-4">
        {session ? <SignOut /> : <Link href="/signin">Sign In</Link>}
      </div>
    </nav>
  )
}