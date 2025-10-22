const posts = [
  {
    slug: "ai-inventory-predictions",
    category: "Product Update",
    title: "Introducing AI-powered inventory predictions",
    description:
      "Learn how our new AI assistant helps you predict stock levels and optimize ordering.",
    date: "Jan 15, 2025",
  },
  {
    slug: "multi-warehouse-setup",
    category: "Tutorial",
    title: "Setting up multi-warehouse management",
    description:
      "A complete guide to managing inventory across multiple locations with Dukora.",
    date: "Jan 10, 2025",
  },
  {
    slug: "optimize-cash-flow",
    category: "Best Practices",
    title: "5 strategies to optimize cash flow",
    description:
      "Proven techniques to maintain liquidity and reduce manual work across all accounts.",
    date: "Jan 5, 2025",
  },
];

export function BlogSection() {
  return (
    <section id="insights" className="py-24 md:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Latest insights
          </h2>
          <p className="text-sm text-text-secondary">
            Product updates, tutorials, and best practices for inventory
            management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {posts.map((post, index) => (
            <a
              key={index}
              href={`/insights/${post.slug}`}
              className="bg-background p-8 hover:bg-surface-elevated transition-colors group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-tertiary uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {post.date}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-text-secondary transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {post.description}
                </p>
                <div className="text-xs text-foreground pt-2">Read more →</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
