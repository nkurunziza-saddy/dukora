import * as schema from "../src/lib/schema";
import "dotenv/config";
import { db } from "@/lib/db";

const main = async () => {
  console.log("Resetting database...");

  console.log("Clearing existing transactional and catalog data...");
  await db.delete(schema.auditLogsTable);
  await db.delete(schema.profitReportsTable);
  await db.delete(schema.metricsTable);
  await db.delete(schema.purchaseOrderItemsTable);
  await db.delete(schema.saleOrderItemsTable);
  await db.delete(schema.purchaseOrdersTable);
  await db.delete(schema.saleOrdersTable);
  await db.delete(schema.transactionsTable);
  await db.delete(schema.warehouseItemsTable);
  await db.delete(schema.warehousesTable);
  await db.delete(schema.productSuppliersTable);
  await db.delete(schema.productVariantsTable);
  await db.delete(schema.productAttributeValuesTable);
  await db.delete(schema.productAttributesTable);
  await db.delete(schema.productProductTagsTable);
  await db.delete(schema.productTagsTable);
  await db.delete(schema.productsTable);
  await db.delete(schema.categoriesTable);
  await db.delete(schema.suppliersTable);
  console.log("Data cleared.");
  await db.$client.end();
};

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
