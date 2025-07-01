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
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="w-full max-w-xl p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
