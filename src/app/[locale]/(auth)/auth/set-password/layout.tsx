import { constructMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = constructMetadata({
  title: "Set Password",
});

export default function SetPasswordLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
