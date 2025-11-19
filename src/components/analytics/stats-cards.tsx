import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";

const stats = [
  {
    icon: DollarSign,
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
  },
  {
    icon: Users,
    title: "Subscriptions",
    value: "+2350",
    change: "+180.1% from last month",
  },
  {
    icon: ShoppingCart,
    title: "Sales",
    value: "+12,234",
    change: "+19% from last month",
  },
  {
    icon: Package,
    title: "Active Now",
    value: "+573",
    change: "+201 since last hour",
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardPanel>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardPanel>
        </Card>
      ))}
    </div>
  );
}
