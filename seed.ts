import { faker } from "@faker-js/faker";
import * as schema from "./src/lib/schema";
import "dotenv/config";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { db } from "@/lib/db";
import { OrderStatus, TransactionType } from "@/lib/schema/schema-types";

const main = async () => {
  console.log("Seeding database...");

  console.log("Fetching existing business and users...");
  const businesses = await db.query.businessesTable.findMany();

  if (!businesses) {
    console.error(
      "No business found in the database. Please create a business before seeding."
    );
    process.exit(1);
  }

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

  for (const business of businesses) {
    console.log(`Seeding data for business: ${business.name}`);

    console.log(`Found business: ${business.name} (${business.id})`);
    const users = await db.query.usersTable.findMany({
      where: (table, { eq }) => eq(table.businessId, business.id),
    });

    if (users.length === 0) {
      console.error(
        `No users found for business: ${business.name}. Please ensure users exist.`
      );
      process.exit(1);
    }
    console.log(`Found ${users.length} users for the business.`);

    const today = new Date();
    const sixMonthsAgo = subMonths(today, 6);

    console.log("  Seeding categories...");
    const categoryValues = new Set<string>();
    while (categoryValues.size < 5) {
      categoryValues.add(faker.commerce.department());
    }
    const categoriesData = Array.from(categoryValues).map((value) => ({
      value: value,
      businessId: business.id,
      createdAt: faker.date.between({
        from: sixMonthsAgo,
        to: subMonths(today, 5),
      }),
      updatedAt: faker.date.between({ from: subMonths(today, 5), to: today }),
    }));
    const categories = await db
      .insert(schema.categoriesTable)
      .values(categoriesData)
      .returning();
    console.log(`  ${categories.length} categories seeded.`);

    console.log("  Seeding suppliers...");
    const suppliersData = Array.from({ length: 4 }).map(() => {
      const createdDate = faker.date.between({
        from: sixMonthsAgo,
        to: subMonths(today, 4),
      });
      return {
        name: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        businessId: business.id,
        createdBy: users[0].id,
        createdAt: createdDate,
        updatedAt: faker.date.between({ from: createdDate, to: today }),
      };
    });
    const suppliers = await db
      .insert(schema.suppliersTable)
      .values(suppliersData)
      .returning();
    console.log(`  ${suppliers.length} suppliers seeded.`);

    console.log("  Seeding products...");
    const productsData = Array.from({ length: 25 }).map(() => {
      const price = parseFloat(faker.commerce.price({ min: 10, max: 500 }));
      const createdDate = faker.date.between({
        from: sixMonthsAgo,
        to: subMonths(today, 3),
      });
      return {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        sku: faker.string.alphanumeric(8).toUpperCase(),
        barcode: faker.string.numeric(13),
        price: price.toFixed(2),
        costPrice: (price * faker.number.float({ min: 0.5, max: 0.8 })).toFixed(
          2
        ),
        categoryId: faker.helpers.arrayElement(categories).id,
        businessId: business.id,
        createdAt: createdDate,
        updatedAt: faker.date.between({ from: createdDate, to: today }),
      };
    });
    const products = await db
      .insert(schema.productsTable)
      .values(productsData)
      .returning();
    console.log(`  ${products.length} products seeded.`);

    console.log("  Seeding product suppliers...");
    const productSuppliersData = products.flatMap((product) => {
      const selectedSuppliers = faker.helpers.arrayElements(
        suppliers,
        faker.number.int({ min: 1, max: 2 })
      );
      return selectedSuppliers.map((supplier) => {
        const createdDate = faker.date.between({
          from: new Date(
            Math.max(product.createdAt.getTime(), supplier.createdAt.getTime())
          ),
          to: today,
        });
        return {
          productId: product.id,
          supplierId: supplier.id,
          businessId: business.id,
          supplierPrice: (
            parseFloat(product.costPrice) *
            faker.number.float({ min: 0.9, max: 1.1 })
          ).toFixed(2),
          leadTimeDays: faker.number.int({ min: 1, max: 14 }),
          isPreferred: true,
          createdAt: createdDate,
          updatedAt: faker.date.between({ from: createdDate, to: today }),
        };
      });
    });
    await db.insert(schema.productSuppliersTable).values(productSuppliersData);
    console.log(
      `  ${productSuppliersData.length} product supplier links seeded.`
    );

    console.log("  Seeding warehouses...");
    const warehousesData = Array.from({ length: 2 }).map((_, i) => {
      const createdDate = faker.date.between({
        from: sixMonthsAgo,
        to: subMonths(today, 5),
      });
      return {
        name: `${faker.location.city()} Warehouse`,
        code: faker.string.alphanumeric(4).toUpperCase(),
        address: faker.location.streetAddress(),
        businessId: business.id,
        isDefault: i === 0,
        createdBy: users[0].id,
        createdAt: createdDate,
        updatedAt: faker.date.between({ from: createdDate, to: today }),
      };
    });
    const warehouses = await db
      .insert(schema.warehousesTable)
      .values(warehousesData)
      .returning();
    console.log(`  ${warehouses.length} warehouses seeded.`);

    console.log("  Seeding initial inventory...");
    const warehouseItemsData = warehouses.flatMap((warehouse) =>
      products.map((product) => {
        const createdDate = faker.date.between({
          from: new Date(
            Math.max(warehouse.createdAt.getTime(), product.createdAt.getTime())
          ),
          to: subMonths(today, 2),
        });
        return {
          warehouseId: warehouse.id,
          productId: product.id,
          quantity: faker.number.int({ min: 50, max: 200 }),
          createdAt: createdDate,
          updatedAt: faker.date.between({ from: createdDate, to: today }),
        };
      })
    );
    const warehouseItems = await db
      .insert(schema.warehouseItemsTable)
      .values(warehouseItemsData)
      .returning();
    console.log(`  ${warehouseItems.length} initial inventory records seeded.`);

    console.log("  Seeding historical data for the last 6 months...");
    const auditLogs = [];

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(today, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      console.log(
        `    Seeding data for ${monthStart.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}...`
      );

      const transactionsData = [];
      const saleOrdersData = [];
      const saleOrderItemsData = [];
      const numSales = faker.number.int({ min: 15, max: 50 });

      for (let j = 0; j < numSales; j++) {
        const effectiveMonthEnd = new Date(
          Math.min(monthEnd.getTime(), today.getTime())
        );
        const transactionDate = faker.date.between({
          from: monthStart,
          to: effectiveMonthEnd,
        });
        const soldProduct = faker.helpers.arrayElement(products);
        const warehouse = faker.helpers.arrayElement(warehouses);
        const warehouseItem = warehouseItems.find(
          (wi) =>
            wi.productId === soldProduct.id && wi.warehouseId === warehouse.id
        );

        if (!warehouseItem) continue;

        const quantitySold = faker.number.int({ min: 1, max: 5 });
        const totalAmount = (
          parseFloat(soldProduct.price) * quantitySold
        ).toFixed(2);

        const saleOrder = {
          businessId: business.id,
          orderNumber: `SO-${faker.string.alphanumeric(8).toUpperCase()}`,
          status: OrderStatus.CONFIRMED,
          totalAmount: totalAmount,
          orderDate: transactionDate,
          createdBy: faker.helpers.arrayElement(users).id,
          createdAt: transactionDate,
          updatedAt: faker.date.between({
            from: transactionDate,
            to: new Date(
              Math.min(effectiveMonthEnd.getTime(), today.getTime())
            ),
          }),
        };

        const createdSaleOrder = await db
          .insert(schema.saleOrdersTable)
          .values(saleOrder)
          .returning();

        saleOrderItemsData.push({
          salesOrderId: createdSaleOrder[0].id,
          productId: soldProduct.id,
          quantity: quantitySold,
          unitPrice: soldProduct.price,
          createdAt: transactionDate,
          updatedAt: transactionDate,
        });

        transactionsData.push({
          businessId: business.id,
          productId: soldProduct.id,
          warehouseId: warehouse.id,
          warehouseItemId: warehouseItem.id,
          type: TransactionType.SALE,
          quantity: -quantitySold,
          amount: totalAmount,
          transactionDate: transactionDate,
          createdBy: faker.helpers.arrayElement(users).id,
          createdAt: transactionDate,
          updatedAt: transactionDate,
        });
      }

      if (saleOrderItemsData.length > 0)
        await db.insert(schema.saleOrderItemsTable).values(saleOrderItemsData);
      if (transactionsData.length > 0)
        await db.insert(schema.transactionsTable).values(transactionsData);

      const purchaseOrdersData = [];
      const purchaseOrderItemsData = [];
      const purchaseTransactionsData = [];
      const numPurchases = faker.number.int({ min: 5, max: 15 });

      for (let k = 0; k < numPurchases; k++) {
        const effectiveMonthEnd = new Date(
          Math.min(monthEnd.getTime(), today.getTime())
        );
        const transactionDate = faker.date.between({
          from: monthStart,
          to: effectiveMonthEnd,
        });
        const purchasedProduct = faker.helpers.arrayElement(products);
        const warehouse = faker.helpers.arrayElement(warehouses);
        const warehouseItem = warehouseItems.find(
          (wi) =>
            wi.productId === purchasedProduct.id &&
            wi.warehouseId === warehouse.id
        );

        if (!warehouseItem) continue;

        const quantityPurchased = faker.number.int({ min: 10, max: 50 });
        const totalAmount = (
          parseFloat(purchasedProduct.costPrice) * quantityPurchased
        ).toFixed(2);

        const purchaseOrder = {
          businessId: business.id,
          supplierId: faker.helpers.arrayElement(suppliers).id,
          orderNumber: `PO-${faker.string.alphanumeric(8).toUpperCase()}`,
          status: OrderStatus.PROCESSING,
          totalAmount: totalAmount,
          orderDate: transactionDate,
          createdBy: faker.helpers.arrayElement(users).id,
          createdAt: transactionDate,
          updatedAt: faker.date.between({
            from: transactionDate,
            to: new Date(
              Math.min(effectiveMonthEnd.getTime(), today.getTime())
            ),
          }),
        };

        const createdPurchaseOrder = await db
          .insert(schema.purchaseOrdersTable)
          .values(purchaseOrder)
          .returning();

        purchaseOrderItemsData.push({
          purchaseOrderId: createdPurchaseOrder[0].id,
          productId: purchasedProduct.id,
          quantity: quantityPurchased,
          unitPrice: purchasedProduct.costPrice,
          createdAt: transactionDate,
          updatedAt: transactionDate,
        });

        purchaseTransactionsData.push({
          businessId: business.id,
          productId: purchasedProduct.id,
          warehouseId: warehouse.id,
          warehouseItemId: warehouseItem.id,
          type: TransactionType.PURCHASE,
          quantity: quantityPurchased,
          amount: totalAmount,
          transactionDate: transactionDate,
          createdBy: faker.helpers.arrayElement(users).id,
          createdAt: transactionDate,
          updatedAt: transactionDate,
        });
      }

      if (purchaseOrderItemsData.length > 0)
        await db
          .insert(schema.purchaseOrderItemsTable)
          .values(purchaseOrderItemsData);
      if (purchaseTransactionsData.length > 0)
        await db
          .insert(schema.transactionsTable)
          .values(purchaseTransactionsData);

      console.log(
        `      ${numSales} sales and ${numPurchases} purchases seeded.`
      );

      const allMonthTransactions = [
        ...transactionsData,
        ...purchaseTransactionsData,
      ];
      const revenue = allMonthTransactions
        .filter((t) => t.type === TransactionType.SALE)
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);
      const cost = allMonthTransactions
        .filter((t) => t.type === TransactionType.PURCHASE)
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);
      const profit = revenue - cost;

      await db.insert(schema.profitReportsTable).values({
        businessId: business.id,
        periodType: "monthly",
        periodStart: monthStart,
        periodEnd: monthEnd,
        revenue: revenue.toFixed(2),
        cost: cost.toFixed(2),
        profit: profit.toFixed(2),
        createdAt: new Date(Math.min(monthEnd.getTime(), today.getTime())),
      });

      await db.insert(schema.metricsTable).values([
        {
          businessId: business.id,
          name: "revenue",
          period: monthStart,
          value: revenue.toFixed(2),
          createdAt: new Date(Math.min(monthEnd.getTime(), today.getTime())),
        },
        {
          businessId: business.id,
          name: "profit",
          period: monthStart,
          value: profit.toFixed(2),
          createdAt: new Date(Math.min(monthEnd.getTime(), today.getTime())),
        },
        {
          businessId: business.id,
          name: "sales_count",
          period: monthStart,
          value: numSales.toString(),
          createdAt: new Date(Math.min(monthEnd.getTime(), today.getTime())),
        },
      ]);
      console.log("      Monthly profit report and metrics seeded.");

      for (let l = 0; l < faker.number.int({ min: 3, max: 8 }); l++) {
        const effectiveMonthEnd = new Date(
          Math.min(monthEnd.getTime(), today.getTime())
        );
        const auditDate = faker.date.between({
          from: monthStart,
          to: effectiveMonthEnd,
        });
        auditLogs.push({
          model: "product",
          recordId: faker.helpers.arrayElement(products).id,
          action: faker.helpers.arrayElement(["create", "update", "delete"]),
          businessId: business.id,
          changes: {
            price: faker.commerce.price(),
            quantity: faker.number.int({ min: 1, max: 100 }).toString(),
          },
          performedBy: faker.helpers.arrayElement(users).id,
          performedAt: auditDate,
          createdAt: auditDate,
          updatedAt: auditDate,
        });
      }
    }

    if (auditLogs.length > 0)
      await db.insert(schema.auditLogsTable).values(auditLogs);
    console.log(`  ${auditLogs.length} audit logs seeded.`);
  }

  console.log("Database seeded successfully!");
  await db.$client.end();
};

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
