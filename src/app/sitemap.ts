import { SITE_HOME_URL } from "@/lib/config/site";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export const cats = [
  {
    title: "Dashboard",
    url: "dashboard",
  },
  {
    title: "Sales Tracking",
    url: "sales",
  },
  {
    title: "Analytics",
    url: "analytics",
  },
  {
    title: "Scheduler",
    url: "scheduler",
  },
  {
    title: "AI Chat",
    url: "ai-chat",
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pageRoutes = cats.map((cat) => ({
    url: `${SITE_HOME_URL}/${cat.url}`,
  }));

  return [...pageRoutes];
}
