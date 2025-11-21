# **DBMS Cheatsheet — Business / Sales Edition**

# 1. **Schema Assumed (Business Example)**

Think of a typical e-commerce or retail company:

### **Product(product_id, name, category, price, cost, extra JSON)**

### **Customer(customer_id, full_name, email, city, joined_at)**

### **Orders(order_id, customer_id, order_date, status, total_amount)**

### **OrderItem(order_id, product_id, quantity, unit_price)**

### **Supplier(supplier_id, supplier_name, contact_email)**

### **Inventory(product_id, in_stock, supplier_id)**

---

# 2. **Basic selects & filtering**

## 1) All products sorted A→Z

```sql
SELECT name, category, price
FROM Product
ORDER BY name;
```

## 2) Customers who haven’t bought anything yet

```sql
SELECT c.*
FROM Customer c
LEFT JOIN Orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;
```

## 3) High-value orders (>$1000)

```sql
SELECT *
FROM Orders
WHERE total_amount > 1000;
```

## 4) Products from specific suppliers

```sql
SELECT p.*
FROM Product p
WHERE p.product_id IN (
  SELECT product_id
  FROM Inventory
  WHERE supplier_id IN (2, 5)
);
```

---

# 3. **Aggregation & Grouping (Business Analytics)**

## 1) Unique product categories

```sql
SELECT DISTINCT category FROM Product;
```

## 2) Total revenue for a specific customer

```sql
SELECT customer_id, SUM(total_amount) AS total_revenue
FROM Orders
WHERE customer_id = 42
GROUP BY customer_id;
```

## 3) Number of products per supplier

```sql
SELECT s.supplier_name, COUNT(i.product_id) AS product_count
FROM Supplier s
LEFT JOIN Inventory i USING (supplier_id)
GROUP BY s.supplier_name
ORDER BY product_count DESC;
```

## 4) Min & max product prices

```sql
SELECT MIN(price) AS cheapest, MAX(price) AS most_expensive
FROM Product;
```

## 5) Categories with more than 10 products

```sql
SELECT category, COUNT(*) AS num_products
FROM Product
GROUP BY category
HAVING COUNT(*) > 10;
```

---

# 4. **Joins & Business Use Cases**

## 1) Orders with customer names

```sql
SELECT o.order_id, o.order_date, c.full_name, o.total_amount
FROM Orders o
JOIN Customer c ON o.customer_id = c.customer_id;
```

## 2) Inventory details with supplier names

```sql
SELECT p.name, i.in_stock, s.supplier_name
FROM Product p
JOIN Inventory i USING (product_id)
JOIN Supplier s USING (supplier_id);
```

## 3) Products that have never sold (anti-join)

```sql
SELECT p.*
FROM Product p
LEFT JOIN OrderItem oi ON p.product_id = oi.product_id
WHERE oi.order_id IS NULL;
```

---

# 5. **Window Functions — Business Analytics POWER**

## 1) Rank customers by total spending

```sql
SELECT
  customer_id,
  full_name,
  SUM(total_amount) AS total_spent,
  RANK() OVER (ORDER BY SUM(total_amount) DESC) AS spending_rank
FROM Customer c
JOIN Orders o USING (customer_id)
GROUP BY customer_id, full_name;
```

## 2) Running total of sales (lifetime)

```sql
SELECT
  order_id,
  order_date,
  total_amount,
  SUM(total_amount) OVER (ORDER BY order_date) AS running_revenue
FROM Orders;
```

## 3) Top 3 products per category

```sql
WITH ranked AS (
  SELECT
    p.*,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn
  FROM Product p
)
SELECT *
FROM ranked
WHERE rn <= 3;
```

---

# 6. **CTEs & Recursive Queries**

## 1) CTE — Average product price per category

```sql
WITH avg_price AS (
  SELECT category, AVG(price) AS avg_category_price
  FROM Product
  GROUP BY category
)
SELECT p.name, p.price, a.avg_category_price
FROM Product p
JOIN avg_price a USING (category);
```

## 2) Recursive CTE — Supplier hierarchy

(If suppliers have parent companies)

