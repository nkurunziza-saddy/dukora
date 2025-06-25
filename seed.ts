import { db } from "./src/lib/db";
import * as schema from "@/lib/schema/models";

async function seed() {
  // 1. Create a business
  const [business] = await db
    .insert(schema.businessesTable)
    .values({
      id: "biz1",
      name: "Acme Corp",
      domain: "acme.com",
      registrationNumber: "ACME-123",
      isActive: true,
    })
    .returning();

  // 2. Create business settings
  await db.insert(schema.businessSettingsTable).values({
    id: "bizset1",
    businessId: business.id,
    key: "currency",
    value: "USD",
    description: "Default currency",
  });

  const [user] = await db
    .insert(schema.usersTable)
    .values({
      id: "user1",
      businessId: business.id,
      email: "owner@acme.com",
      name: "Owner",
      role: "ADMIN",
      isActive: true,
    })
    .returning();

  // 4. Create business user settings
  await db.insert(schema.userSettingsTable).values({
    id: "buset1",
    businessUserId: user.id,
    key: "theme",
    value: "dark",
  });

  // 5. Create a category
  const [category] = await db
    .insert(schema.categoriesTable)
    .values({
      id: "cat1",
      businessId: business.id,
      name: "Default Category",
      isActive: true,
    })
    .returning();

  // 6. Create a product attribute and value
  const [attribute] = await db
    .insert(schema.productAttributesTable)
    .values({
      id: "attr1",
      businessId: business.id,
      name: "Color",
      isActive: true,
    })
    .returning();
  const [attributeValue] = await db
    .insert(schema.productAttributeValuesTable)
    .values({
      id: "attrval1",
      attributeId: attribute.id,
      value: "Red",
    })
    .returning();

  // 7. Create a product
  const [product] = await db
    .insert(schema.productsTable)
    .values({
      id: "prod1",
      businessId: business.id,
      categoryId: category.id,
      name: "Sample Product",
      sku: "SKU001",
      price: "10.00",
      costPrice: "5.00",
      status: "ACTIVE",
      reorderPoint: 10,
      maxStock: 1000,
      unit: "pcs",
    })
    .returning();

  // 8. Create a product tag and link to product
  const [tag] = await db
    .insert(schema.productTagsTable)
    .values({
      id: "tag1",
      businessId: business.id,
      name: "Featured",
    })
    .returning();
  await db.insert(schema.productProductTagsTable).values({
    productId: product.id,
    tagId: tag.id,
  });

  // 9. Create a product variant
  await db.insert(schema.productVariantsTable).values({
    id: "var1",
    productId: product.id,
    attributeValueId: attributeValue.id,
  });

  // 10. Create a warehouse
  const [warehouse] = await db
    .insert(schema.warehousesTable)
    .values({
      id: "wh1",
      businessId: business.id,
      name: "Main Warehouse",
      code: "MAIN",
      address: "123 Main St",
      isActive: true,
      isDefault: true,
    })
    .returning();

  // 11. Create a warehouse item
  await db.insert(schema.warehouseItemsTable).values({
    id: "whitem1",
    productId: product.id,
    warehouseId: warehouse.id,
    quantity: 100,
    reservedQty: 0,
  });

  // 12. Create a supplier
  const [supplier] = await db
    .insert(schema.suppliersTable)
    .values({
      id: "sup1",
      businessId: business.id,
      name: "Default Supplier",
      email: "supplier@acme.com",
      phone: "555-1234",
    })
    .returning();

  // 13. Link product and supplier
  await db.insert(schema.productSuppliersTable).values({
    productId: product.id,
    supplierId: supplier.id,
    businessId: business.id,
    isPreferred: true,
  });

  // 14. Create a sales order and item
  const [salesOrder] = await db
    .insert(schema.saleOrdersTable)
    .values({
      id: "so1",
      businessId: business.id,
      orderNumber: "SO-001",
      status: "DRAFT",
      totalAmount: "100.00",
      discountAmount: "0.00",
      taxAmount: "0.00",
      createdBy: user.id,
    })
    .returning();
  await db.insert(schema.saleOrderItemsTable).values({
    id: "soitem1",
    salesOrderId: salesOrder.id,
    productId: product.id,
    quantity: 2,
    unitPrice: "10.00",
    discount: "0.00",
  });

  // 15. Create a purchase order and item
  const [purchaseOrder] = await db
    .insert(schema.purchaseOrdersTable)
    .values({
      id: "po1",
      businessId: business.id,
      orderNumber: "PO-001",
      status: "DRAFT",
      totalAmount: "50.00",
      discountAmount: "0.00",
      taxAmount: "0.00",
      supplierId: supplier.id,
      createdBy: user.id,
    })
    .returning();
  await db.insert(schema.purchaseOrderItemsTable).values({
    id: "poitem1",
    purchaseOrderId: purchaseOrder.id,
    productId: product.id,
    quantity: 5,
    unitPrice: "10.00",
    discount: "0.00",
  });

  // 16. Create a profit report
  await db.insert(schema.profitReportsTable).values({
    id: "pr1",
    businessId: business.id,
    periodType: "MONTHLY",
    periodStart: new Date("2025-06-01"),
    periodEnd: new Date("2025-06-30"),
    revenue: "1000.00",
    cost: "500.00",
    profit: "500.00",
  });

  // 17. Create a metric
  await db.insert(schema.metricsTable).values({
    id: "metric1",
    businessId: business.id,
    name: "Total Sales",
    periodType: "MONTHLY",
    periodStart: new Date("2025-06-01"),
    value: "1000.00",
  });

  // 18. Create an audit log
  await db.insert(schema.auditLogsTable).values({
    id: "audit1",
    model: "business",
    recordId: business.id,
    action: "CREATE",
    businessId: business.id,
    changes: { name: "Acme Corp" },
    performedBy: user.id,
    performedAt: new Date(),
  });

  // 19. Create a transaction
  await db.insert(schema.transactionsTable).values({
    id: "txn1",
    productId: product.id,
    warehouseId: warehouse.id,
    warehouseItemId: "whitem1",
    type: "SALE",
    quantity: 2,
    businessId: business.id,
    createdBy: user.id,
    createdAt: new Date(),
  });

  // 20. Create a product price history
  await db.insert(schema.productPriceHistoryTable).values({
    id: "pph1",
    productId: product.id,
    price: "10.00",
    costPrice: "5.00",
    effectiveFrom: new Date("2025-06-01"),
    createdBy: user.id,
    createdAt: new Date(),
  });

  console.log("Seed complete!");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
