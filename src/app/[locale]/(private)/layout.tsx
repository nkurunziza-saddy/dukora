import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (!session?.user.businessId) {
    redirect("/onboarding");
  }
  return <div>{children}</div>;
}
