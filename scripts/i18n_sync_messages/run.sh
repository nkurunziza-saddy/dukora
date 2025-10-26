#!/bin/bash

# I18n Synchronization Utilities Runner
# Usage: ./run.sh <command> [options]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to show help
show_help() {
    print_color $BLUE "I18n Synchronization Utilities"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  check       Check for missing keys in translation files"
    echo "  add         Add missing keys to translation files"
    echo "  remove      Remove extra keys from translation files"
    echo "  validate    Validate translation files"
    echo "  sync        Complete synchronization (add + remove)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 check"
    echo "  $0 add --dry-run --verbose"
    echo "  $0 sync --source en.json --target-files fr.json,sw.json"
    echo "  $0 validate --format json --output report.json"
    echo ""
    echo "For detailed help on each command, use:"
    echo "  $0 <command> --help"
}

# Check if tsx is available
check_tsx() {
    if ! command -v npx &> /dev/null; then
        print_color $RED "Error: npx is not available"
        echo ""
        echo "Please ensure Node.js and npm are installed"
        exit 1
    fi
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi

    local command=$1
    shift

    case $command in
        "check")
            check_tsx
            print_color $BLUE "🔍 Checking for missing keys..."
            npx tsx "$SCRIPT_DIR/check-missing-keys.ts" "$@"
            ;;
        "add")
            check_tsx
            print_color $GREEN "➕ Adding missing keys..."
            npx tsx "$SCRIPT_DIR/add-missing-keys.ts" "$@"
            ;;
        "remove")
            check_tsx
            print_color $YELLOW "🗑️  Removing extra keys..."
            npx tsx "$SCRIPT_DIR/remove-extra-keys.ts" "$@"
            ;;
        "validate")
            check_tsx
            print_color $BLUE "✅ Validating translation files..."
            npx tsx "$SCRIPT_DIR/validate-files.ts" "$@"
            ;;
        "sync")
            check_tsx
            print_color $GREEN "🔄 Complete synchronization..."
            npx tsx "$SCRIPT_DIR/sync-all.ts" "$@"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_color $RED "Error: Unknown command '$command'"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
