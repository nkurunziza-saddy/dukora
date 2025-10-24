import Link from "next/link";

export function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-32 lg:py-40">
      <div className="max-w-4xl mx-auto px-4 lg:px-12">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Built for businesses that need clarity and control
          </h2>
          <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
            <p>
              Dukora is a modern, open-source inventory and business management
              system designed to provide a comprehensive, real-time overview of
              your operations. Built with a powerful and scalable tech stack, it
              offers everything from product and warehouse management to
              detailed financial analytics and role-based user permissions.
            </p>
            <p>
              Born in Kigali in 2024, our mission is to bring total financial
              clarity to businesses of all sizes. We combine deep technical
              expertise with user-centric design to create tools that empower
              teams to make better decisions faster.
            </p>
            <p>
              Built with small to medium businesses in mind, Dukora scales
              alongside your growth, ensuring you always have the insights and
              control you need to succeed in a competitive market.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href={"/auth/sign-up"}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground text-xs font-medium hover:bg-surface transition-all"
            >
              Try Dukora for free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
