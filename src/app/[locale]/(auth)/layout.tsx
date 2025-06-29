import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
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

  return <div className="h-[100vh] flex justify-center items-center">{children}</div>;
}
