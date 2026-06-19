/**
 * R2 prefix renumbering script.
 *
 * Renames folders from old numbering (pre-4-new-categories) to new numbering.
 * Old → New mapping: old_num + 3 = new_num (for categories that shifted).
 *
 * Usage: npx tsx scripts/rename-r2-prefixes.ts [--dry-run]
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// ---------------------------------------------------------------------------
// Load .env.local (Next.js convention) before anything else
// ---------------------------------------------------------------------------

const ENV_PATH = resolve(process.cwd(), ".env.local");
try {
  const src = readFileSync(ENV_PATH, "utf-8");
  for (const line of src.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
  console.log(`Loaded env from ${ENV_PATH}\n`);
} catch {
  console.log("No .env.local found, using existing env vars.\n");
}

// ---------------------------------------------------------------------------
// Configuration – same auth as src/lib/r2.ts
// ---------------------------------------------------------------------------

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${getEnvVar("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: getEnvVar("R2_ACCESS_KEY_ID"),
    secretAccessKey: getEnvVar("R2_SECRET_ACCESS_KEY"),
  },
});

const BUCKET = getEnvVar("R2_BUCKET_NAME");
const DRY_RUN = process.argv.includes("--dry-run");

// ---------------------------------------------------------------------------
// Old → New number mapping (shifted +3)
// ---------------------------------------------------------------------------

const NUMBER_MAP: Record<number, number> = {
  1: 4,
  2: 5,
  3: 6,
  4: 7,
  5: 8,
  6: 9,
  7: 10,
  8: 11,
  9: 12,
  10: 13,
  11: 14,
};

// Old 0 (AMFAR) is intentionally excluded – replaced by CHOPARD.

// Old photo numbers that need shifting
const PHOTO_NUMBER_MAP: Record<number, number> = {
  1: 4,
  2: 5,
  3: 6,
  4: 7,
  5: 8,
  6: 9,
  7: 10,
};

// ---------------------------------------------------------------------------
// Folder definitions (matching media-map.ts prefixes)
// ---------------------------------------------------------------------------

const FOLDERS = [
  { prefix: "1_VIDEOS", numberMap: NUMBER_MAP },
  { prefix: "2_PHOTOS", numberMap: PHOTO_NUMBER_MAP },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function listAllObjects(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const cmd = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
    const res = await client.send(cmd);
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

function getFolderPrefixPattern(oldNum: number, folder: string): RegExp {
  // Match exactly oldNum followed by underscore + non-digit (avoids 1_ also matching 10_, 11_, etc.)
  // e.g. "1_VIDEOS/1_CANNES/01.mp4" matches for oldNum=1
  //      "1_VIDEOS/1_" does NOT match "1_VIDEOS/10_" because 0 is a digit
  return new RegExp(`^${escapeRegex(folder)}/${oldNum}_(?!\\d)`);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(DRY_RUN ? "🔍 DRY RUN – no changes will be made.\n" : "⚠️  LIVE RUN – objects will be copied & deleted.\n");

  for (const { prefix: folder, numberMap } of FOLDERS) {
    console.log(`\n📁 ${folder}/`);

    // Process from highest old number to lowest to avoid prefix collisions
    const oldNums = Object.keys(numberMap).map(Number).sort((a, b) => b - a);

    for (const oldNum of oldNums) {
      const newNum = numberMap[oldNum];
      const pattern = getFolderPrefixPattern(oldNum, folder);

      console.log(`  ${oldNum}_* → ${newNum}_* ...`);

      // List with broader prefix then filter precisely with regex
      const rawKeys = await listAllObjects(`${folder}/${oldNum}_`);
      const allKeys = rawKeys.filter((k) => pattern.test(k));

      if (allKeys.length === 0) {
        console.log(`    (no objects found)`);
        continue;
      }

      for (const oldKey of allKeys) {
        // Replace only the number portion in the folder segment
        // e.g. "1_VIDEOS/1_CANNES/01_foo.mp4" → "1_VIDEOS/4_CANNES/01_foo.mp4"
        const newKey = oldKey.replace(pattern, `${folder}/${newNum}_`);

        if (oldKey === newKey) {
          console.log(`    ⚠ skip (no change): ${oldKey}`);
          continue;
        }

        if (DRY_RUN) {
          console.log(`    [dry] ${oldKey} → ${newKey}`);
        } else {
          // S3/R2 rename = copy + delete
          await client.send(
            new CopyObjectCommand({
              Bucket: BUCKET,
              CopySource: `${BUCKET}/${oldKey}`,
              Key: newKey,
            }),
          );
          await client.send(
            new DeleteObjectCommand({
              Bucket: BUCKET,
              Key: oldKey,
            }),
          );
          console.log(`    ✓ ${oldKey} → ${newKey}`);
        }
      }
    }
  }

  console.log(DRY_RUN ? "\n✅ Dry run complete. Run without --dry-run to apply changes." : "\n✅ Rename complete.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
