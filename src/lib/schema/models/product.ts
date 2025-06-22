import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  uniqueIndex,
  index,
  check,
  boolean,
  AnyPgColumn,
  primaryKey,
} from "drizzle-orm/pg-core";
import { businessTable } from "./business";
import { sql } from "drizzle-orm";
import { productStatusEnum } from "./enums";

export const productTable = pgTable(
  "products",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    sku: text("sku").notNull(),
    barcode: text("barcode"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    costPrice: numeric("cost_price", { precision: 10, scale: 2 }).notNull(),
    categoryId: text("category_id").references(() => categoryTable.id),
    businessId: text("business_id")
      .notNull()
      .references(() => businessTable.id, { onDelete: "cascade" }),
    status: productStatusEnum("status").notNull().default("ACTIVE"),
    reorderPoint: integer("reorder_point").notNull().default(10),
    maxStock: integer("max_stock").notNull().default(1000),
    unit: text("unit").notNull().default("pcs"),
    weight: numeric("weight", { precision: 8, scale: 3 }),
    length: numeric("length", { precision: 8, scale: 3 }),
    width: numeric("width", { precision: 8, scale: 3 }),
    height: numeric("height", { precision: 8, scale: 3 }),
    imageUrl: text("image_url"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("products_business_id_sku").on(table.businessId, table.sku),
    uniqueIndex("products_business_id_barcode").on(
      table.businessId,
      table.barcode
    ),

    check("price_positive", sql`${table.price} >= 0`),
    check("cost_price_positive", sql`${table.costPrice} >= 0`),
    check("reorder_point_positive", sql`${table.reorderPoint} >= 0`),
    check("max_stock_positive", sql`${table.maxStock} > 0`),
    check(
      "weight_positive",
      sql`${table.weight} IS NULL OR ${table.weight} >= 0`
    ),

    index("products_business_id").on(table.businessId),
    index("products_category_id").on(table.categoryId),
    index("products_sku").on(table.sku),
    index("products_status").on(table.status),
  ]
);

export const categoryTable = pgTable(
  "categories",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    businessId: text("business_id")
      .notNull()
      .references(() => businessTable.id, { onDelete: "cascade" }),
    parentId: text("parent_id").references((): AnyPgColumn => categoryTable.id),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("no_self_reference", sql`${table.id} != ${table.parentId}`),
    index("categories_business_id").on(table.businessId),
    index("categories_parent_id").on(table.parentId),
  ]
);

export const productAttributeTable = pgTable(
  "product_attributes",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(), // e.g "Color", "Size"
    businessId: text("business_id")
      .notNull()
      .references(() => businessTable.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("product_attributes_business_id_name").on(
      table.businessId,
      table.name
    ),
  ]
);

export const productAttributeValueTable = pgTable(
  "product_attribute_values",
  {
    id: text("id").primaryKey().notNull(),
    attributeId: text("attribute_id")
      .notNull()
      .references(() => productAttributeTable.id, { onDelete: "cascade" }),
    value: text("value").notNull(), // e.g "Red", "Large"
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("product_attribute_values_attribute_id_value").on(
      table.attributeId,
      table.value
    ),
  ]
);

export const productTagTable = pgTable(
  "product_tags",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("product_tags_business_id_name").on(
      table.businessId,
      table.name
    ),
  ]
);

export const productProductTagTable = pgTable(
  "product_product_tags",
  {
    productId: text("product_id")
      .notNull()
      .references(() => productTable.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => productTagTable.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.productId, table.tagId] })]
);

export const productVariantTable = pgTable(
  "product_variants",
  {
    id: text("id").primaryKey().notNull(),
    productId: text("product_id")
      .notNull()
      .references(() => productTable.id, { onDelete: "cascade" }),
    attributeValueId: text("attribute_value_id")
      .notNull()
      .references(() => productAttributeValueTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("product_variants_product_id_attribute_value_id").on(
      table.productId,
      table.attributeValueId
    ),
  ]
);
