import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  json,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { productsTable } from "./products";
import { warehousesTable } from "./warehouses";

export const storeProductsTable = pgTable(
  "store_products",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    productId: text("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),

    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),

    storePrice: numeric("store_price", { precision: 10, scale: 2 }),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }), // For showing discounts

    storeTitle: text("store_title"), // Goes back to product.name
    storeDescription: text("store_description"), // Falls back to product.description
    shortDescription: text("short_description"),
    images: json("images").$type<string[]>(),
    slug: text("slug"),

    tags: json("tags").$type<string[]>(),
    featured: boolean("featured").notNull().default(false),
    featuredOrder: integer("featured_order"),

    stockDisplay: text("stock_display").notNull().default("SHOW_QUANTITY"), // 'SHOW_QUANTITY' | 'IN_STOCK_OUT_STOCK' | 'HIDE'
    cachedStock: integer("cached_stock").notNull().default(0),

    viewCount: integer("view_count").notNull().default(0),
    soldCount: integer("sold_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("store_products_business_id_product_id").on(
      table.businessId,
      table.productId,
    ),
    uniqueIndex("store_products_business_id_slug").on(
      table.businessId,
      table.slug,
    ),
    index("store_products_business_id").on(table.businessId),
    index("store_products_product_id").on(table.productId),
    index("store_products_is_published").on(table.isPublished),
    index("store_products_featured").on(table.featured),
    check(
      "store_price_positive",
      sql`${table.storePrice} IS NULL OR ${table.storePrice} >= 0`,
    ),
    check(
      "compare_at_price_positive",
      sql`${table.compareAtPrice} IS NULL OR ${table.compareAtPrice} >= 0`,
    ),
  ],
);

// Store Settings Table - Simple store configuration
export const storeSettingsTable = pgTable(
  "store_settings",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    businessId: text("business_id")
      .notNull()
      .unique()
      .references(() => businessesTable.id, { onDelete: "cascade" }),

    isStoreEnabled: boolean("is_store_enabled").notNull().default(false),

    storeName: text("store_name"),
    storeDescription: text("store_description"),
    storeLogo: text("store_logo"),

    defaultWarehouseId: text("default_warehouse_id").references(
      () => warehousesTable.id,
      { onDelete: "set null" },
    ),

    autoPublishNewProducts: boolean("auto_publish_new_products")
      .notNull()
      .default(false),
    requireInventory: boolean("require_inventory").notNull().default(true),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(10),

    syncMode: text("sync_mode").notNull().default("AUTO"), // 'AUTO' | 'MANUAL'

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("store_settings_business_id").on(table.businessId)],
);

// Store Metrics Table - Basic performance tracking
export const storeMetricsTable = pgTable(
  "store_metrics",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    storeProductId: text("store_product_id"), // null = store-level metrics
    metricDate: timestamp("metric_date", { withTimezone: true }).notNull(),

    views: integer("views").notNull().default(0),
    addedToCart: integer("added_to_cart").notNull().default(0),

    orders: integer("orders").notNull().default(0),
    revenue: numeric("revenue", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("store_metrics_business_id").on(table.businessId),
    index("store_metrics_store_product_id").on(table.storeProductId),
    index("store_metrics_metric_date").on(table.metricDate),
    uniqueIndex("store_metrics_business_product_date").on(
      table.businessId,
      table.storeProductId,
      table.metricDate,
    ),
    check("views_non_negative", sql`${table.views} >= 0`),
    check("orders_non_negative", sql`${table.orders} >= 0`),
    check("revenue_non_negative", sql`${table.revenue} >= 0`),
  ],
);