```sql
WITH RECURSIVE supplier_tree AS (
  SELECT supplier_id, supplier_name, parent_supplier_id, 1 AS level
  FROM Supplier
  WHERE parent_supplier_id IS NULL

  UNION ALL

  SELECT s.supplier_id, s.supplier_name, s.parent_supplier_id, level + 1
  FROM Supplier s
  JOIN supplier_tree st ON s.parent_supplier_id = st.supplier_id
)
SELECT * FROM supplier_tree ORDER BY level;
```

---

# 7. **Subqueries**

## 1) Products priced above average price

```sql
SELECT *
FROM Product
WHERE price > (SELECT AVG(price) FROM Product);
```

## 2) Orders from the top-spending customer

```sql
SELECT *
FROM Orders
WHERE customer_id = (
  SELECT customer_id
  FROM Orders
  GROUP BY customer_id
  ORDER BY SUM(total_amount) DESC
  LIMIT 1
);
```

---

# 8. **DML — Insert / Update / Delete**

## 1) Insert new customer

```sql
INSERT INTO Customer (full_name, email, city)
VALUES ('Alex Jordan', 'alex@xyz.com', 'Chicago');
```

## 2) Update product stock

```sql
UPDATE Inventory
SET in_stock = in_stock - 10
WHERE product_id = 15;
```

## 3) Upsert product

```sql
INSERT INTO Product (product_id, name, price)
VALUES (10, 'Headphones X', 129.99)
ON CONFLICT (product_id)
DO UPDATE SET price = EXCLUDED.price;
```

---

# 9. **Lateral Joins / Cross Apply**

Get the latest order for each customer:

```sql
SELECT c.full_name, o.*
FROM Customer c
LEFT JOIN LATERAL (
  SELECT *
  FROM Orders
  WHERE customer_id = c.customer_id
  ORDER BY order_date DESC
  LIMIT 1
) o ON true;
```

---

# 10. **JSON Data in Business**

Suppose `Product.extra` stores:

```json
{ "color": "Black", "warranty": "12 months" }
```

### Query JSON:

```sql
SELECT
  product_id,
  extra->>'color' AS color
FROM Product
WHERE extra->>'warranty' = '12 months';
```

---

# 11. **Full-Text Search (e.g., for product search)**

```sql
SELECT product_id, name
FROM Product
WHERE to_tsvector('english', name || ' ' || category)
      @@ plainto_tsquery('wireless headphones');
```

---

# 12. Performance & Indexing

### Example: Optimize heavy order lookup

```sql
CREATE INDEX idx_orders_customer ON Orders(customer_id);
```

### Explain query

```sql
EXPLAIN ANALYZE
SELECT *
FROM Orders
WHERE customer_id = 42;
```

---

# 13. Transactions (Business Use Case)

```sql
BEGIN;

UPDATE Inventory
SET in_stock = in_stock - 5
WHERE product_id = 50;

INSERT INTO Orders (customer_id, order_date, status, total_amount)
VALUES (12, now(), 'Paid', 250);

COMMIT;
```

---

# 14. Security Best Practices (business-focused)

- Don’t let application users DROP/ALTER tables.
- Don’t store plaintext card numbers (duh).
- Index high-volume foreign keys (product_id, customer_id, order_id).
- Use parameterized queries ALWAYS.

---

# 15. **Real-World Business Queries**

## 1) “Best cities” — cities with highest total revenue

```sql
SELECT c.city, SUM(o.total_amount) AS revenue
FROM Customer c
JOIN Orders o USING (customer_id)
GROUP BY c.city
ORDER BY revenue DESC;
```

## 2) Top 5 most-selling products

```sql
SELECT p.name, SUM(oi.quantity) AS units_sold
FROM Product p
JOIN OrderItem oi USING (product_id)
GROUP BY p.product_id, p.name
ORDER BY units_sold DESC
LIMIT 5;
```

## 3) Average order value (AOV) for Q1

```sql
SELECT AVG(total_amount) AS aov
FROM Orders
WHERE order_date BETWEEN '2025-01-01' AND '2025-03-31';
```

---

# 16. 🛠 Extra Utilities

### Check if a product exists

```sql
SELECT EXISTS (SELECT 1 FROM Product WHERE product_id = 400);
```

### Remove duplicate customers by email

```sql
DELETE FROM Customer c
USING (
  SELECT email, MIN(customer_id) AS keep_id
  FROM Customer
  GROUP BY email
  HAVING COUNT(*) > 1
) dup
WHERE c.email = dup.email
  AND c.customer_id <> dup.keep_id;
```
