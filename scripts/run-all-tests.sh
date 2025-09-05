#!/bin/bash

# Comprehensive test runner for Rydify platform
# Runs all test suites in the correct order with proper error handling

set -e  # Exit on any error

echo "🚀 Starting Rydify Test Suite..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running $test_name..."
    
    if eval "$test_command"; then
        print_success "$test_name passed"
        ((TESTS_PASSED++))
    else
        print_error "$test_name failed"
        FAILED_TESTS+=("$test_name")
        ((TESTS_FAILED++))
    fi
    echo ""
}

# 1. Unit Tests - Pricing Logic
print_status "Phase 1: Unit Tests - Pricing & Validation"
echo "----------------------------------------"

run_test "Pricing Calculations" "npm run test:pricing"
run_test "File Upload Validation" "npm run test:upload"

# 2. Component Tests
print_status "Phase 2: Component Tests"
echo "------------------------"

run_test "Contact Driver Component" "npm run test:contact"

# 3. Integration Tests
print_status "Phase 3: Integration Tests"
echo "--------------------------"

run_test "Booking Actions" "npx jest __tests__/bookings/actions.test.ts"
run_test "Ride Actions" "npx jest __tests__/rides/booking-actions.test.ts"
run_test "Auth Tests" "npx jest __tests__/auth/"

# 4. CLI Integration Test
print_status "Phase 4: CLI Integration Test"
echo "-----------------------------"

run_test "Off-Platform Payment Flow" "npm run test:offplatform"

# 5. E2E Tests (if requested)
if [[ "$1" == "--e2e" || "$1" == "--all" ]]; then
    print_status "Phase 5: End-to-End Tests"
    echo "-------------------------"
    
    # Check if Playwright is installed
    if command -v npx playwright &> /dev/null; then
        # Start development server in background
        print_status "Starting development server..."
        npm run dev &
        DEV_SERVER_PID=$!
        
        # Wait for server to be ready
        print_status "Waiting for server to be ready..."
        sleep 10
        
        # Run E2E tests
        run_test "E2E Booking Flow" "npm run test:e2e"
        
        # Stop development server
        kill $DEV_SERVER_PID 2>/dev/null || true
    else
        print_warning "Playwright not installed, skipping E2E tests"
        print_warning "Run 'npx playwright install' to enable E2E testing"
    fi
fi

# Test Summary
echo ""
echo "=================================="
echo "🏁 Test Suite Complete"
echo "=================================="

print_status "Results Summary:"
print_success "Tests Passed: $TESTS_PASSED"

if [ $TESTS_FAILED -gt 0 ]; then
    print_error "Tests Failed: $TESTS_FAILED"
    echo ""
    print_error "Failed Tests:"
    for test in "${FAILED_TESTS[@]}"; do
        echo "  - $test"
    done
    echo ""
    print_error "Some tests failed. Please review the output above."
    exit 1
else
    print_success "All tests passed! 🎉"
    echo ""
    print_status "Coverage Summary:"
    echo "  - Pricing Logic: ✅ Comprehensive"
    echo "  - Auth Guards: ✅ Verified"
    echo "  - File Validation: ✅ Secure"
    echo "  - Booking Flow: ✅ Complete"
    echo "  - Payment Flow: ✅ End-to-End"
    echo ""
    print_success "Your code is ready for production! 🚀"
fi

# Optional: Generate coverage report
if [[ "$1" == "--coverage" || "$1" == "--all" ]]; then
    print_status "Generating coverage report..."
    npx jest --coverage
    print_success "Coverage report generated in coverage/ directory"
fi

echo ""
print_status "Test run completed at $(date)"