import type React from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import SidebarContainer from "@/components/providers/sidebar-container";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { GuardSkeleton } from "@/components/guard-skeleton";

async function SessionGuard({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  if (!session?.user.businessId) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<GuardSkeleton />}>
      <SessionGuard>
        <SidebarContainer>{children}</SidebarContainer>
      </SessionGuard>
    </Suspense>
  );
}
