import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/actions/auth-actions";

export default async function OnboardingLayout({
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
  return <div>{children}</div>;
}
