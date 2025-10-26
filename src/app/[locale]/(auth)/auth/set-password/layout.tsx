import type { Metadata } from "next";
import type { ReactNode } from "react";
import { constructMetadata } from "@/lib/config/metadata";

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
