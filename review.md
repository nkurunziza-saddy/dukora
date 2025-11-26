# Business Logic Implementation Plan - Priority Fixes

## Phase 1: Quick Wins (Implement Now) ✅

### 1.1 Add Safe Math Helpers

- [ ] Create `math-helpers.ts` with safe division and currency rounding
- [ ] Replace all manual rounding with centralized helpers

### 1.2 Remove Unused COGS Formula

- [ ] Remove `calculateCOGS` function (line 298 in accounting-formulas.ts)
- [ ] Add comment explaining transaction-based approach

### 1.3 Add Data Validation

- [ ] Create validation helper for order calculations
- [ ] Add to order calculation pipeline

---

## Phase 2: Critical Fixes (This Week) 🔴

### 2.1 Fix Tax-Inclusive Order Display

**Issue**: Subtotal includes tax but UI might double-display it
**Files**: `calculate-order-totals.ts`, order components

- [ ] Return both `netSubtotal` and `grossSubtotal`
- [ ] Add `pricesIncludeTax` flag to response
- [ ] Update UI components to display correctly

### 2.2 Improve Floating Point Precision

**Files**: All calculation files

- [ ] Implement integer arithmetic for currency (store in cents)
- [ ] Add conversion helpers `toCents()` and `fromCents()`
- [ ] Update order calculations to use integer math

---

## Phase 3: High Priority (Next Week) 🟡

### 3.1 Add Percentage Discounts

**Files**: `calculate-order-totals.ts`, order schema

- [ ] Create `DiscountType` enum
- [ ] Update discount calculation logic
- [ ] Add validation for discount values

### 3.2 Add Tax Exemptions Framework

**Files**: `calculate-tax.ts`, settings

- [ ] Create `TaxRule` interface
- [ ] Support per-category tax rates
- [ ] Add customer exemption logic

---

## Implementation Order

1. **Quick Wins** (30 min) - Math helpers, cleanup
2. **Tax Display Fix** (1 hour) - Critical for invoices
3. **Precision Fix** (2 hours) - Prevents accounting errors
4. **Percentage Discounts** (1 hour) - High business value
5. **Tax Framework** (2 hours) - Scalability

**Total Estimated Time**: ~6.5 hours

---

## Files to Modify

### Core Business Logic

- `src/server/helpers/math-helpers.ts` (NEW)
- `src/server/helpers/accounting-formulas.ts`
- `src/server/business-logic/orders/calculate-order-totals.ts`
- `src/server/business-logic/taxes/calculate-tax.ts`

### Actions (Update return types)

- `src/server/actions/shopper/orders-actions.ts`

### UI Components (Display fixes)

- Checkout forms
- Order detail pages
- Invoice components
