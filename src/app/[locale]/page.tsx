import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, BarChart, Database, ShieldCheck } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default async function LandingPage() {
  const session = await getCurrentSession();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-5xl mx-auto">
          <div className="absolute top-0 left-0 w-full h-full border-t border-l border-r border-b border-border/80 rounded-xl"></div>
          <div className="absolute -top-px left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          <div className="absolute -bottom-px left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          <div className="absolute -left-px top-1/2 -translate-y-1/2 w-px h-1/2 bg-gradient-to-b from-transparent via-primary to-transparent"></div>
          <div className="absolute -right-px top-1/2 -translate-y-1/2 w-px h-1/2 bg-gradient-to-b from-transparent via-primary to-transparent"></div>

          <main className="relative bg-background/80 backdrop-blur-sm rounded-xl p-8 md:p-16">
            <header className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                Quantura
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                The modern, open-source platform for intelligent inventory
                management and real-time business analytics.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="https://github.com/nkurunziza-saddy/quantra">
                    Get Started
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/sign-up">View on GitHub</Link>
                </Button>
              </div>
            </header>

            <Separator className="my-16" />

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <FeatureCard
                icon={<CheckCircle className="size-5 text-primary" />}
                title="Real-time Tracking"
                description="Monitor stock levels, sales, and expenses as they happen."
              />
              <FeatureCard
                icon={<BarChart className="size-5 text-primary" />}
                title="Powerful Analytics"
                description="Automated financial metrics and insightful reports."
              />
              <FeatureCard
                icon={<Database className="size-5 text-primary" />}
                title="Robust Data Layer"
                description="Built on PostgreSQL with Drizzle ORM for type-safe queries."
              />
              <FeatureCard
                icon={<ShieldCheck className="size-5 text-primary" />}
                title="Secure by Design"
                description="Granular, role-based permissions for every action."
              />
            </section>
          </main>
        </div>
      </div>

      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Built with Next.js. Open Source on GitHub.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="p-3 rounded-full bg-primary/10 mb-4">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm mt-1">{description}</p>
    </div>
  );
}
