import {
  AlertCircleIcon,
  AlertTriangleIcon,
  PackageIcon,
  TrendingUpIcon,
  WarehouseIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import StatCard from "@/components/shared/stat-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, formatKeys, formatNumber } from "@/lib/utils";
import { getLogsOverview } from "@/server/actions/logs-actions";
import { getOverviewProducts } from "@/server/actions/product-actions";
import { getLowStockAlertProducts } from "@/server/actions/product-items-actions";
import { getSchedulesOverview } from "@/server/actions/schedule-actions";
import {
  getCurrentInventoryValue,
  getLowStockProductsCount,
  getTotalSKUCount,
  getTotalWarehousesCount,
} from "@/server/actions/statistics-actions";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/config/metadata";

export const metadata: Metadata = constructMetadata({
  title: "Dashboard",
  description: "View your inventory and sales analytics in real-time",
  canonicalUrl: "/dashboard",
});

export default async function InventoryDashboard() {
  const [totalSKUs, totalWarehouses, lowStockCount, inventoryValue] =
    await Promise.all([
      getTotalSKUCount({}),
      getTotalWarehousesCount({}),
      getLowStockProductsCount({}),
      getCurrentInventoryValue({}),
    ]);

  const inventoryItems = (await getOverviewProducts(6)).data;
  const schedules = (await getSchedulesOverview(6)).data;
  const logsData = (await getLogsOverview(6)).data;
  const lowStockItems = (await getLowStockAlertProducts({})).data;
  const t = await getTranslations("inventory");
  const t_com = await getTranslations("common");
  const inventoryStats = [
    {
      title: t("totalSKUs"),
      subText: t("totalSku"),
      value: formatNumber(totalSKUs.data ?? 0),
      icon: PackageIcon,
    },
    {
      title: t("warehouse"),
      subText: t("activeLocations"),
      value: formatNumber(totalWarehouses.data ?? 0),
      icon: WarehouseIcon,
    },
    {
      title: t("lowStockAlerts"),
      subText:
        (lowStockCount.data ?? 0) > 0
          ? t("requiringAttention")
          : t("healthyInventory"),
      value: formatNumber(lowStockCount.data ?? 0),
      icon: AlertTriangleIcon,
    },
    {
      title: t("totalValue"),
      subText: t("currentStockValue"),
      value: formatCurrency(inventoryValue.data ?? 0),
      icon: TrendingUpIcon,
    },
  ];
  if ((totalSKUs.data ?? 0) === 0 && (inventoryValue.data ?? 0) === 0) {
    return (
      <CardHeader className="text-center mt-24">
        <CardTitle>{t_com("noDataYet")}</CardTitle>
        <CardDescription>{t_com("helpStarting")}?</CardDescription>
      </CardHeader>
    );
  } else {
    return (
      <div className="space-y-6">
        {lowStockItems && lowStockItems.length > 0 && (
          <Alert variant="error">
            <AlertCircleIcon />
            <AlertTitle>{t("lowStockAlerts")}</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc text-sm">
                {lowStockItems.map((item) => (
                  <li key={item.products.sku}>
                    {item.products.name}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({item.warehouses.name})
                    </span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {inventoryStats.map((item) => (
            <StatCard
              key={`${item.title}-${item.subText}`}
              icon={item.icon}
              subText={item.subText}
              title={item.title}
              value={item.value}
            />
          ))}
        </div>

        {inventoryItems && inventoryItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("inventoryItems")}</CardTitle>
              <CardDescription>
                {t("showingItems", {
                  count: inventoryItems.length,
                  total: inventoryItems.length,
                })}
              </CardDescription>
            </CardHeader>
            <CardPanel>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("sku")}</TableHead>
                    <TableHead>{t("productName")}</TableHead>
                    <TableHead>{t("category")}</TableHead>
                    <TableHead>{t("warehouse")}</TableHead>
                    <TableHead className="text-right">{t("onHand")}</TableHead>
                    <TableHead className="text-right">
                      {t("reorderLevel")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("unitPrice")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t_com("status")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.products.sku + item.warehouses.name}>
                      <TableCell className="font-medium">
                        {item.products.sku}
                      </TableCell>
                      <TableCell>{item.products.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.categories.value}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.warehouses.name}</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.warehouse_items.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.products.reorderPoint}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.products.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.warehouse_items.quantity <
                        item.products.reorderPoint ? (
                          <Badge variant="error">{t("lowStock")}</Badge>
                        ) : item.warehouse_items.quantity <=
                          item.products.reorderPoint * 1.5 ? (
                          <Badge variant="outline">{t("medium")}</Badge>
                        ) : (
                          <Badge variant="default">{t("inStock")}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardPanel>
          </Card>
        )}

        {schedules && schedules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("schedules")}</CardTitle>
              <CardDescription>
                {t("showingItems", {
                  count: schedules.length,
                  total: schedules.length,
                })}
              </CardDescription>
            </CardHeader>
            <CardPanel>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tableScheduleTitle")}</TableHead>
                    <TableHead>{t("category")}</TableHead>
                    <TableHead>{t("location")}</TableHead>
                    <TableHead>{t("allDay")}</TableHead>
                    <TableHead>{t("start")}</TableHead>
                    <TableHead>{t("end")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => {
                    const colorClass = `bg-${schedule.color}-400`;
                    return (
                      <TableRow key={schedule.id}>
                        <TableCell className="flex items-center">
                          <span
                            className={cn(
                              "inline-block size-2.5 rounded-md mr-2 align-middle opacity-60",
                              colorClass
                            )}
                            aria-hidden="true"
                          />
                          {schedule.title}
                        </TableCell>
                        <TableCell>
                          {schedule.category ? (
                            <Badge variant="secondary">
                              {schedule.category}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{schedule.location}</TableCell>
                        <TableCell>
                          {schedule.all_day ? t_com("yes") : t_com("no")}
                        </TableCell>
                        <TableCell>
                          {schedule.start
                            ? new Date(schedule.start).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {schedule.end
                            ? new Date(schedule.end).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardPanel>
          </Card>
        )}

        {logsData && logsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("logs")}</CardTitle>
              <CardDescription>
                {t("showingItems", {
                  count: logsData.length,
                  total: logsData.length,
                })}
              </CardDescription>
            </CardHeader>
            <CardPanel>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("model")}</TableHead>
                    <TableHead>{t("recordId")}</TableHead>
                    <TableHead>{t("action")}</TableHead>
                    <TableHead>{t("performedBy")}</TableHead>
                    <TableHead>{t("performedAt")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsData?.map((log) => {
                    const formattedString = log.audit_logs.action
                      .split("-")
                      .join(" ");
                    const formattedModelName = formatKeys(log.audit_logs.model);

                    return (
                      <TableRow key={log.audit_logs.id}>
                        <TableCell>{formatKeys(formattedModelName)}</TableCell>
                        <TableCell>{log.audit_logs.recordId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formattedString.charAt(0).toUpperCase() +
                              formattedString.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.users.name}</TableCell>
                        <TableCell>
                          {log.audit_logs.performedAt
                            ? new Date(
                                log.audit_logs.performedAt
                              ).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardPanel>
          </Card>
        )}
      </div>
    );
  }
}
