/**
 * Utility functions for i18n file operations
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type {
  TranslationFile,
  ValidationResult,
} from "./types";

/**
 * Read and parse a JSON translation file
 */
export function readTranslationFile(filePath: string): TranslationFile {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    const keys = getAllKeys(data);
    const lineCount = content.split("\n").length;

    return {
      filename: path.basename(filePath),
      language: path.basename(filePath, ".json"),
      data: data as Record<string, unknown>,
      keys,
      keyCount: keys.size,
      lineCount,
    };
  } catch (error) {
    throw new Error(`Failed to read translation file ${filePath}: ${error}`);
  }
}

/**
 * Write a translation file with proper formatting
 */
export function writeTranslationFile(
  filePath: string,
  data: Record<string, unknown>,
): void {
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, "utf-8");
  } catch (error) {
    throw new Error(`Failed to write translation file ${filePath}: ${error}`);
  }
}

/**
 * Get all keys from a nested object recursively
 */
export function getAllKeys(
  obj: Record<string, unknown>,
  prefix = "",
): Set<string> {
  const keys = new Set<string>();

  if (typeof obj === "object" && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.add(fullKey);

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const nestedKeys = getAllKeys(
          value as Record<string, unknown>,
          fullKey,
        );
        for (const k of nestedKeys) {
          keys.add(k);
        }
      }
    }
  }

  return keys;
}

/**
 * Get all keys with their values as a flat object
 */
export function getAllKeyValues(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, unknown> {
  const keyValues: Record<string, unknown> = {};

  if (typeof obj === "object" && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.assign(
          keyValues,
          getAllKeyValues(value as Record<string, unknown>, fullKey),
        );
      } else {
        keyValues[fullKey] = value;
      }
    }
  }

  return keyValues;
}

/**
 * Set a nested key in an object
 */
export function setNestedKey(
  obj: Record<string, unknown>,
  keyPath: string,
  value: unknown,
): void {
  const keys = keyPath.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      !(key in current) ||
      typeof current[key] !== "object" ||
      current[key] === null
    ) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Remove a nested key from an object
 */
export function removeNestedKey(
  obj: Record<string, unknown>,
  keyPath: string,
): boolean {
  const keys = keyPath.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      !(key in current) ||
      typeof current[key] !== "object" ||
      current[key] === null
    ) {
      return false; // Key path doesn't exist
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }

  return false;
}

/**
 * Validate a translation file
 */
export function validateTranslationFile(filePath: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    keyCount: 0,
    lineCount: 0,
  };

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    result.lineCount = content.split("\n").length;

    // Check if file is valid JSON
    const data = JSON.parse(content);

    // Check if it's an object
    if (typeof data !== "object" || Array.isArray(data)) {
      result.isValid = false;
      result.errors.push("Translation file must contain a JSON object");
      return result;
    }

    // Count keys
    const keys = getAllKeys(data);
    result.keyCount = keys.size;

    // Check for empty values
    const keyValues = getAllKeyValues(data);
    for (const [key, value] of Object.entries(keyValues)) {
      if (value === "" || value === null || value === undefined) {
        result.warnings.push(`Empty value for key: ${key}`);
      }
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(`JSON parsing error: ${error}`);
  }

  return result;
}

/**
 * Create a backup of a file
 */
export function createBackup(filePath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${filePath}.backup.${timestamp}`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * Get all translation files in a directory
 */
export function getTranslationFiles(directory: string): string[] {
  try {
    const files = fs.readdirSync(directory);
    return files
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.join(directory, file))
      .sort();
  } catch (error) {
    throw new Error(`Failed to read directory ${directory}: ${error}`);
  }
}

/**
 * Format a key path for display
 */
export function formatKeyPath(keyPath: string): string {
  return keyPath.replace(/\./g, " → ");
}

/**
 * Get the depth of a key path
 */
export function getKeyDepth(keyPath: string): number {
  return keyPath.split(".").length - 1;
}

/**
 * Check if a key path is valid
 */
export function isValidKeyPath(keyPath: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/.test(keyPath);
}
