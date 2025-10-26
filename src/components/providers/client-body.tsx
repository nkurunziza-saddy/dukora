"use client";

import { Suspense, useEffect } from "react";
import { GuardSkeleton } from "../skeletons";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.className = "antialiased";
  }, []);

  return (
    <Suspense fallback={<GuardSkeleton />}>
      <div className="antialiased">{children}</div>
    </Suspense>
  );
}
