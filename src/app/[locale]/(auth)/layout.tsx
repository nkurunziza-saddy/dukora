import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  if (!session?.user.businessId) {
    redirect("/onboarding");
  }
  if (session) {
    redirect("/dashboard");
  }
  return <div>{children}</div>;
}
