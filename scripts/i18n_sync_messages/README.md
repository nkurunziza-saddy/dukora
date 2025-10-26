# I18n Synchronization Utilities

A comprehensive toolkit for managing translation files in your project. This module provides various utilities to keep your translation files synchronized and validated.

## 📁 Files Overview

| File                    | Purpose              | Description                              |
| ----------------------- | -------------------- | ---------------------------------------- |
| `types.ts`              | Type definitions     | TypeScript interfaces and types          |
| `utils.ts`              | Core utilities       | Common functions for file operations     |
| `check-missing-keys.ts` | Missing keys checker | Find missing keys in translation files   |
| `add-missing-keys.ts`   | Key adder            | Add missing keys to translation files    |
| `remove-extra-keys.ts`  | Key remover          | Remove extra keys from translation files |
| `validate-files.ts`     | File validator       | Validate translation file structure      |
| `sync-all.ts`           | Complete sync        | Full synchronization (add + remove)      |
| `index.ts`              | Main export          | Programmatic API and exports             |

## 🚀 Quick Start

### Prerequisites

Make sure you have `tsx` installed globally or in your project:

```bash
npm install -g tsx
# or
npm install --save-dev tsx
```

### Basic Usage

```bash
# Check for missing keys
tsx scripts/i18n_sync_messages/check-missing-keys.ts

# Add missing keys
tsx scripts/i18n_sync_messages/add-missing-keys.ts

# Remove extra keys
tsx scripts/i18n_sync_messages/remove-extra-keys.ts

# Validate all files
tsx scripts/i18n_sync_messages/validate-files.ts

# Complete synchronization
tsx scripts/i18n_sync_messages/sync-all.ts
```

## 📋 Commands Reference

### Check Missing Keys

```bash
tsx check-missing-keys.ts [options]

Options:
  -s, --source <file>        Source translation file (default: src/i18n/messages/en.json)
  -d, --target-dir <dir>     Target directory containing translation files
  -f, --target-files <files> Comma-separated list of target files
  -v, --verbose              Show detailed information
  -o, --output <file>        Output results to file
  --format <format>          Output format: json, table, summary (default: table)
  -h, --help                 Show help message
```

**Examples:**

```bash
# Basic check
tsx check-missing-keys.ts

# Check specific files
tsx check-missing-keys.ts --source en.json --target-files fr.json,sw.json

# Export to JSON
tsx check-missing-keys.ts --format json --output report.json
```

### Add Missing Keys

```bash
tsx add-missing-keys.ts [options]

Options:
  -s, --source <file>        Source translation file
  -d, --target-dir <dir>     Target directory
  -f, --target-files <files> Comma-separated list of target files
  --dry-run                  Show what would be done without making changes
  --no-backup                Don't create backup files
  -v, --verbose              Show detailed information
  -p, --placeholder <text>   Placeholder text for missing keys (default: TRANSLATE_ME)
  -o, --output <file>        Output results to file
  -h, --help                 Show help message
```

**Examples:**

```bash
# Add missing keys with default placeholder
tsx add-missing-keys.ts

# Dry run to see what would be added
tsx add-missing-keys.ts --dry-run --verbose

# Custom placeholder
tsx add-missing-keys.ts --placeholder "TODO: Translate this"
```

### Remove Extra Keys

```bash
tsx remove-extra-keys.ts [options]

Options:
  -s, --source <file>        Source translation file
  -d, --target-dir <dir>     Target directory
  -f, --target-files <files> Comma-separated list of target files
  --dry-run                  Show what would be done without making changes
  --no-backup                Don't create backup files
  -v, --verbose              Show detailed information
  -o, --output <file>        Output results to file
  -h, --help                 Show help message
```

**Examples:**

```bash
# Remove extra keys
tsx remove-extra-keys.ts

# Dry run to see what would be removed
tsx remove-extra-keys.ts --dry-run --verbose
```

### Validate Files

```bash
tsx validate-files.ts [options]

Options:
  -d, --directory <dir>      Directory containing translation files
  -f, --files <files>        Comma-separated list of files to validate
  -v, --verbose              Show detailed information
  -o, --output <file>        Output results to file
  --format <format>          Output format: json, table, summary (default: table)
  -h, --help                 Show help message
```

**Examples:**

