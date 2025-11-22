#!/bin/bash

# Analytics Test Runner
# Runs all analytics test scripts and displays clean output

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
echo -e "${BLUE}║           Analytics Test Suite Runner                       ║${NC}"
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

# Test 1: Accounting Formulas
if run_test "src/__tests__/analytics/test-accounting-formulas.ts" "Accounting Formulas"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Test 2: Metrics Workflow
if run_test "src/__tests__/analytics/test-metrics-workflow.ts" "Metrics Workflow"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Test 3: DB Functional Helpers
if run_test "src/__tests__/analytics/test-db-functional-helpers.ts" "DB Functional Helpers"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Test 4: Time Date Formatters
if run_test "src/__tests__/analytics/test-time-date-formatters.ts" "Time Date Formatters"; then
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
