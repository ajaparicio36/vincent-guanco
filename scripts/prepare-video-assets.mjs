/** Run with Node 24: node --env-file=.env.local scripts/prepare-video-assets.mjs */
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import {
  S3Client, ListObjectsV2Command, GetObjectCommand, HeadObjectCommand, PutObjectCommand,
} from "@aws-sdk/client-s3";
import { VIDEO_CATEGORIES, THUMBNAILS_PREFIX, MILLION_VIEWS_PREFIX } from "../src/data/media-map.ts";

const revision = "2026-10-09-v1";
const manifestPath = new URL("../src/data/video-assets.json", import.meta.url);
const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};
const bucket = required("R2_BUCKET_NAME");
const publicBase = required("R2_PUBLIC_URL").replace(/\/$/, "");
const client = new S3Client({
  region: "auto",
  endpoint: `https://${required("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: required("R2_ACCESS_KEY_ID"), secretAccessKey: required("R2_SECRET_ACCESS_KEY") },
});
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const run = (command, args) => new Promise((resolve, reject) => {
  const process = spawn(command, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  process.stdout.on("data", (chunk) => { stdout += chunk; });
  process.stderr.on("data", (chunk) => { stderr += chunk; });
  process.on("error", reject);
  process.on("close", (code) => code === 0 ? resolve(stdout) : reject(new Error(`${command} exited ${code}: ${stderr}`)));
});
async function list(prefix) {
  const objects = [];
  let token;
  do {
    const result = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${prefix}/`, ContinuationToken: token }));
    objects.push(...(result.Contents ?? []).filter((object) => object.Key?.endsWith(".mp4")));
    token = result.NextContinuationToken;
  } while (token);
  return objects;
}
async function put(path, key, type, sourceEtag) {
  // Content-addressed derivative keys leave originals and previous revisions intact.
  try {
    const existing = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    if (existing.Metadata?.["source-etag"] !== sourceEtag) throw new Error(`Unexpected existing derivative: ${key}`);
    return;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode !== 404) throw error;
  }
  await client.send(new PutObjectCommand({
    Bucket: bucket, Key: key, Body: await readFile(path), ContentType: type,
    CacheControl: "public, max-age=31536000, immutable", IfNoneMatch: "*",
    Metadata: { "source-etag": sourceEtag, "encoding-revision": revision },
  }));
}
function assertFaststart(buffer) {
  let offset = 0;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    if (type === "moov") return;
    if (type === "mdat") break;
    const size = buffer.readUInt32BE(offset);
    if (size < 8) break;
    offset += size;
  }
  throw new Error("MP4 index must precede media data");
}
async function prepare(object) {
  const key = object.Key;
  const sourceEtag = object.ETag.replaceAll('"', "");
  const id = createHash("sha256").update(`${revision}:${key}:${sourceEtag}`).digest("hex").slice(0, 20);
  const prefix = `WEB_VIDEO/${revision}/${id}`;
  const desktopKey = `${prefix}/desktop.mp4`;
  const mobileKey = `${prefix}/mobile.mp4`;
  const posterKey = `${prefix}/poster.jpg`;
  const existing = manifest[key];
  if (existing?.desktopKey === desktopKey) {
    for (const assetKey of [desktopKey, mobileKey, posterKey]) {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: assetKey }));
    }
    console.log(`Verified existing ${key}`);
    return;
  }
  const dir = await mkdtemp(join(tmpdir(), "vincent-video-"));
  try {
    const source = join(dir, basename(key));
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key, IfMatch: object.ETag }));
    if (!result.Body) throw new Error(`Empty source ${key}`);
    await pipeline(result.Body, createWriteStream(source));
    const info = JSON.parse(await run("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", source]));
    const video = info.streams.find((stream) => stream.codec_type === "video");
    if (!video) throw new Error(`Missing video stream: ${key}`);
    if (["smpte2084", "arib-std-b67"].includes(video.color_transfer)) throw new Error(`HDR needs explicit tone mapping: ${key}`);
    const [numerator, denominator] = video.avg_frame_rate.split("/").map(Number);
    const fps = Math.min(30, numerator / denominator);
    if (!Number.isFinite(fps) || fps <= 0) throw new Error(`Invalid frame rate: ${key}`);
    const [width, height] = video.width >= video.height ? [1280, 720] : [720, 1280];
    const desktop = join(dir, "desktop.mp4");
    const mobile = join(dir, "mobile.mp4");
    const poster = join(dir, "poster.jpg");
    const common = ["-hide_banner", "-loglevel", "error", "-n", "-i", source];
    await run("ffmpeg", [...common, "-map", "0:v:0", "-map", "0:a:0?", "-c", "copy", "-movflags", "+faststart", desktop]);
    await run("ffmpeg", [...common, "-map", "0:v:0", "-map", "0:a:0?", "-vf",
      `scale=w='min(${width},iw)':h='min(${height},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=${fps}`,
      "-c:v", "libx264", "-preset", "medium", "-profile:v", "main", "-level:v", "3.1", "-pix_fmt", "yuv420p",
      "-crf", "23", "-maxrate", "2500k", "-bufsize", "5000k", "-c:a", "aac", "-b:a", "96k", "-ac", "2", "-ar", "48000",
      "-movflags", "+faststart", "-map_metadata", "-1", mobile]);
    await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-n", "-i", mobile, "-frames:v", "1", "-q:v", "3", poster]);
    assertFaststart(await readFile(desktop));
    assertFaststart(await readFile(mobile));
    await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", mobile, "-f", "null", "-"]);
    await put(desktop, desktopKey, "video/mp4", sourceEtag);
    await put(mobile, mobileKey, "video/mp4", sourceEtag);
    await put(poster, posterKey, "image/jpeg", sourceEtag);
    for (const assetKey of [desktopKey, mobileKey]) {
      const response = await fetch(`${publicBase}/${assetKey}`, { headers: { Range: "bytes=0-65535" } });
      if (response.status !== 206 || response.headers.get("content-type") !== "video/mp4") throw new Error(`Invalid public video response: ${assetKey}`);
      assertFaststart(Buffer.from(await response.arrayBuffer()));
    }
    const mobileBytes = (await stat(mobile)).size;
    manifest[key] = { desktopKey, mobileKey, posterKey, sourceEtag, sourceBytes: object.Size, mobileBytes };
    await writeFile(new URL(`${manifestPath.href}.tmp`), `${JSON.stringify(manifest, null, 2)}\n`);
    await rename(new URL(`${manifestPath.href}.tmp`), manifestPath);
    console.log(JSON.stringify({ key, originalMB: +(object.Size / 1e6).toFixed(2), mobileMB: +(mobileBytes / 1e6).toFixed(2) }));
  } finally {
    if (resolve(dirname(dir)) !== resolve(tmpdir())) throw new Error("Temporary directory escaped the expected parent");
    await rm(dir, { recursive: true, force: true });
  }
}

try {
  const groups = await Promise.all(VIDEO_CATEGORIES.map(async (category) => {
    const objects = await list(category.r2Prefix);
    return category.visibleFileNames ? objects.filter((object) => category.visibleFileNames.includes(basename(object.Key))) : objects;
  }));
  const heroAndViral = await Promise.all([THUMBNAILS_PREFIX, MILLION_VIEWS_PREFIX, "HERO_MOBILE/2026-09-28"].map(list));
  const objects = [...new Map([...groups.flat(), ...heroAndViral.flat()].map((object) => [object.Key, object])).values()];
  console.log(`Preparing ${objects.length} currently selected videos; originals are retained.`);
  for (const object of objects) await prepare(object);
  console.log(`Complete: ${objects.length} videos verified.`);
} finally {
  client.destroy();
}
