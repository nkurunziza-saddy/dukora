/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";
import * as path from "path";

const LANGUAGES = {
  en: "English",
  fr: "French",
  rw: "Kinyarwanda",
  sw: "Swahili",
} as const;

const TRANSLATION_APIS = {
  google: {
    baseUrl: "https://translate.googleapis.com/translate_a/single",
    params: (text: string, target: string) =>
      `?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(text)}`,
  },

  mymemory: {
    baseUrl: "https://api.mymemory.translated.net/get",
    params: (text: string, target: string) =>
      `?q=${encodeURIComponent(text)}&langpair=en|${target}`,
  },

  libretranslate: {
    baseUrl: "https://libretranslate.de/translate",
    method: "POST",
  },
};

interface TranslationResult {
  text: string;
  success: boolean;
  api?: string;
}

interface SyncStats {
  totalKeys: number;
  missingKeys: number;
  extraKeys: number;
  translatedKeys: number;
  linesDiff: number;
}

class I18nSyncer {
  private messagesDir: string;
  private rateLimitDelay: number = 100;

  constructor(messagesDir: string = "src/i18n/messages") {
    this.messagesDir = messagesDir;
  }

  private async translateText(
    text: string,
    targetLang: string
  ): Promise<TranslationResult> {
    try {
      const googleResult = await this.translateWithGoogle(text, targetLang);
      if (googleResult.success) {
        return { ...googleResult, api: "google" };
      }
    } catch (error) {
      console.warn(`Google Translate failed: ${error}`);
    }

    try {
      const myMemoryResult = await this.translateWithMyMemory(text, targetLang);
      if (myMemoryResult.success) {
        return { ...myMemoryResult, api: "mymemory" };
      }
    } catch (error) {
      console.warn(`MyMemory failed: ${error}`);
    }

    try {
      const libreResult = await this.translateWithLibreTranslate(
        text,
        targetLang
      );
      if (libreResult.success) {
        return { ...libreResult, api: "libretranslate" };
      }
    } catch (error) {
      console.warn(`LibreTranslate failed: ${error}`);
    }

    return { text, success: false };
  }

  private async translateWithGoogle(
    text: string,
    targetLang: string
  ): Promise<TranslationResult> {
    const url =
      TRANSLATION_APIS.google.baseUrl +
      TRANSLATION_APIS.google.params(text, targetLang);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data[0]?.[0]?.[0];

    if (!translatedText) {
      throw new Error("No translation returned");
    }

    return { text: translatedText, success: true };
  }

  private async translateWithMyMemory(
    text: string,
    targetLang: string
  ): Promise<TranslationResult> {
    const url =
      TRANSLATION_APIS.mymemory.baseUrl +
      TRANSLATION_APIS.mymemory.params(text, targetLang);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as any;
    const translatedText = data.responseData?.translatedText;

    if (!translatedText || data.responseStatus !== 200) {
      throw new Error("Translation failed");
    }

    return { text: translatedText, success: true };
  }

