"use client";

import {
  Brain,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";

// Mock data
const kpiData = {
  monthlyRevenue: 485200,
  grossMargin: 34.5,
  predictedStockouts: 8,
  forecastAccuracy: 92.3,
};

const warehouseData = [
  { name: "WH-North", value: 45000, percentage: 35, color: "bg-blue-500" },
  { name: "WH-South", value: 38000, percentage: 30, color: "bg-green-500" },
  { name: "WH-East", value: 32000, percentage: 25, color: "bg-yellow-500" },
  { name: "WH-West", value: 28000, percentage: 22, color: "bg-purple-500" },
  { name: "WH-Central", value: 25000, percentage: 20, color: "bg-red-500" },
];

const aiRecommendations = [
  {
    product: "Wireless Headphones",
    sku: "WH-001",
    currentStock: 15,
    suggestedReorder: 85,
    reason: "High demand season approaching, sales velocity +40%",
    urgency: "high",
    savings: 1250,
  },
  {
    product: "Standing Desk",
    sku: "TB-004",
    currentStock: 3,
    suggestedReorder: 25,
    reason: "Low stock + consistent demand pattern",
    urgency: "medium",
    savings: 890,
  },
  {
    product: "Gaming Mouse",
    sku: "MG-003",
    currentStock: 25,
    suggestedReorder: 15,
    reason: "Stable inventory, optimize carrying costs",
    urgency: "low",
    savings: 450,
  },
];

const insights = [
  {
    title: "Seasonal Trend Alert",
    description:
      "Electronics category showing 32% increase in demand. Consider increasing inventory for Q1.",
    type: "trend",
    impact: "high",
  },
  {
    title: "Cost Optimization",
    description:
      "Furniture supplier pricing 15% above market average. Review contracts recommended.",
    type: "cost",
    impact: "medium",
  },
  {
    title: "Inventory Efficiency",
    description:
      "WH-North operating at 94% efficiency. Consider rebalancing stock across warehouses.",
    type: "efficiency",
    impact: "high",
  },
];

export default function AnalyticsAI() {
  const t = useTranslations("analytics");

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("monthlyRevenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${kpiData.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("grossMargin")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.grossMargin}%</div>
            <p className="text-xs text-muted-foreground">
              {t("grossMarginChange")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("predictedStockouts")}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {kpiData.predictedStockouts}
            </div>
            <p className="text-xs text-muted-foreground">{t("next30Days")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("forecastAccuracy")}
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData.forecastAccuracy}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t("aiModelPerformance")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Warehouse Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("warehousePerformance")}
            </CardTitle>
            <CardDescription>{t("revenueComparison")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {warehouseData.map((warehouse, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{warehouse.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${warehouse.value.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={warehouse.percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {warehouse.percentage}%
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("totalRevenue")}
                </span>
                <span className="font-medium">
                  $
                  {warehouseData
                    .reduce((sum, item) => sum + item.value, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {t("aiInsights")}
            </CardTitle>
            <CardDescription>{t("automatedInsights")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getImpactColor(
                      insight.impact
                    )}`}
                  />
                  <span className="font-medium">
                    {t(insight.title.replace(/\s/g, "").toLowerCase(), {
                      default: insight.title,
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(insight.description.replace(/\s/g, "").toLowerCase(), {
                    default: insight.description,
                  })}
                </p>
                <Badge variant="outline" className="text-xs">
                  {t(insight.type, {
                    default:
                      insight.type.charAt(0).toUpperCase() +
                      insight.type.slice(1),
                  })}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Smart Reorder Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t("smartReorderRecommendations")}
          </CardTitle>
          <CardDescription>{t("aiPoweredRecommendations")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rec.product}</span>
                      <Badge variant="outline" className="text-xs">
                        {rec.sku}
                      </Badge>
                      <Badge
                        variant={getUrgencyColor(rec.urgency)}
                        className="text-xs"
                      >
                        {t(rec.urgency, {
                          default:
                            rec.urgency.charAt(0).toUpperCase() +
                            rec.urgency.slice(1),
                        })}{" "}
                        {t("priority")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rec.reason}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        {t("current")}: <strong>{rec.currentStock}</strong>
                      </span>
                      <span>→</span>
                      <span>
                        {t("suggested")}:{" "}
                        <strong>{rec.suggestedReorder}</strong>
                      </span>
                      <span className="text-green-600">
                        {t("potentialSavings")}: ${rec.savings}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {t("modify")}
                    </Button>
                    <Button size="sm">{t("accept")}</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("totalPotentialSavings")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("byImplementingAll")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  $
                  {aiRecommendations
                    .reduce((sum, rec) => sum + rec.savings, 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{t("perMonth")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
