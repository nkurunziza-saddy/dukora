import Link from "next/link";

export function StatsSection() {
  return (
    <section className="py-24 md:py-32 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold text-foreground">
              100%
            </div>
            <div className="text-sm text-text-secondary">
              Open Source & Free{" "}
            </div>
          </div>
          <p className="text-xs text-text-tertiary max-w-lg mx-auto leading-relaxed">
            Currently in alpha development. Built by{" "}
            <Link
              href="https://x.com/nk_saddy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              @nk_saddy
            </Link>
            . Contributions welcome on{" "}
            <Link
              href="https://github.com/nkurunziza-saddy/dukora"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
