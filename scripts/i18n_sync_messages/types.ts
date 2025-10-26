/**
 * Types for i18n synchronization utilities
 */

export interface TranslationKey {
  path: string;
  value: string;
  level: number;
}

export interface TranslationFile {
  filename: string;
  language: string;
  data: Record<string, unknown>;
  keys: Set<string>;
  keyCount: number;
  lineCount: number;
}

export interface MissingKeysReport {
  language: string;
  missingKeys: string[];
  extraKeys: string[];
  totalMissing: number;
  totalExtra: number;
}

export interface SyncOptions {
  sourceFile: string;
  targetFiles: string[];
  dryRun?: boolean;
  backup?: boolean;
  verbose?: boolean;
}

export interface SyncResult {
  success: boolean;
  filesProcessed: number;
  keysAdded: number;
  keysRemoved: number;
  errors: string[];
  warnings: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  keyCount: number;
  lineCount: number;
}

export interface ComparisonResult {
  sourceFile: string;
  targetFile: string;
  missingKeys: string[];
  extraKeys: string[];
  commonKeys: string[];
  totalMissing: number;
  totalExtra: number;
  totalCommon: number;
}
