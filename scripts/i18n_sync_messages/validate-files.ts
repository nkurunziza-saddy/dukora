#!/usr/bin/env tsx

/**
 * Validate translation files
 * Usage: tsx validate-files.ts [options]
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { ValidationResult } from "./types";
import {
  getTranslationFiles,
  validateTranslationFile,
} from "./utils";

interface ValidateOptions {
  directory?: string;
  files?: string[];
  verbose?: boolean;
  output?: string;
  format?: "json" | "table" | "summary";
}

const DEFAULT_OPTIONS: ValidateOptions = {
  directory: "src/i18n/messages",
  verbose: false,
  format: "table",
};

function parseArgs(): ValidateOptions {
  const args = process.argv.slice(2);
  const options: ValidateOptions = { ...DEFAULT_OPTIONS };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--directory":
      case "-d":
        options.directory = args[++i];
        break;
      case "--files":
      case "-f":
        options.files = args[++i].split(",");
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
      case "--output":
      case "-o":
        options.output = args[++i];
        break;
      case "--format":
        options.format = args[++i] as "json" | "table" | "summary";
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
Usage: tsx validate-files.ts [options]

Options:
  -d, --directory <dir>      Directory containing translation files
  -f, --files <files>        Comma-separated list of files to validate
  -v, --verbose              Show detailed information
  -o, --output <file>        Output results to file
  --format <format>          Output format: json, table, summary (default: table)
  -h, --help                 Show this help message

Examples:
  tsx validate-files.ts
  tsx validate-files.ts --directory ./messages
  tsx validate-files.ts --files en.json,fr.json
  tsx validate-files.ts --format json --output validation.json
`);
}

export function validateFiles(
  options: ValidateOptions,
): Array<ValidationResult & { filename: string; language: string }> {
  const results: Array<
    ValidationResult & { filename: string; language: string }
  > = [];

  // Determine files to validate
  let files: string[] = [];

  if (options.files) {
    files = options.files.map((file) =>
      path.isAbsolute(file) ? file : path.join(options.directory!, file),
    );
  } else {
    files = getTranslationFiles(options.directory!);
  }

  // Validate each file
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.warn(`Warning: File not found: ${file}`);
      continue;
    }

    const filename = path.basename(file);
    const language = path.basename(file, ".json");
    const validation = validateTranslationFile(file);

    results.push({
      ...validation,
      filename,
      language,
    });
  }

  return results;
}

function formatTable(
  results: Array<ValidationResult & { filename: string; language: string }>,
): string {
  let output = "\n🔍 Translation Files Validation\n";
  output += `${"=".repeat(50)}\n\n`;

  for (const result of results) {
    const status = result.isValid ? "✅" : "❌";
    output += `${status} ${result.language.toUpperCase()} (${result.filename})\n`;
    output += `${"-".repeat(30)}\n`;
    output += `Keys: ${result.keyCount}\n`;
    output += `Lines: ${result.lineCount}\n`;
    output += `Valid: ${result.isValid ? "Yes" : "No"}\n`;

    if (result.errors.length > 0) {
      output += "\nErrors:\n";
      result.errors.forEach((error) => {
        output += `  ❌ ${error}\n`;
      });
    }

    if (result.warnings.length > 0) {
      output += "\nWarnings:\n";
      result.warnings.forEach((warning) => {
        output += `  ⚠️  ${warning}\n`;
      });
    }

    output += "\n";
  }

  return output;
}

function formatSummary(
  results: Array<ValidationResult & { filename: string; language: string }>,
): string {
  const totalFiles = results.length;
  const validFiles = results.filter((r) => r.isValid).length;
  const invalidFiles = totalFiles - validFiles;
  const totalKeys = results.reduce((sum, r) => sum + r.keyCount, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  let output = "\n📊 Validation Summary\n";
  output += `${"=".repeat(30)}\n`;
  output += `Total files: ${totalFiles}\n`;
  output += `Valid files: ${validFiles}\n`;
  output += `Invalid files: ${invalidFiles}\n`;
  output += `Total keys: ${totalKeys}\n`;
  output += `Total errors: ${totalErrors}\n`;
  output += `Total warnings: ${totalWarnings}\n`;

  if (invalidFiles > 0) {
    output += "\nInvalid files:\n";
    results
      .filter((r) => !r.isValid)
      .forEach((result) => {
        output += `  • ${result.filename}: ${result.errors.length} errors\n`;
      });
  }

  if (totalWarnings > 0) {
    output += "\nFiles with warnings:\n";
    results
      .filter((r) => r.warnings.length > 0)
      .forEach((result) => {
        output += `  • ${result.filename}: ${result.warnings.length} warnings\n`;
      });
  }

  if (validFiles === totalFiles && totalWarnings === 0) {
    output += "\n✅ All files are valid!\n";
  } else if (validFiles === totalFiles) {
    output += "\n✅ All files are valid (with warnings)\n";
  } else {
    output += "\n❌ Some files have validation errors\n";
  }

  return output;
}

function main(): void {
  try {
    const options = parseArgs();

    if (!fs.existsSync(options.directory!)) {
      console.error(`Error: Directory not found: ${options.directory}`);
      process.exit(1);
    }

    const results = validateFiles(options);

    let output: string;

    switch (options.format) {
      case "json":
        output = JSON.stringify(results, null, 2);
        break;
      case "summary":
        output = formatSummary(results);
        break;
      default:
        output = formatTable(results);
        break;
    }

    if (options.output) {
      fs.writeFileSync(options.output, output, "utf-8");
      console.log(`Validation report saved to: ${options.output}`);
    } else {
      console.log(output);
    }

    // Exit with error code if there are validation errors
    const hasErrors = results.some((result) => !result.isValid);
    if (hasErrors) {
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
