"use client";

import Link from "next/link";
import { useState } from "react";

export function HoverPrefetchLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setActive(true)}
      prefetch={active ? null : false}
    >
      {children}
    </Link>
  );
}
