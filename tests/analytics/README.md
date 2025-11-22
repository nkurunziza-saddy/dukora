# Analytics Test Scripts

This directory contains executable test scripts for testing analytics workflows using actual code instead of vitest.

## Quick Start

Run all tests at once:

```bash
./src/__tests__/analytics/run.sh
```

Or run individual test files:

```bash
npx tsx src/__tests__/analytics/test-accounting-formulas.ts
npx tsx src/__tests__/analytics/test-metrics-workflow.ts
npx tsx src/__tests__/analytics/test-db-functional-helpers.ts
npx tsx src/__tests__/analytics/test-time-date-formatters.ts
```

## Available Test Scripts

### 1. Accounting Formulas Test (`test-accounting-formulas.ts`)

Tests the core accounting formula functions with comprehensive test coverage.

**Tests:** 49 tests

- `calculateCOGS` - Cost of Goods Sold calculation
- `calculateClosingStock` - Closing stock valuation
- `calculateAllMetrics` - Comprehensive financial metrics calculation

---

### 2. Metrics Workflow Test (`test-metrics-workflow.ts`)

Demonstrates the complete metrics calculation workflow end-to-end.

**Features:**

- Step-by-step workflow visualization
- Realistic mock data
- Detailed metric breakdowns
- Data quality reporting

---

### 3. DB Functional Helpers Test (`test-db-functional-helpers.ts`)

Tests database functional helpers for syncing metrics.

**Tests:** 6 tests

- Input validation
- Metrics syncing with actual database
- Invalid value handling
- Type conversion

**Note:** Some tests may show database errors in output but still pass - this is expected when testing error handling.

---

### 4. Time Date Formatters Test (`test-time-date-formatters.ts`)

Tests time/date formatter utility functions.

**Tests:** 20 tests

- `getMonthData` - Month data retrieval
- `getCurrentMonthBoundary` - Boundary calculations
- `parseMonth` - Month parsing
- `parseMonthYearShort` - Short format parsing
- `getPreviousMonth` - Previous month calculations
- Integration tests

**Note:** Database-dependent tests (like `getAvailableMonthsForAnalytics`) are skipped as they require authentication context.

---

## Test Runner Script (`run.sh`)

The `run.sh` script runs all test files sequentially and provides a clean summary.

**Features:**

- Color-coded output
- Individual test suite results
- Overall summary
- Exit code 0 on success, 1 on failure

**Usage:**

```bash
chmod +x src/__tests__/analytics/run.sh  # Make executable (first time only)
./src/__tests__/analytics/run.sh
```

---

## Understanding the Output

### Test Output Format

```
✓ Test Name - Test passed
✗ Test Name - Test failed
  Expected: <expected value>
  Actual:   <actual value>
```

### Summary Format

```
Test Summary:
  Passed: X
  Failed: Y
  Total:  Z
```

---

## Advantages Over Vitest

1. **No Mocking**: Uses actual code functions
2. **Easy to Run**: Simple `npx tsx` command
3. **Clear Output**: Color-coded, easy-to-read results
4. **Easy to Modify**: Plain TypeScript, no test framework syntax
5. **Workflow Visualization**: See the complete process flow
6. **Portable**: Can be run anywhere Node.js is installed
7. **No Dependencies**: No vitest or testing framework required

---

## Adding New Tests

To add new test cases:

1. **For existing test files**: Edit the respective `.ts` file
   - Add new test functions following the pattern
   - Call them in `runAllTests()`

2. **For new test files**: Create a new `test-*.ts` file
   - Copy the structure from existing tests
   - Add to `run.sh` script
