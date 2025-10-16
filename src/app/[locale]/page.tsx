import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { StatsSection } from "@/components/landing/stats-section";
import { AboutSection } from "@/components/landing/about-section";
import { BlogSection } from "@/components/landing/blog-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getCurrentSession();
  if (session) {
    redirect("/dashboard");
  }
  return (
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
  );
}
