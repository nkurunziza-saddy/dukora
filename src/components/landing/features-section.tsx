const features = [
  {
    title: "Real-time Inventory",
    description:
      "Track stock levels across all warehouses with automatic alerts and batch tracking.",
  },
  {
    title: "Multi-warehouse",
    description:
      "Manage inventory across multiple locations with seamless transfers.",
  },
  {
    title: "AI Assistant",
    description:
      "Get instant answers about your business with our tuned AI assistant.",
  },
  {
    title: "Financial Analytics",
    description:
      "Comprehensive insights into sales, profits, COGS, and margins.",
  },
  {
    title: "Transaction Tracking",
    description:
      "Record all sales, purchases, and operational expenses automatically.",
  },
  {
    title: "Role-based Access",
    description:
      "Granular permissions and multi-user support for team collaboration.",
  },
  {
    title: "Supplier Management",
    description: "Manage supplier relationships and track purchase orders.",
  },
  {
    title: "Task Scheduling",
    description: "Built-in calendar for scheduling tasks and business events.",
  },
  {
    title: "Multi-language",
    description: "Internationalized UI with support for multiple languages.",
  },
  {
    title: "Complete Audit Log",
    description:
      "Every action is logged for complete transparency and compliance.",
  },
  {
    title: "Secure by Design",
    description:
      "Data encryption, regular backups, and robust security practices to protect your business data.",
  },
  {
    title: "Mobile Ready",
    description: "Responsive design that works seamlessly on all devices.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 lg:py-40">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <div className="max-w-2xl mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Everything you need to manage your business
          </h2>
          <p className="text-sm text-text-secondary text-pretty">
            From inventory tracking to AI-powered insights, Dukora provides all
            the tools to streamline operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background p-8 md:p-10 hover:bg-surface transition-colors group"
            >
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
