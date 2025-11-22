#!/bin/bash

# Business Logic Test Runner
# Runs all business logic test scripts

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Business Logic Test Suite Runner                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to run a test file
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "${CYAN}━━━ Running: ${test_name} ━━━${NC}"
    
    # Run the test and capture output
    if npx tsx "$test_file" 2>&1; then
        echo -e "${GREEN}✓ ${test_name} completed${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ ${test_name} failed${NC}"
        echo ""
        return 1
    fi
}

# Run all test files
echo -e "${YELLOW}Starting test execution...${NC}"
echo ""

# Transaction Tests
if run_test "src/__tests__/business-logic/transactions/test-validate-transaction.ts" "Transaction Validation"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

if run_test "src/__tests__/business-logic/transactions/test-calculate-stock-change.ts" "Stock Change Calculation"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Order Tests  
if run_test "src/__tests__/business-logic/orders/test-calculate-order-totals.ts" "Order Calculation"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

if run_test "src/__tests__/business-logic/orders/test-validate-order.ts" "Order Validation"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Permission Tests
if run_test "src/__tests__/business-logic/permissions/test-role-permissions.ts" "Role Permissions"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Print summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Overall Test Summary:${NC}"
echo -e "  ${GREEN}Passed Test Suites: ${PASSED_TESTS}/${TOTAL_TESTS}${NC}"
echo -e "  ${RED}Failed Test Suites: ${FAILED_TESTS}/${TOTAL_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All test suites passed!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some test suites failed!${NC}"
    echo ""
    exit 1
fi
