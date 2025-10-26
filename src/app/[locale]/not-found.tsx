import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentSession } from "@/server/actions/auth-actions";
import type { SessionSession } from "@/lib/auth";
import { Suspense } from "react";
import { GuardSkeleton } from "@/components/guard-skeleton";

function NotFoundGuard({ session }: { session: SessionSession | null }) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2 items-center">
            {session ? (
              <Button
                variant={"secondary"}
                size="sm"
                render={<Link href={"/dashboard"} />}
              >
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant={"secondary"}
                  size="sm"
                  render={<Link href={"/"} />}
                >
                  Go to landing page
                </Button>
                <Button
                  variant={"outline"}
                  size="sm"
                  render={<Link href={"/auth/sign-up"} />}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
          <EmptyDescription className="text-sm">
            Need help?{" "}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}?subject=${encodeURIComponent(
                "Request for support in Dukora app",
              )}`}
              title="Email Dukora Support"
            >
              Contact support
            </a>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
}
export default async function NotFound() {
  const session = await getCurrentSession();
  return (
    <Suspense fallback={<GuardSkeleton />}>
      <NotFoundGuard session={session} />
    </Suspense>
  );
}
