# Inventory and Metric Calculation Strategy

It's great that you're thinking through these accounting and inventory logic details. They are crucial for the metrics to be accurate and useful. Let's break it down step-by-step, based on your data models.

You've hit on the two fundamental approaches to inventory management: periodic snapshots and perpetual tracking. The best systems use a combination of both.

### The Core Problem: Establishing a Baseline

You are absolutely right: for the very first month, you have no "previous closing stock" to use as "opening stock." You cannot calculate what you don't know.

**Answer:** You must establish a baseline with a **one-time physical stock-take**.

This is the "snapshot" you mentioned. Before you can start calculating metrics, you need to know exactly what you have *right now*.

---

### Step-by-Step Guide to a Robust System

Here is a complete, step-by-step process from initial setup to ongoing calculations.

#### **Step 1: The Initial Stock-Take (Your "Snapshot")**

This is a manual, one-time process to begin.

1.  **Action:** Physically count every single product item in every warehouse.
2.  **Data Entry:** For each product in a specific warehouse, you will create or update a record in your `warehouseItemsTable`.
    *   `productId`: The ID of the product.
    *   `warehouseId`: The ID of the warehouse it's in.
    *   `quantity`: The physical quantity you just counted.
    *   `lastUpdated`: Set to the current timestamp.

This process populates your `warehouseItemsTable` with a true, accurate count of your entire inventory. This is your foundation.

#### **Step 2: Calculate and Record the First "Closing Stock"**

Immediately after the stock-take is complete, you run a calculation.

1.  **Action:** Calculate the total value of your current inventory. This is your **Closing Stock** for the current month.
2.  **Calculation Logic:**
    *   For every record in `warehouseItemsTable`, get the `quantity`.
    *   Find the corresponding product in `productsTable` using `productId`.
    *   Get that product's `costPrice` (this is crucial: always use the cost price for inventory valuation, not the selling price).
    *   The value of that item is `warehouseItems.quantity * products.costPrice`.
    *   Sum these values across all items in all warehouses.
3.  **Record the Metric:**
    *   Create a new record in your `metricsTable`.
    *   `businessId`: The relevant business ID.
    *   `name`: `METRIC_NAMES.CLOSING_STOCK` (i.e., "closingStock").
    *   `periodType`: "monthly".
    *   `period`: A timestamp representing the current month (e.g., `2025-07-01 00:00:00`).
    *   `value`: The total stock value you just calculated.

**Result:** You have now officially snapshotted and recorded the value of your inventory for the end of the current month.

#### **Step 3: Perpetual Inventory Tracking with Transactions**

From this moment forward, **every single movement of stock must be recorded** in your `transactionsTable`. This is how you keep your `warehouseItems.quantity` accurate without needing to do a physical count every day.

*   **When a Purchase comes in:**
    *   You create a `PURCHASE` transaction in `transactionsTable`.
    *   You **increase** the `quantity` in the corresponding `warehouseItemsTable` record.
*   **When a Sale is made:**
    *   You create a `SALE` transaction in `transactionsTable`.
    *   You **decrease** the `quantity` in the corresponding `warehouseItemsTable` record.
*   **When an item is Damaged:**
    *   You create a `DAMAGE` transaction.
    *   You **decrease** the `quantity` in `warehouseItemsTable`.
*   **When a customer Returns an item:**
    *   You create a `RETURN_SALE` transaction.
    *   You **increase** the `quantity` in `warehouseItemsTable`.

Your `transactionsTable` provides the *history* of all movements, while your `warehouseItemsTable` provides the *current state*.

#### **Step 4: End-of-Month Automated Metric Calculations**

Now, at the end of every subsequent month (e.g., at midnight on August 31st), you can run a scheduled job to calculate all your key metrics for August.

1.  **Opening Stock (for August):**
    *   Query the `metricsTable` to find the `CLOSING_STOCK` value from the *previous* month (July). This value is August's `OPENING_STOCK`. Record it.

2.  **Purchases (for August):**
    *   Sum the value of all `PURCHASE` transactions that occurred in August.
    *   **Logic:** `SUM(transactions.quantity * products.costPrice)` where `type` is `PURCHASE` and `createdAt` is within August. Record this metric.

3.  **Cost of Goods Sold (COGS) (for August):**
    *   Sum the value of all `SALE` transactions that occurred in August.
    *   **Logic:** `SUM(transactions.quantity * products.costPrice)` where `type` is `SALE` and `createdAt` is within August. Record this metric.

4.  **Closing Stock (for August):**
    *   This is a snapshot calculation, just like in Step 2.
    *   **Logic:** `SUM(warehouseItems.quantity * products.costPrice)` at the exact moment the job runs. This reflects the *current* state of your inventory value. Record it.

### Summary and Answers to Your Questions

*   **"do i snapshot the value of the stock rn and make it closing stock value?"**
    *   **Yes, exactly.** You do this *once* at the very beginning to set your baseline. Then, at the end of every subsequent month, you do it again to get the closing value for that month.

*   **"or calculate entries-outgoings+returns with transactions model?"**
    *   **Yes, you do this too.** This is how you maintain an accurate `quantity` in your `warehouseItemsTable` throughout the month. The transactions are the *reason* your snapshot at the end of the month is accurate.

*   **"for the starting month i should ignore opening stock"**
    *   **Correct.** For your very first month of operation, the "Opening Stock" is effectively zero because you weren't tracking it before. Your first important calculation is the *Closing Stock* of that first month, which then becomes the *Opening Stock* for the second month. Your idea to start percentage comparisons after the first full month is the right approach.

This hybrid model gives you the best of both worlds: a continuously updated inventory count via transactions and a reliable, periodic valuation via end-of-month snapshots.
