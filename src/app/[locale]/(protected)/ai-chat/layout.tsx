import type { Metadata } from "next";
import type { ReactNode } from "react";
import { constructMetadata } from "@/lib/config/metadata";

export const metadata: Metadata = constructMetadata({
  title: "AI Chat",
});

export default function AiChatLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
