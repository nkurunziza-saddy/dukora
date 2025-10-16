import { getCurrentSession } from "@/server/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function InsightsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  if (session) {
    redirect("/dashboard");
  }
  return <div>{children}</div>;
}
