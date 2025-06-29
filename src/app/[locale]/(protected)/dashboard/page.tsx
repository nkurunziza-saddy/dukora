import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getTotalSKUCount,
  getTotalWarehousesCount,
  getLowStockProductsCount,
  getCurrentInventoryValue,
} from "@/server/actions/statistics-actions";
import { getOverviewProducts } from "@/server/actions/product-actions";
import { getTranslations } from "next-intl/server";
import StatCard from "@/components/shared/stat-card";
import { getSchedulesOverview } from "@/server/actions/schedule-actions";
import { getLogsOverview } from "@/server/actions/logs-actions";
import { getLowStockAlertProducts } from "@/server/actions/product-items-actions";

export default async function InventoryDashboard() {
  const [totalSKUs, totalWarehouses, lowStockCount, inventoryValue] =
    await Promise.all([
      getTotalSKUCount(),
      getTotalWarehousesCount(),
      getLowStockProductsCount(),
      getCurrentInventoryValue(),
    ]);

  const inventoryItems = (await getOverviewProducts(6)).data;
  const schedules = (await getSchedulesOverview()).data;
  const logs = (await getLogsOverview()).data;
  const lowStockItems = (await getLowStockAlertProducts()).data;
  const t = await getTranslations("inventory");
  const t_com = await getTranslations("common");

  const inventoryStats = [
    {
      title: t("totalSKUs"),
      subText: t("fromLastMonth"),
      value: totalSKUs.data ?? 0,
      icon: Package,
    },
    {
      title: t("warehouse"),
      subText: t("activeLocations"),
      value: totalWarehouses.data ?? 0,
      icon: Warehouse,
    },
    {
      title: t("lowStockAlerts"),
      subText: (lowStockCount.data ?? 0) > 0 ? t("requiringAttention") : "",
      value: lowStockCount.data ?? 0,
      icon: AlertTriangle,
    },
    {
      title: t("totalValue"),
      subText: t("fromLastMonthValue"),
      value: inventoryValue.data ?? 0,
      icon: TrendingUp,
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
          <Alert variant="destructive">
            <AlertCircle />
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

        {inventoryItems && (
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
            <CardContent>
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
                    <TableHead>{t_com("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.products.sku}>
                      <TableCell className="font-medium">
                        {item.products.sku}
                      </TableCell>
                      <TableCell>{item.products.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.products.categoryId}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.warehouses.name}</TableCell>
                      <TableCell className="text-right">
                        {item.warehouse_items.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.products.reorderPoint}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.products.price}
                      </TableCell>
                      <TableCell>
                        {item.warehouse_items.quantity <
                        item.products.reorderPoint ? (
                          <Badge variant="destructive">{t("lowStock")}</Badge>
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
            </CardContent>
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
            <CardContent>
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
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                          style={{ backgroundColor: schedule.color }}
                        />
                        {schedule.title}
                      </TableCell>
                      <TableCell>
                        {schedule.category ? (
                          <Badge variant="secondary">{schedule.category}</Badge>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {logs && logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("logs")}</CardTitle>
              <CardDescription>
                {t("showingItems", {
                  count: logs.length,
                  total: logs.length,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.model}</TableCell>
                      <TableCell>{log.recordId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.performedBy}</TableCell>
                      <TableCell>
                        {log.performedAt
                          ? new Date(log.performedAt).toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
}
