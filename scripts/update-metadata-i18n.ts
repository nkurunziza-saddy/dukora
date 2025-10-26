#!/usr/bin/env tsx

/**
 * Script to update all pages to use internationalized metadata
 * This script will replace constructMetadata with constructI18nMetadata
 * and convert static metadata exports to generateMetadata functions
 */

import * as fs from "node:fs";

interface PageUpdate {
  filePath: string;
  pageKey: string;
  hasCanonicalUrl?: boolean;
}

// Define page mappings
const PAGE_MAPPINGS: PageUpdate[] = [
  {
    filePath: "src/app/[locale]/(protected)/inventory/page.tsx",
    pageKey: "inventory",
  },
  {
    filePath: "src/app/[locale]/(protected)/suppliers/page.tsx",
    pageKey: "suppliers",
  },
  {
    filePath: "src/app/[locale]/(protected)/transactions/page.tsx",
    pageKey: "transactions",
  },
  { filePath: "src/app/[locale]/(protected)/sales/page.tsx", pageKey: "sales" },
  {
    filePath: "src/app/[locale]/(protected)/analytics/page.tsx",
    pageKey: "analytics",
  },
  {
    filePath: "src/app/[locale]/(protected)/commerce/page.tsx",
    pageKey: "commerce",
  },
  {
    filePath: "src/app/[locale]/(protected)/payments/page.tsx",
    pageKey: "payments",
  },
  { filePath: "src/app/[locale]/(protected)/users/page.tsx", pageKey: "users" },
  {
    filePath: "src/app/[locale]/(protected)/settings/page.tsx",
    pageKey: "settings",
  },
  {
    filePath: "src/app/[locale]/(protected)/scheduler/page.tsx",
    pageKey: "scheduler",
  },
  {
    filePath: "src/app/[locale]/(protected)/ai-chat/layout.tsx",
    pageKey: "aiChat",
  },
  {
    filePath: "src/app/[locale]/(protected)/financial-calculator/page.tsx",
    pageKey: "financialCalculator",
  },
];

function updatePageMetadata(
  filePath: string,
  pageKey: string,
  _hasCanonicalUrl: boolean = false,
) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");

  // Check if already using constructI18nMetadata
  if (content.includes("constructI18nMetadata")) {
    console.log(`✅ Already updated: ${filePath}`);
    return;
  }

  let updatedContent = content;

  // Replace import
  updatedContent = updatedContent.replace(
    /import { constructMetadata } from "@\/lib\/config\/metadata";/g,
    'import { constructI18nMetadata } from "@/lib/config/i18n-metadata";',
  );

  // Replace static metadata export with generateMetadata function
  const metadataRegex =
    /export const metadata: Metadata = constructMetadata\(\{[\s\S]*?\}\);?/g;
  const metadataMatch = content.match(metadataRegex);

  if (metadataMatch) {
    const canonicalUrlMatch = metadataMatch[0].match(
      /canonicalUrl:\s*["']([^"']+)["']/,
    );
    const canonicalUrl = canonicalUrlMatch ? canonicalUrlMatch[1] : undefined;

    const generateMetadataFunction = `export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "${pageKey}"${canonicalUrl ? `,\n    canonicalUrl: "${canonicalUrl}"` : ""},
  });
}`;

    updatedContent = updatedContent.replace(
      metadataRegex,
      generateMetadataFunction,
    );
  }

  // Write updated content
  fs.writeFileSync(filePath, updatedContent, "utf-8");
  console.log(`✅ Updated: ${filePath}`);
}

function main() {
  console.log("🔄 Updating pages to use internationalized metadata...\n");

  let updatedCount = 0;
  let skippedCount = 0;

  for (const mapping of PAGE_MAPPINGS) {
    try {
      updatePageMetadata(
        mapping.filePath,
        mapping.pageKey,
        mapping.hasCanonicalUrl,
      );
      updatedCount++;
    } catch (error) {
      console.error(`❌ Error updating ${mapping.filePath}:`, error);
      skippedCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Updated: ${updatedCount} files`);
  console.log(`⚠️  Skipped: ${skippedCount} files`);
  console.log(`\n🎉 Metadata internationalization update complete!`);
}

if (require.main === module) {
  main();
}
