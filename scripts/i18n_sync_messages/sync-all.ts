#!/usr/bin/env tsx

/**
 * Complete synchronization of translation files
 * Usage: tsx sync-all.ts [options]
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { SyncResult } from "./types";
import {
  createBackup,
  getAllKeyValues,
  getTranslationFiles,
  readTranslationFile,
  removeNestedKey,
  setNestedKey,
  writeTranslationFile,
} from "./utils";

interface SyncAllOptions {
  sourceFile?: string;
  targetDirectory?: string;
  targetFiles?: string[];
  dryRun?: boolean;
  backup?: boolean;
  verbose?: boolean;
  placeholderValue?: string;
  output?: string;
}

const DEFAULT_OPTIONS: SyncAllOptions = {
  sourceFile: "src/i18n/messages/en.json",
  targetDirectory: "src/i18n/messages",
  dryRun: false,
  backup: true,
  verbose: false,
  placeholderValue: "TRANSLATE_ME",
};

function parseArgs(): SyncAllOptions {
  const args = process.argv.slice(2);
  const options: SyncAllOptions = { ...DEFAULT_OPTIONS };

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
      case "--placeholder":
      case "-p":
        options.placeholderValue = args[++i];
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
Usage: tsx sync-all.ts [options]

Options:
  -s, --source <file>        Source translation file (default: src/i18n/messages/en.json)
  -d, --target-dir <dir>     Target directory containing translation files
  -f, --target-files <files> Comma-separated list of target files
  --dry-run                  Show what would be done without making changes
  --no-backup                Don't create backup files
  -v, --verbose              Show detailed information
  -p, --placeholder <text>   Placeholder text for missing keys (default: TRANSLATE_ME)
  -o, --output <file>        Output results to file
  -h, --help                 Show this help message

Examples:
  tsx sync-all.ts
  tsx sync-all.ts --dry-run --verbose
  tsx sync-all.ts --source en.json --target-files fr.json,sw.json
  tsx sync-all.ts --placeholder "TODO: Translate" --no-backup
`);
}

function syncFile(
  sourceFile: string,
  targetFile: string,
  options: SyncAllOptions
): {
  keysAdded: number;
  keysRemoved: number;
  addedKeys: string[];
  removedKeys: string[];
} {
  const source = readTranslationFile(sourceFile);
  const target = readTranslationFile(targetFile);

  const sourceKeys = source.keys;
  const sourceKeyValues = getAllKeyValues(source.data);
  const targetKeys = target.keys;

  // Find missing and extra keys
  const missingKeys = [...sourceKeys].filter((key) => !targetKeys.has(key));
  const extraKeys = [...targetKeys].filter((key) => !sourceKeys.has(key));

  if (missingKeys.length === 0 && extraKeys.length === 0) {
    return { keysAdded: 0, keysRemoved: 0, addedKeys: [], removedKeys: [] };
  }

  // Create backup if requested
  if (options.backup && !options.dryRun) {
    const backupPath = createBackup(targetFile);
    if (options.verbose) {
      console.log(`Created backup: ${backupPath}`);
    }
  }

  // Update the target data
  const updatedData = { ...target.data };
  const addedKeys: string[] = [];
  const removedKeys: string[] = [];

  // Add missing keys
  for (const key of missingKeys) {
    const sourceValue = sourceKeyValues[key];
    const placeholderValue = options.placeholderValue || sourceValue;

    setNestedKey(updatedData, key, placeholderValue);
    addedKeys.push(key);

    if (options.verbose) {
      console.log(`  Added: ${key} = "${placeholderValue}"`);
    }
  }

  // Remove extra keys
  for (const key of extraKeys) {
    const removed = removeNestedKey(updatedData, key);
    if (removed) {
      removedKeys.push(key);
      if (options.verbose) {
        console.log(`  Removed: ${key}`);
      }
    }
  }

  // Write updated file
  if (!options.dryRun) {
    writeTranslationFile(targetFile, updatedData);
  }

  return {
    keysAdded: addedKeys.length,
    keysRemoved: removedKeys.length,
    addedKeys,
    removedKeys,
  };
}

export function syncAllFiles(options: SyncAllOptions): SyncResult {
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
        path.isAbsolute(file) ? file : path.join(options.targetDirectory!, file)
      );
    } else {
      const files = getTranslationFiles(options.targetDirectory!);
      targetFiles = files.filter(
        (file) => path.basename(file) !== path.basename(options.sourceFile!)
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

        const { keysAdded, keysRemoved, addedKeys, removedKeys } = syncFile(
          options.sourceFile!,
          targetFile,
          options
        );

        result.filesProcessed++;
        result.keysAdded += keysAdded;
        result.keysRemoved += keysRemoved;

        if (options.verbose) {
          console.log(`  Added ${keysAdded} keys, removed ${keysRemoved} keys`);
        }

        if (options.dryRun) {
          if (keysAdded > 0) {
            console.log(
              `  Would add: ${addedKeys.slice(0, 3).join(", ")}${addedKeys.length > 3 ? "..." : ""}`
            );
          }
          if (keysRemoved > 0) {
            console.log(
              `  Would remove: ${removedKeys.slice(0, 3).join(", ")}${removedKeys.length > 3 ? "..." : ""}`
            );
          }
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

function formatResult(result: SyncResult, options: SyncAllOptions): string {
  let output = "\n🔄 Complete Sync Report\n";
  output += `${"=".repeat(40)}\n\n`;

  if (options.dryRun) {
    output += "🔍 DRY RUN - No changes were made\n\n";
  }

  output += `Files processed: ${result.filesProcessed}\n`;
  output += `Keys added: ${result.keysAdded}\n`;
  output += `Keys removed: ${result.keysRemoved}\n`;
  output += `Net change: ${result.keysAdded - result.keysRemoved}\n`;

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

  if (result.success && result.keysAdded === 0 && result.keysRemoved === 0) {
    output += "\n✅ All files are already synchronized!\n";
  } else if (result.success) {
    output += "\n✅ Sync completed successfully!\n";
  } else {
    output += "\n❌ Sync completed with errors!\n";
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
        `Error: Target directory not found: ${options.targetDirectory}`
      );
      process.exit(1);
    }

    const result = syncAllFiles(options);
    const output = formatResult(result, options);

    if (options.output) {
      fs.writeFileSync(options.output, output, "utf-8");
      console.log(`Report saved to: ${options.output}`);
    } else {
      console.log(output);
    }

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
