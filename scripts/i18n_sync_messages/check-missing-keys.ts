#!/usr/bin/env tsx

import * as fs from "node:fs";
import * as path from "node:path";
import type { ComparisonResult, MissingKeysReport } from "./types";
import { formatKeyPath, readTranslationFile } from "./utils";

interface CheckOptions {
  sourceFile?: string;
  targetDirectory?: string;
  targetFiles?: string[];
  verbose?: boolean;
  output?: string;
  format?: "json" | "table" | "summary";
}

const DEFAULT_OPTIONS: CheckOptions = {
  sourceFile: "src/i18n/messages/en.json",
  targetDirectory: "src/i18n/messages",
  verbose: false,
  format: "table",
};

function parseArgs(): CheckOptions {
  const args = process.argv.slice(2);
  const options: CheckOptions = { ...DEFAULT_OPTIONS };

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
Usage: tsx check-missing-keys.ts [options]

Options:
  -s, --source <file>        Source translation file (default: src/i18n/messages/en.json)
  -d, --target-dir <dir>     Target directory containing translation files
  -f, --target-files <files> Comma-separated list of target files
  -v, --verbose              Show detailed information
  -o, --output <file>        Output results to file
  --format <format>          Output format: json, table, summary (default: table)
  -h, --help                 Show this help message

Examples:
  tsx check-missing-keys.ts
  tsx check-missing-keys.ts --source en.json --target-dir ./messages
  tsx check-missing-keys.ts --format json --output report.json
  tsx check-missing-keys.ts --verbose --format summary
`);
}

function compareFiles(
  sourceFile: string,
  targetFile: string
): ComparisonResult {
  const source = readTranslationFile(sourceFile);
  const target = readTranslationFile(targetFile);

  const missingKeys = [...source.keys].filter((key) => !target.keys.has(key));
  const extraKeys = [...target.keys].filter((key) => !source.keys.has(key));
  const commonKeys = [...source.keys].filter((key) => target.keys.has(key));

  return {
    sourceFile: path.basename(sourceFile),
    targetFile: path.basename(targetFile),
    missingKeys,
    extraKeys,
    commonKeys,
    totalMissing: missingKeys.length,
    totalExtra: extraKeys.length,
    totalCommon: commonKeys.length,
  };
}

function generateReport(options: CheckOptions): MissingKeysReport[] {
  const reports: MissingKeysReport[] = [];

  // Determine target files
  let targetFiles: string[] = [];

  if (options.targetFiles) {
    targetFiles = options.targetFiles.map((file) =>
      path.isAbsolute(file) ? file : path.join(options.targetDirectory!, file)
    );
  } else {
    const files = fs.readdirSync(options.targetDirectory!);
    targetFiles = files
      .filter(
        (file) =>
          file.endsWith(".json") && file !== path.basename(options.sourceFile!)
      )
      .map((file) => path.join(options.targetDirectory!, file));
  }

  // Compare each target file with source
  for (const targetFile of targetFiles) {
    if (!fs.existsSync(targetFile)) {
      console.warn(`Warning: Target file not found: ${targetFile}`);
      continue;
    }

    const comparison = compareFiles(options.sourceFile!, targetFile);
    const language = path.basename(targetFile, ".json");

    reports.push({
      language,
      missingKeys: comparison.missingKeys,
      extraKeys: comparison.extraKeys,
      totalMissing: comparison.totalMissing,
      totalExtra: comparison.totalExtra,
    });
  }

  return reports;
}

function formatTable(reports: MissingKeysReport[]): string {
  let output = "\n📊 Missing Keys Report\n";
  output += `${"=".repeat(50)}\n\n`;

  for (const report of reports) {
    output += `🌐 ${report.language.toUpperCase()}\n`;
    output += `${"-".repeat(30)}\n`;
    output += `Missing keys: ${report.totalMissing}\n`;
    output += `Extra keys:   ${report.totalExtra}\n`;

    if (report.totalMissing > 0) {
      output += "\nMissing keys:\n";
      report.missingKeys.slice(0, 10).forEach((key) => {
        output += `  • ${formatKeyPath(key)}\n`;
      });
      if (report.missingKeys.length > 10) {
        output += `  ... and ${report.missingKeys.length - 10} more\n`;
      }
    }

    if (report.totalExtra > 0) {
      output += "\nExtra keys:\n";
      report.extraKeys.slice(0, 10).forEach((key) => {
        output += `  • ${formatKeyPath(key)}\n`;
      });
      if (report.extraKeys.length > 10) {
        output += `  ... and ${report.extraKeys.length - 10} more\n`;
      }
    }

    output += "\n";
  }

  return output;
}

function formatSummary(reports: MissingKeysReport[]): string {
  const totalMissing = reports.reduce(
    (sum, report) => sum + report.totalMissing,
    0
  );
  const totalExtra = reports.reduce(
    (sum, report) => sum + report.totalExtra,
    0
  );
  const filesWithIssues = reports.filter(
    (report) => report.totalMissing > 0 || report.totalExtra > 0
  );

  let output = "\n📋 Summary\n";
  output += `${"=".repeat(30)}\n`;
  output += `Files checked: ${reports.length}\n`;
  output += `Files with issues: ${filesWithIssues.length}\n`;
  output += `Total missing keys: ${totalMissing}\n`;
  output += `Total extra keys: ${totalExtra}\n`;

  if (filesWithIssues.length > 0) {
    output += "\nFiles needing attention:\n";
    filesWithIssues.forEach((report) => {
      output += `  • ${report.language}: ${report.totalMissing} missing, ${report.totalExtra} extra\n`;
    });
  } else {
    output += "\n✅ All files are synchronized!\n";
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

    const reports = generateReport(options);

    let output: string;

    switch (options.format) {
      case "json":
        output = JSON.stringify(reports, null, 2);
        break;
      case "summary":
        output = formatSummary(reports);
        break;
      default:
        output = formatTable(reports);
        break;
    }

    if (options.output) {
      fs.writeFileSync(options.output, output, "utf-8");
      console.log(`Report saved to: ${options.output}`);
    } else {
      console.log(output);
    }

    const hasIssues = reports.some(
      (report) => report.totalMissing > 0 || report.totalExtra > 0
    );
    if (hasIssues) {
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
