import { redirect } from "next/navigation";
import { AboutSection } from "@/components/landing/about-section";
import { BlogSection } from "@/components/landing/blog-section";
import { CTASection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Navigation } from "@/components/landing/navigation";
import { StatsSection } from "@/components/landing/stats-section";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { Suspense } from "react";
import { GuardSkeleton } from "@/components/guard-skeleton";

async function LandingPageGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  if (session) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
export default async function LandingPage() {
  return (
    <Suspense fallback={<GuardSkeleton />}>
      <LandingPageGuard>
        <main className="min-h-screen">
          <Navigation />
          <HeroSection />
          <FeaturesSection />
          <StatsSection />
          <AboutSection />
          <BlogSection />
          <CTASection />
          <Footer />
        </main>
      </LandingPageGuard>
    </Suspense>
  );
}