  private async translateWithLibreTranslate(
    text: string,
    targetLang: string
  ): Promise<TranslationResult> {
    const response = await fetch(TRANSLATION_APIS.libretranslate.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: targetLang,
        format: "text",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.translatedText;

    if (!translatedText) {
      throw new Error("No translation returned");
    }

    return { text: translatedText, success: true };
  }

  private getAllKeys(obj: any, prefix: string = ""): Set<string> {
    const keys = new Set<string>();

    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        const currentKey = prefix ? `${prefix}.${key}` : key;
        keys.add(currentKey);

        if (typeof obj[key] === "object" && obj[key] !== null) {
          this.getAllKeys(obj[key], currentKey).forEach((k) => keys.add(k));
        }
      });
    }

    return keys;
  }

  private getNestedValue(obj: any, keyPath: string): any {
    return keyPath.split(".").reduce((current, key) => {
      return current && typeof current === "object" ? current[key] : undefined;
    }, obj);
  }

  private setNestedValue(obj: any, keyPath: string, value: any): void {
    const keys = keyPath.split(".");
    const lastKey = keys.pop()!;

    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  private loadJsonFile(filepath: string): any {
    try {
      const content = fs.readFileSync(filepath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error loading ${filepath}:`, error);
      return {};
    }
  }

  private saveJsonFile(filepath: string, data: any): void {
    try {
      const content = JSON.stringify(data, null, 2) + "\n";
      fs.writeFileSync(filepath, content, "utf-8");
      console.log(`✓ Updated ${filepath}`);
    } catch (error) {
      console.error(`Error saving ${filepath}:`, error);
    }
  }

  private countLines(filepath: string): number {
    try {
      const content = fs.readFileSync(filepath, "utf-8");
      return content.split("\n").length;
    } catch (error) {
      console.log("Lines count error", error);
      return 0;
    }
  }

  private needsSync(enFile: string, langFile: string): boolean {
    if (!fs.existsSync(langFile)) {
      return true;
    }

    const enLines = this.countLines(enFile);
    const langLines = this.countLines(langFile);

    return Math.abs(enLines - langLines) > 2; // Allow small differences
  }

  private async syncLanguageFile(
    enData: any,
    langCode: string
  ): Promise<SyncStats> {
    const langFile = path.join(this.messagesDir, `${langCode}.json`);

    if (!fs.existsSync(langFile)) {
      console.warn(`Warning: ${langFile} not found, skipping...`);
      return {
        totalKeys: 0,
        missingKeys: 0,
        extraKeys: 0,
        translatedKeys: 0,
        linesDiff: 0,
      };
    }

    console.log(
      `\nProcessing ${langCode} (${LANGUAGES[langCode as keyof typeof LANGUAGES]})...`
    );

    const currentData = this.loadJsonFile(langFile);
    const enKeys = this.getAllKeys(enData);
    const currentKeys = this.getAllKeys(currentData);

    const missingKeys = Array.from(enKeys).filter(
      (key) => !currentKeys.has(key)
    );
    const extraKeys = Array.from(currentKeys).filter((key) => !enKeys.has(key));

    console.log(`  Total keys: ${enKeys.size}`);
    console.log(`  Missing keys: ${missingKeys.length}`);
    console.log(`  Extra keys: ${extraKeys.length}`);

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`  No changes needed for ${langCode}`);
      return {
        totalKeys: enKeys.size,
        missingKeys: 0,
        extraKeys: 0,
        translatedKeys: 0,
        linesDiff: 0,
      };
    }

    const newData: any = {};
    let translatedCount = 0;

    for (const key of enKeys) {
      const enValue = this.getNestedValue(enData, key);
      const currentValue = this.getNestedValue(currentData, key);

      if (currentValue !== undefined) {
        this.setNestedValue(newData, key, currentValue);
      } else {
        const translation = await this.translateText(enValue, langCode);
        this.setNestedValue(newData, key, translation.text);

        if (translation.success) {
          console.log(
            `  ✓ Translated (${translation.api}): ${key} -> ${translation.text}`
          );
          translatedCount++;
        } else {
          console.warn(
            `  ⚠ Translation failed: ${key} -> ${translation.text}`
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, this.rateLimitDelay)
        );
      }
    }

    this.saveJsonFile(langFile, newData);

    return {
      totalKeys: enKeys.size,
      missingKeys: missingKeys.length,
      extraKeys: extraKeys.length,
      translatedKeys: translatedCount,
      linesDiff: this.countLines(langFile),
    };
  }

  async sync(): Promise<void> {
    if (!fs.existsSync(this.messagesDir)) {
      console.error(`Error: Messages directory not found: ${this.messagesDir}`);
      process.exit(1);
    }

    console.log("Starting enhanced i18n synchronization...");
    console.log(`Messages directory: ${this.messagesDir}`);

    const enFile = path.join(this.messagesDir, "en.json");
    const enData = this.loadJsonFile(enFile);

    if (!enData || Object.keys(enData).length === 0) {
      console.error("Error: Could not load English reference file");
      return;
    }

    console.log(`✓ Loaded reference file: ${enFile}`);
    console.log(`✓ Reference file has ${this.countLines(enFile)} lines`);

    const targetLanguages = ["fr", "rw", "sw"] as const;
    const syncPromises: Promise<SyncStats>[] = [];

    for (const langCode of targetLanguages) {
      const langFile = path.join(this.messagesDir, `${langCode}.json`);

      if (this.needsSync(enFile, langFile)) {
        console.log(
          `\n📋 ${langCode} needs sync (line count difference detected)`
        );
        syncPromises.push(this.syncLanguageFile(enData, langCode));
      } else {
        console.log(`\n✓ ${langCode} already in sync`);
      }
    }

    if (syncPromises.length === 0) {
      console.log("\n✓ All language files are already in sync!");
      return;
    }

    const results = await Promise.all(syncPromises);

    console.log("\n📊 Synchronization Summary:");
    results.forEach((stats, index) => {
      const langCode = targetLanguages[index];
      if (stats.totalKeys > 0) {
        console.log(
          `  ${langCode}: ${stats.translatedKeys} translated, ${stats.missingKeys} added, ${stats.extraKeys} removed`
        );
      }
    });

    console.log("\n✅ Enhanced i18n synchronization completed!");
  }
}

async function main() {
  const args = process.argv.slice(2);
  const messagesDir = args[0] || "src/i18n/messages";

  const syncer = new I18nSyncer(messagesDir);
  await syncer.sync();
}

if (require.main === module) {
  main().catch(console.error);
}

export { I18nSyncer };
