/**
 * I18n Synchronization Utilities
 *
 * This module provides comprehensive tools for managing translation files:
 * - Check for missing keys
 * - Add missing keys
 * - Remove extra keys
 * - Validate files
 * - Complete synchronization
 */

// Re-export types and utilities for programmatic use
export * from "./types";
export * from "./utils";

/**
 * Quick sync function for programmatic use
 */
export async function quickSync(
  sourceFile: string = "src/i18n/messages/en.json",
  targetDirectory: string = "src/i18n/messages",
  options: {
    dryRun?: boolean;
    backup?: boolean;
    placeholderValue?: string;
  } = {},
): Promise<{
  success: boolean;
  filesProcessed: number;
  keysAdded: number;
  keysRemoved: number;
  errors: string[];
}> {
  const { syncAllFiles } = await import("./sync-all");

  const result = syncAllFiles({
    sourceFile,
    targetDirectory,
    dryRun: options.dryRun || false,
    backup: options.backup !== false,
    verbose: false,
    placeholderValue: options.placeholderValue || "TRANSLATE_ME",
  });

  return {
    success: result.success,
    filesProcessed: result.filesProcessed,
    keysAdded: result.keysAdded,
    keysRemoved: result.keysRemoved,
    errors: result.errors,
  };
}

/**
 * Quick validation function for programmatic use
 */
export async function quickValidate(
  directory: string = "src/i18n/messages",
): Promise<{
  isValid: boolean;
  totalFiles: number;
  validFiles: number;
  totalKeys: number;
  errors: string[];
  warnings: string[];
}> {
  const { validateFiles } = await import("./validate-files");

  const results = validateFiles({ directory });

  return {
    isValid: results.every((r) => r.isValid),
    totalFiles: results.length,
    validFiles: results.filter((r) => r.isValid).length,
    totalKeys: results.reduce((sum, r) => sum + r.keyCount, 0),
    errors: results.flatMap((r) => r.errors),
    warnings: results.flatMap((r) => r.warnings),
  };
}
