#!/usr/bin/env tsx

/**
 * Remove extra keys from translation files
 * Usage: tsx remove-extra-keys.ts [options]
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { SyncResult } from "./types";
import {
  createBackup,
  getTranslationFiles,
  readTranslationFile,
  removeNestedKey,
  writeTranslationFile,
} from "./utils";

interface RemoveKeysOptions {
  sourceFile?: string;
  targetDirectory?: string;
  targetFiles?: string[];
  dryRun?: boolean;
  backup?: boolean;
  verbose?: boolean;
  output?: string;
}

const DEFAULT_OPTIONS: RemoveKeysOptions = {
  sourceFile: "src/i18n/messages/en.json",
  targetDirectory: "src/i18n/messages",
  dryRun: false,
  backup: true,
  verbose: false,
};

function parseArgs(): RemoveKeysOptions {
  const args = process.argv.slice(2);
  const options: RemoveKeysOptions = { ...DEFAULT_OPTIONS };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--source":
      case "-s":
        options.sourceFile = args[++i];
        break;
      case "--target-dir":
      case "-d":
        options.targetDirectory = args[++i];
        break;
      case "--target-files":
      case "-f":
        options.targetFiles = args[++i].split(",");
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--no-backup":
        options.backup = false;
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
      case "--output":
      case "-o":
        options.output = args[++i];
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Usage: tsx remove-extra-keys.ts [options]

Options:
  -s, --source <file>        Source translation file (default: src/i18n/messages/en.json)
  -d, --target-dir <dir>     Target directory containing translation files
  -f, --target-files <files> Comma-separated list of target files
  --dry-run                  Show what would be done without making changes
  --no-backup                Don't create backup files
  -v, --verbose              Show detailed information
  -o, --output <file>        Output results to file
  -h, --help                 Show this help message

Examples:
  tsx remove-extra-keys.ts
  tsx remove-extra-keys.ts --dry-run --verbose
  tsx remove-extra-keys.ts --source en.json --target-files fr.json,sw.json
  tsx remove-extra-keys.ts --no-backup
`);
}

function removeExtraKeys(
  sourceFile: string,
  targetFile: string,
  options: RemoveKeysOptions,
): { keysRemoved: number; keys: string[] } {
  const source = readTranslationFile(sourceFile);
  const target = readTranslationFile(targetFile);

  const sourceKeys = source.keys;
  const targetKeys = target.keys;

  const extraKeys = [...targetKeys].filter((key) => !sourceKeys.has(key));
  const keysRemoved: string[] = [];

  if (extraKeys.length === 0) {
    return { keysRemoved: 0, keys: [] };
  }

  // Create backup if requested
  if (options.backup && !options.dryRun) {
    const backupPath = createBackup(targetFile);
    if (options.verbose) {
      console.log(`Created backup: ${backupPath}`);
    }
  }

  // Remove extra keys
  const updatedData = { ...target.data };

  for (const key of extraKeys) {
    const removed = removeNestedKey(updatedData, key);
    if (removed) {
      keysRemoved.push(key);
      if (options.verbose) {
        console.log(`  Removed: ${key}`);
      }
    }
  }

  // Write updated file
  if (!options.dryRun) {
    writeTranslationFile(targetFile, updatedData);
  }

  return { keysRemoved: keysRemoved.length, keys: keysRemoved };
}

function syncFiles(options: RemoveKeysOptions): SyncResult {
  const result: SyncResult = {
    success: true,
    filesProcessed: 0,
    keysAdded: 0,
    keysRemoved: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Determine target files
    let targetFiles: string[] = [];

    if (options.targetFiles) {
      targetFiles = options.targetFiles.map((file) =>
        path.isAbsolute(file)
          ? file
          : path.join(options.targetDirectory!, file),
      );
    } else {
      const files = getTranslationFiles(options.targetDirectory!);
      targetFiles = files.filter(
        (file) => path.basename(file) !== path.basename(options.sourceFile!),
      );
    }

    if (options.verbose) {
      console.log(`Source file: ${options.sourceFile}`);
      console.log(`Target files: ${targetFiles.length}`);
      targetFiles.forEach((file) => console.log(`  - ${path.basename(file)}`));
      console.log("");
    }

    // Process each target file
    for (const targetFile of targetFiles) {
      if (!fs.existsSync(targetFile)) {
        result.warnings.push(`Target file not found: ${targetFile}`);
        continue;
      }

      try {
        const language = path.basename(targetFile, ".json");

        if (options.verbose) {
          console.log(`Processing ${language}...`);
        }

        const { keysRemoved, keys } = removeExtraKeys(
          options.sourceFile!,
          targetFile,
          options,
        );

        result.filesProcessed++;
        result.keysRemoved += keysRemoved;

        if (options.verbose) {
          console.log(`  Removed ${keysRemoved} keys`);
        }

        if (options.dryRun && keysRemoved > 0) {
          console.log(
            `  Would remove keys: ${keys.slice(0, 5).join(", ")}${keys.length > 5 ? "..." : ""}`,
          );
        }
      } catch (error) {
        result.errors.push(`Failed to process ${targetFile}: ${error}`);
        result.success = false;
      }
    }
  } catch (error) {
    result.errors.push(`Sync failed: ${error}`);
    result.success = false;
  }

  return result;
}

function formatResult(result: SyncResult, options: RemoveKeysOptions): string {
  let output = "\n🗑️  Remove Extra Keys Report\n";
  output += `${"=".repeat(40)}\n\n`;

  if (options.dryRun) {
    output += "🔍 DRY RUN - No changes were made\n\n";
  }

  output += `Files processed: ${result.filesProcessed}\n`;
  output += `Keys added: ${result.keysAdded}\n`;
  output += `Keys removed: ${result.keysRemoved}\n`;

  if (result.warnings.length > 0) {
    output += "\n⚠️  Warnings:\n";
    result.warnings.forEach((warning) => {
      output += `  • ${warning}\n`;
    });
  }

  if (result.errors.length > 0) {
    output += "\n❌ Errors:\n";
    result.errors.forEach((error) => {
      output += `  • ${error}\n`;
    });
  }

  if (result.success && result.keysRemoved === 0) {
    output += "\n✅ No extra keys found - all files are synchronized!\n";
  } else if (result.success) {
    output += "\n✅ Cleanup completed successfully!\n";
  } else {
    output += "\n❌ Cleanup completed with errors!\n";
  }

  return output;
}

function main(): void {
  try {
    const options = parseArgs();

    if (!fs.existsSync(options.sourceFile!)) {
      console.error(`Error: Source file not found: ${options.sourceFile}`);
      process.exit(1);
    }

    if (!fs.existsSync(options.targetDirectory!)) {
      console.error(
        `Error: Target directory not found: ${options.targetDirectory}`,
      );
      process.exit(1);
    }

    const result = syncFiles(options);
    const output = formatResult(result, options);

    if (options.output) {
      fs.writeFileSync(options.output, output, "utf-8");
      console.log(`Report saved to: ${options.output}`);
    } else {
      console.log(output);
    }

    // Exit with error code if there were errors
    if (!result.success) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
