import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { GuardSkeleton } from "@/components/guard-skeleton";
import { Suspense } from "react";

async function AuthLayoutGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  if (!session?.user.businessId && session) {
    redirect("/onboarding");
  }
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="w-full max-w-xl p-4 md:p-10">{children}</div>
    </div>
  );
}
export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<GuardSkeleton />}>
      <AuthLayoutGuard>{children}</AuthLayoutGuard>
    </Suspense>
  );
}
