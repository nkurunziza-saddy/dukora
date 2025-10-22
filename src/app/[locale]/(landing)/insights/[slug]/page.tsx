import Link from "next/link";
import { notFound } from "next/navigation";

const posts = {
  "ai-inventory-predictions": {
    category: "Product Update",
    title: "Introducing AI-powered inventory predictions",
    date: "Jan 15, 2025",
    author: "Saddy Nkurunziza",
    content: [
      {
        type: "paragraph",
        text: "We're excited to announce a major new feature in Dukora: AI-powered inventory predictions. This intelligent system analyzes your historical sales data, seasonal trends, and current stock levels to help you make smarter ordering decisions.",
      },
      {
        type: "heading",
        text: "How it works",
      },
      {
        type: "paragraph",
        text: "Our AI assistant uses machine learning algorithms trained on your business data to predict future inventory needs. It considers multiple factors including:",
      },
      {
        type: "list",
        items: [
          "Historical sales patterns and trends",
          "Seasonal variations in demand",
          "Current stock levels across all warehouses",
          "Lead times from suppliers",
          "Upcoming events or promotions",
        ],
      },
      {
        type: "heading",
        text: "Key benefits",
      },
      {
        type: "paragraph",
        text: "With AI-powered predictions, you can reduce stockouts by up to 40% while minimizing excess inventory. The system provides actionable recommendations on when to reorder and how much to order, taking the guesswork out of inventory management.",
      },
      {
        type: "paragraph",
        text: "The AI assistant is available 24/7 to answer questions about your inventory. Simply ask questions like 'Which products should I reorder this week?' or 'What's my predicted stock level for next month?' and get instant, data-driven answers.",
      },
      {
        type: "heading",
        text: "Getting started",
      },
      {
        type: "paragraph",
        text: "The AI predictions feature is available now in Dukora. To start using it, navigate to the AI Assistant section in your dashboard. The system will automatically begin analyzing your data and providing recommendations after you've recorded at least 30 days of transaction history.",
      },
      {
        type: "paragraph",
        text: "As an open-source project, we welcome contributions to improve the AI models. Check out our GitHub repository to learn more about the implementation and how you can help make it even better.",
      },
    ],
  },
  "multi-warehouse-setup": {
    category: "Tutorial",
    title: "Setting up multi-warehouse management",
    date: "Jan 10, 2025",
    author: "Saddy Nkurunziza",
    content: [
      {
        type: "paragraph",
        text: "Managing inventory across multiple locations can be complex, but Dukora makes it straightforward. This comprehensive guide will walk you through setting up and managing multiple warehouses in your Dukora installation.",
      },
      {
        type: "heading",
        text: "Creating your first warehouse",
      },
      {
        type: "paragraph",
        text: "Start by navigating to Settings > Warehouses in your Dukora dashboard. Click 'Add Warehouse' and fill in the essential details:",
      },
      {
        type: "list",
        items: [
          "Warehouse name and code (for easy reference)",
          "Physical address and contact information",
          "Warehouse manager and staff assignments",
          "Operating hours and timezone",
          "Storage capacity and layout details",
        ],
      },
      {
        type: "heading",
        text: "Organizing inventory by location",
      },
      {
        type: "paragraph",
        text: "Once your warehouses are set up, you can assign inventory to specific locations. Each product in Dukora can have different stock levels across multiple warehouses. The system automatically tracks which warehouse has which items, making it easy to fulfill orders from the optimal location.",
      },
      {
        type: "paragraph",
        text: "When adding new inventory, you'll select the destination warehouse. The system maintains separate stock counts for each location, giving you complete visibility into your entire inventory network.",
      },
      {
        type: "heading",
        text: "Managing transfers between warehouses",
      },
      {
        type: "paragraph",
        text: "Dukora includes a built-in transfer system for moving inventory between locations. Create a transfer request by selecting the source warehouse, destination warehouse, and items to move. The system tracks the transfer status and automatically updates stock levels when the transfer is completed.",
      },
      {
        type: "paragraph",
        text: "All transfers are logged in the audit trail, ensuring complete transparency and accountability. You can view transfer history, pending transfers, and generate reports on inter-warehouse movements.",
      },
      {
        type: "heading",
        text: "Best practices",
      },
      {
        type: "paragraph",
        text: "For optimal multi-warehouse management, we recommend establishing clear procedures for stock transfers, conducting regular cycle counts at each location, and using the AI assistant to optimize inventory distribution across your warehouse network.",
      },
      {
        type: "paragraph",
        text: "Set up automated alerts for low stock levels at each warehouse, and configure reorder points based on location-specific demand patterns. This ensures you maintain optimal stock levels across your entire operation.",
      },
    ],
  },
  "optimize-cash-flow": {
    category: "Best Practices",
    title: "5 strategies to optimize cash flow",
    date: "Jan 5, 2025",
    author: "Saddy Nkurunziza",
    content: [
      {
        type: "paragraph",
        text: "Cash flow is the lifeblood of any business. Poor cash flow management is one of the leading causes of business failure, even for profitable companies. Here are five proven strategies to optimize your cash flow using Dukora's financial tracking features.",
      },
      {
        type: "heading",
        text: "1. Monitor your cash flow in real-time",
      },
      {
        type: "paragraph",
        text: "Dukora's financial dashboard provides real-time visibility into your cash position. Track all incoming revenue from sales and outgoing expenses including purchases, operational costs, and supplier payments. Set up daily or weekly cash flow reports to stay on top of your financial position.",
      },
      {
        type: "paragraph",
        text: "Use the cash flow projection feature to forecast your position for the next 30, 60, or 90 days based on historical patterns and upcoming commitments. This helps you anticipate and prepare for potential cash crunches.",
      },
      {
        type: "heading",
        text: "2. Optimize your inventory levels",
      },
      {
        type: "paragraph",
        text: "Excess inventory ties up cash that could be used elsewhere in your business. Use Dukora's inventory analytics to identify slow-moving items and adjust your purchasing accordingly. The AI assistant can help you find the optimal balance between having enough stock to meet demand and not over-investing in inventory.",
      },
      {
        type: "paragraph",
        text: "Implement just-in-time ordering for items with reliable suppliers and predictable demand. This reduces the amount of cash locked up in inventory while maintaining service levels.",
      },
      {
        type: "heading",
        text: "3. Improve your receivables collection",
      },
      {
        type: "paragraph",
        text: "Track all outstanding invoices in Dukora and set up automated reminders for overdue payments. The system can generate aging reports showing which customers owe money and for how long. Follow up promptly on overdue accounts to accelerate cash collection.",
      },
      {
        type: "paragraph",
        text: "Consider offering early payment discounts to incentivize customers to pay faster. Even a small discount can significantly improve your cash flow by reducing the time between sale and payment.",
      },
      {
        type: "heading",
        text: "4. Negotiate better payment terms with suppliers",
      },
      {
        type: "paragraph",
        text: "Use Dukora's supplier management features to track payment terms and identify opportunities to negotiate better conditions. Extending payment terms from 30 to 60 days can provide a significant cash flow boost without any additional cost.",
      },
      {
        type: "paragraph",
        text: "Build strong relationships with key suppliers and maintain a good payment history. This gives you leverage to negotiate more favorable terms when needed.",
      },
      {
        type: "heading",
        text: "5. Control operational expenses",
      },
      {
        type: "paragraph",
        text: "Track all operational expenses in Dukora and review them regularly. Identify areas where you can reduce costs without impacting quality or service. Small savings across multiple expense categories can add up to significant cash flow improvements.",
      },
      {
        type: "paragraph",
        text: "Use the expense analytics dashboard to spot trends and anomalies. Set budgets for different expense categories and receive alerts when spending exceeds planned levels.",
      },
      {
        type: "heading",
        text: "Putting it all together",
      },
      {
        type: "paragraph",
        text: "Effective cash flow management requires consistent monitoring and proactive decision-making. Dukora provides all the tools you need to implement these strategies and maintain healthy cash flow. Start by setting up your financial tracking, then gradually implement each strategy to see cumulative improvements in your cash position.",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({
    slug,
  }));
}

export default function InsightPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug as keyof typeof posts];

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-secondary hover:text-foreground transition"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <article className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-3 text-xs text-foreground/80">
              <span className="uppercase tracking-wider">{post.category}</span>
              <span>•</span>
              <time>{post.date}</time>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
              {post.title}
            </h1>

            <div className="pt-4">
              <div className="text-sm font-medium text-foreground">
                {post.author}
              </div>
              <Link
                href="https://x.com/nk_saddy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-secondary hover:text-foreground transition"
              >
                @nk_saddy
              </Link>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            {post.content.map((block, index) => {
              if (block.type === "paragraph") {
                return (
                  <p
                    key={
                      block.text
                        ? block.text.substring(0, 30)
                        : `${block.type}-${index}`
                    }
                    className="text-sm text-text-secondary leading-relaxed mb-6"
                  >
                    {block.text}
                  </p>
                );
              }

              if (block.type === "heading") {
                return (
                  <h2
                    key={block.text}
                    className="text-xl md:text-2xl font-bold text-foreground mt-12 mb-4"
                  >
                    {block.text}
                  </h2>
                );
              }

              if (block.type === "list") {
                const items = (block as any).items as any[];
                return (
                  <ul key={items[0]} className="space-y-2 mb-6 ml-6">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-text-secondary leading-relaxed list-disc"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }

              return null;
            })}
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <Link
                href="/#insights"
                className="text-xs text-text-secondary hover:text-foreground transition"
              >
                ← More insights
              </Link>
              <Link
                href="https://github.com/nkurunziza-saddy/dukora"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-secondary hover:text-foreground transition"
              >
                Contribute on GitHub →
              </Link>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
