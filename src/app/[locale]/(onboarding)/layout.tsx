import { redirect } from "next/navigation";
import { Suspense } from "react";
import { GuardSkeleton } from "@/components/guard-skeleton";
import { getCurrentSession } from "@/server/actions/auth-actions";

async function OnboardingLayoutGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session?.user.businessId) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<GuardSkeleton />}>
      <OnboardingLayoutGuard>{children}</OnboardingLayoutGuard>
    </Suspense>
  );
}