```bash
# Validate all files in directory
tsx validate-files.ts

# Validate specific files
tsx validate-files.ts --files en.json,fr.json

# Export validation report
tsx validate-files.ts --format json --output validation.json
```

### Complete Synchronization

```bash
tsx sync-all.ts [options]

Options:
  -s, --source <file>        Source translation file
  -d, --target-dir <dir>     Target directory
  -f, --target-files <files> Comma-separated list of target files
  --dry-run                  Show what would be done without making changes
  --no-backup                Don't create backup files
  -v, --verbose              Show detailed information
  -p, --placeholder <text>   Placeholder text for missing keys
  -o, --output <file>        Output results to file
  -h, --help                 Show help message
```

**Examples:**

```bash
# Complete sync (add missing + remove extra)
tsx sync-all.ts

# Dry run with verbose output
tsx sync-all.ts --dry-run --verbose
```

## 🔧 Programmatic Usage

You can also use these utilities programmatically in your code:

```typescript
import { quickSync, quickValidate } from "./scripts/i18n_sync_messages";

// Quick synchronization
const result = await quickSync(
  "src/i18n/messages/en.json",
  "src/i18n/messages",
  {
    dryRun: false,
    backup: true,
    placeholderValue: "TRANSLATE_ME",
  }
);

console.log(
  `Added ${result.keysAdded} keys, removed ${result.keysRemoved} keys`
);

// Quick validation
const validation = await quickValidate("src/i18n/messages");
console.log(`Valid files: ${validation.validFiles}/${validation.totalFiles}`);
```

## 📊 Output Formats

### Table Format (Default)

```
📊 Missing Keys Report
==================================================

🌐 FRENCH
------------------------------
Missing keys: 5
Extra keys:   2

Missing keys:
  • navigation → dashboard
  • forms → businessName
  • common → save
  • common → cancel
  • common → delete
```

### Summary Format

```
📋 Summary
==============================
Files checked: 3
Files with issues: 1
Total missing keys: 5
Total extra keys: 2

Files needing attention:
  • fr: 5 missing, 2 extra
```

### JSON Format

```json
[
  {
    "language": "fr",
    "missingKeys": ["navigation.dashboard", "forms.businessName"],
    "extraKeys": ["oldKey1", "oldKey2"],
    "totalMissing": 2,
    "totalExtra": 2
  }
]
```

## 🛡️ Safety Features

- **Backup Creation**: Automatically creates timestamped backups before making changes
- **Dry Run Mode**: Preview changes without modifying files
- **Validation**: Ensures JSON files remain valid after modifications
- **Error Handling**: Comprehensive error reporting and recovery

## 📝 Best Practices

1. **Always use dry-run first**: `--dry-run` to preview changes
2. **Create backups**: Keep `--backup` enabled (default)
3. **Validate after changes**: Run validation after synchronization
4. **Use version control**: Commit changes after successful sync
5. **Review placeholders**: Check that placeholder values are appropriate

## 🔍 Troubleshooting

### Common Issues

1. **JSON Syntax Errors**: Use `validate-files.ts` to check file integrity
2. **Permission Errors**: Ensure write permissions for target directory
3. **Missing Files**: Check file paths and directory structure
4. **Encoding Issues**: Files are read/written in UTF-8

### Getting Help

```bash
# Get help for any command
tsx check-missing-keys.ts --help
tsx add-missing-keys.ts --help
tsx remove-extra-keys.ts --help
tsx validate-files.ts --help
tsx sync-all.ts --help
```

## 🚀 Integration

### Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "i18n:check": "tsx scripts/i18n_sync_messages/check-missing-keys.ts",
    "i18n:add": "tsx scripts/i18n_sync_messages/add-missing-keys.ts",
    "i18n:remove": "tsx scripts/i18n_sync_messages/remove-extra-keys.ts",
    "i18n:validate": "tsx scripts/i18n_sync_messages/validate-files.ts",
    "i18n:sync": "tsx scripts/i18n_sync_messages/sync-all.ts",
    "i18n:sync:dry": "tsx scripts/i18n_sync_messages/sync-all.ts --dry-run"
  }
}
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Check i18n files
  run: npm run i18n:check

- name: Validate i18n files
  run: npm run i18n:validate
```

## 📈 Performance

- **Fast Processing**: Optimized for large translation files
- **Memory Efficient**: Processes files one at a time
- **Parallel Safe**: Can be run concurrently on different files
- **Incremental**: Only processes files that need changes
