#!/usr/bin/env tsx

/**
 * Add missing keys to translation files
 * Usage: tsx add-missing-keys.ts [options]
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { SyncResult } from "./types";
import {
  createBackup,
  getAllKeyValues,
  getTranslationFiles,
  readTranslationFile,
  setNestedKey,
  writeTranslationFile,
} from "./utils";

interface AddKeysOptions {
  sourceFile?: string;
  targetDirectory?: string;
  targetFiles?: string[];
  dryRun?: boolean;
  backup?: boolean;
  verbose?: boolean;
  placeholderValue?: string;
  output?: string;
}

const DEFAULT_OPTIONS: AddKeysOptions = {
  sourceFile: "src/i18n/messages/en.json",
  targetDirectory: "src/i18n/messages",
  dryRun: false,
  backup: true,
  verbose: false,
  placeholderValue: "TRANSLATE_ME",
};

function parseArgs(): AddKeysOptions {
  const args = process.argv.slice(2);
  const options: AddKeysOptions = { ...DEFAULT_OPTIONS };

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
Usage: tsx add-missing-keys.ts [options]

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
  tsx add-missing-keys.ts
  tsx add-missing-keys.ts --dry-run --verbose
  tsx add-missing-keys.ts --source en.json --target-files fr.json,sw.json
  tsx add-missing-keys.ts --placeholder "TODO: Translate" --no-backup
`);
}

function addMissingKeys(
  sourceFile: string,
  targetFile: string,
  options: AddKeysOptions,
): { keysAdded: number; keys: string[] } {
  const source = readTranslationFile(sourceFile);
  const target = readTranslationFile(targetFile);

  const sourceKeyValues = getAllKeyValues(source.data);
  const targetKeys = target.keys;

  const missingKeys = Object.keys(sourceKeyValues).filter(
    (key) => !targetKeys.has(key),
  );
  const keysAdded: string[] = [];

  if (missingKeys.length === 0) {
    return { keysAdded: 0, keys: [] };
  }

  // Create backup if requested
  if (options.backup && !options.dryRun) {
    const backupPath = createBackup(targetFile);
    if (options.verbose) {
      console.log(`Created backup: ${backupPath}`);
    }
  }

  // Add missing keys
  const updatedData = { ...target.data };

  for (const key of missingKeys) {
    const sourceValue = sourceKeyValues[key];
    const placeholderValue = options.placeholderValue || sourceValue;

    setNestedKey(updatedData, key, placeholderValue);
    keysAdded.push(key);

    if (options.verbose) {
      console.log(`  Added: ${key} = "${placeholderValue}"`);
    }
  }

  // Write updated file
  if (!options.dryRun) {
    writeTranslationFile(targetFile, updatedData);
  }

  return { keysAdded: keysAdded.length, keys: keysAdded };
}

function syncFiles(options: AddKeysOptions): SyncResult {
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

        const { keysAdded, keys } = addMissingKeys(
          options.sourceFile!,
          targetFile,
          options,
        );

        result.filesProcessed++;
        result.keysAdded += keysAdded;

        if (options.verbose) {
          console.log(`  Added ${keysAdded} keys`);
        }

        if (options.dryRun && keysAdded > 0) {
          console.log(
            `  Would add keys: ${keys.slice(0, 5).join(", ")}${keys.length > 5 ? "..." : ""}`,
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

function formatResult(result: SyncResult, options: AddKeysOptions): string {
  let output = "\n🔄 Add Missing Keys Report\n";
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

  if (result.success && result.keysAdded === 0) {
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
