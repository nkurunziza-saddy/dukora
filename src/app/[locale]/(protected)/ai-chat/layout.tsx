import { constructMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

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
