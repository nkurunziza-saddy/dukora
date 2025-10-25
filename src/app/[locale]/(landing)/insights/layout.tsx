import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { Suspense } from "react";
import { GuardSkeleton } from "@/components/guard-skeleton";

async function InsightsLayoutGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  if (session) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
export default async function InsightsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<GuardSkeleton />}>
      <InsightsLayoutGuard>{children}</InsightsLayoutGuard>
    </Suspense>
  );
}
