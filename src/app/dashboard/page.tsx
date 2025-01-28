// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/db/prisma";
import SendVerificationButton from "@/app/components/auth/SendVerificationButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    console.log("No session found");
    redirect("/signin");
  }
  const userId = session.user?.id;
  if (!userId) {
    console.log("No user ID found in session");
    redirect("/signin");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
    },
  });
  if (!user) {
    return <div>User not found</div>
  }
  return (
    <section className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="mb-4">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Email Verified:</strong>{" "}
          {user.emailVerified ? (
            <span className="text-green-500">
              Yes, last verified on {new Date(user.emailVerified).toLocaleString()}
            </span>
          ) : (
            <span className="text-red-500">No</span>
          )}
        </p>
      </div>
      {!user.emailVerified && <SendVerificationButton />}
    </section>
  );
}
