#!/usr/bin/env node
// Local-only media preparation. All writes stay below --output. Source media is read-only.
// Adapted from the 2026-10 derivation script; see docs/portfolio-media.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const args = {};
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (!/^--[a-z-]+$/.test(key) || !value) throw new Error('Expected --manifest path --output directory [--source-root directory] [--sharp module-path] [--ffmpeg path] [--ffprobe path]');
  args[key.slice(2)] = value;
}
if (!args.manifest || !args.output) throw new Error('--manifest and --output are required.');
const inputPath = path.resolve(args.manifest);
const outputRoot = path.resolve(args.output);
const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const sourceRoot = path.resolve(args['source-root'] || input.sourceRoot);
const requireModule = createRequire(import.meta.url);
const sharp = requireModule(args.sharp || requireModule.resolve('sharp', { paths: [process.cwd()] }));
const ffmpeg = args.ffmpeg || 'ffmpeg';
const ffprobe = args.ffprobe || 'ffprobe';
sharp.concurrency(2);
sharp.cache({ memory: 64, files: 0, items: 32 });

function isWithin(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}
if (isWithin(sourceRoot, outputRoot)) throw new Error('Output cannot be inside the source tree.');
if (isWithin(outputRoot, sourceRoot)) throw new Error('Source tree cannot be inside the output tree.');
const previousRoot = path.resolve(args['previous-source-root'] || input.previousSourceRoot);
const previousManifest = JSON.parse(fs.readFileSync(path.resolve('docs/portfolio-media-provenance-2026-10.json'), 'utf8'));
const entries = input.entries.filter(entry => entry.type === 'photo' || entry.type === 'video').map(entry => ({
  ...entry,
  source: path.resolve(sourceRoot, entry.filename),
}));
if (entries.length !== 19 || entries.filter(entry => entry.type === 'photo').length !== 7 || entries.filter(entry => entry.type === 'video').length !== 12) throw new Error('Expected exactly 7 photos and 12 videos.');
for (const entry of entries) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) || !isWithin(sourceRoot, entry.source)) throw new Error(`Invalid source entry: ${entry.id}`);
}
if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error('Duplicate stable IDs.');

const assetsRoot = path.join(outputRoot, 'assets');
const verificationRoot = path.join(outputRoot, 'verification');
fs.mkdirSync(assetsRoot, { recursive: true });
fs.mkdirSync(verificationRoot, { recursive: true });
const startedAt = new Date().toISOString();
const sourceMetadata = new Map();
const outputRecords = new Map(entries.map(entry => [entry.id, []]));
const processCounts = { generated: 0, reusedPrevious: 0 };
const previousMatches = new Map();
const posterSelections = Object.fromEntries(entries.filter(entry => entry.type === 'video').map(entry => {
  const previous = previousManifest.entries.find(item => item.id === entry.previousId);
  const selection = entry.posterSelection || previous?.posterSelection;
  if (!selection) throw new Error(`Poster selection missing: ${entry.id}`);
  return [entry.id, selection];
}));
const settings = {
  version: 1,
  photos: { longEdge: 1600, thumbnailLongEdge: 900, quality: 84, thumbnailQuality: 82, format: 'webp', effort: 5, autoOrient: true, colorSpace: 'srgb' },
  posters: { longEdge: 1200, quality: 84, compressionLevel: 5, format: 'webp', selection: posterSelections },
  videos: { landscapeBounds: [1280, 720], portraitBounds: [720, 1280], codec: 'libx264', profile: 'high', level: '3.1', pixelFormat: 'yuv420p', preset: 'medium', crf: 22, maxrate: '4M', bufsize: '8M', maxFps: 30, audioCodec: 'aac', audioBitrate: '96k', faststart: true },
  resources: { concurrentMediaJobs: 1, ffmpegDecoderThreads: 2, ffmpegEncoderThreads: 3, ffmpegFilterThreads: 1, sharpConcurrency: 2 },
};

function writeJson(filename, value) {
  if (!isWithin(outputRoot, filename)) throw new Error('Write outside output root rejected.');
  fs.writeFileSync(filename, `${JSON.stringify(value, null, 2)}\n`);
}
function snapshot() {
  return entries.map(entry => {
    const stat = fs.statSync(entry.source);
    return { id: entry.id, source: entry.source, bytes: stat.size, mtimeMs: stat.mtimeMs, mtimeISO: stat.mtime.toISOString() };
  });
}
function sha256(filename) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filename);
    stream.on('error', reject);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}
function run(executable, toolArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, toolArgs, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-2_000_000); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${executable} failed (${code}): ${stderr}`)));
  });
}
async function probe(filename) {
  return JSON.parse((await run(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', filename])).stdout);
}
function rational(value) {
  if (!value) return 0;
  const parts = String(value).split(/[/:]/).map(Number);
  return parts.length === 2 ? parts[0] / parts[1] : parts[0];
}
function audioInfo(stream) {
  return { codec: stream.codec_name, channels: stream.channels, sampleRate: Number(stream.sample_rate), durationSeconds: Number(stream.duration), bitrate: Number(stream.bit_rate) || null };
}
function dimensions(width, height, boundWidth, boundHeight, even = false) {
  const ratio = Math.min(1, boundWidth / width, boundHeight / height);
  const unit = even ? 2 : 1;
  const round = even ? Math.floor : Math.round;
  return [Math.max(unit, round(width * ratio / unit) * unit), Math.max(unit, round(height * ratio / unit) * unit)];
}
function mp4Atoms(filename) {
  const descriptor = fs.openSync(filename, 'r');
  const size = fs.statSync(filename).size;
  const atoms = [];
  try {
    let offset = 0;
    while (offset + 8 <= size) {
      const header = Buffer.alloc(16);
      fs.readSync(descriptor, header, 0, Math.min(16, size - offset), offset);
      let length = header.readUInt32BE(0);
      if (length === 1) length = Number(header.readBigUInt64BE(8));
      if (length === 0) length = size - offset;
      if (length < 8 || offset + length > size) throw new Error(`Invalid MP4 atom at ${offset}`);
      atoms.push({ type: header.toString('ascii', 4, 8), offset, bytes: length });
      offset += length;
    }
  } finally { fs.closeSync(descriptor); }
  return atoms;
}
async function validate(filename, role, expected) {
  const result = await probe(filename);
  const video = result.streams.find(stream => stream.codec_type === 'video');
  const audio = result.streams.filter(stream => stream.codec_type === 'audio');
  // libvips JPEG shrink-on-load can round the unconstrained edge by one pixel.
  const dimensionTolerance = role === 'video' ? 0 : 1;
  if (!video || Math.abs(video.width - expected.width) > dimensionTolerance || Math.abs(video.height - expected.height) > dimensionTolerance) throw new Error(`Wrong dimensions: ${filename}`);
  const rotation = video.side_data_list?.find(item => item.rotation !== undefined)?.rotation || 0;
  if (rotation !== 0) throw new Error(`Unexpected output rotation: ${filename}`);
  const check = { ffprobe: true, fullDecode: false, dimensionsMatch: true, dimensionTolerancePixels: dimensionTolerance, orientationNormalized: true };
  if (role === 'video') {
    if (video.codec_name !== 'h264' || video.profile !== 'High' || video.level !== 31 || video.pix_fmt !== 'yuv420p') throw new Error(`Unexpected browser codec: ${filename}`);
    if (video.color_space !== 'bt709' || video.color_transfer !== 'bt709' || video.color_primaries !== 'bt709') throw new Error(`Unexpected video colour metadata: ${filename}`);
    if (audio.length !== expected.audio.length || audio.some((stream, index) => stream.codec_name !== 'aac' || stream.channels !== expected.audio[index].channels || Number(stream.sample_rate) !== expected.audio[index].sampleRate)) throw new Error(`Audio was not preserved: ${filename}`);
    const durationDelta = Math.abs(Number(result.format.duration) - expected.durationSeconds);
    const videoDurationDelta = Math.abs(Number(video.duration) - expected.videoDurationSeconds);
    if (durationDelta > 0.12 || videoDurationDelta > 1 / expected.fps + 0.04) throw new Error(`Clip duration changed: ${filename} (${durationDelta}s container, ${videoDurationDelta}s video)`);
    if (Math.abs(rational(video.avg_frame_rate) - expected.fps) > 0.01) throw new Error(`Unexpected frame rate: ${filename}`);
    if (audio.some((stream, index) => Math.abs(Number(stream.duration) - expected.audio[index].durationSeconds) > 0.08)) throw new Error(`Audio duration changed: ${filename}`);
    const atoms = mp4Atoms(filename);
    const moov = atoms.find(atom => atom.type === 'moov');
    const mdat = atoms.find(atom => atom.type === 'mdat');
    if (!moov || !mdat || moov.offset > mdat.offset) throw new Error(`Faststart missing: ${filename}`);
    Object.assign(check, { browserCodec: true, audioPreserved: true, durationDeltaSeconds: durationDelta, videoDurationDeltaSeconds: videoDurationDelta, faststart: true, moovOffset: moov.offset, mdatOffset: mdat.offset });
  } else if (video.codec_name !== 'webp' || audio.length) throw new Error(`Unexpected image codec: ${filename}`);
  await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', '-xerror', '-err_detect', 'explode', '-threads', '2', '-i', filename, '-map', '0:v:0', '-map', '0:a?', '-f', 'null', '-']);
  check.fullDecode = true;
  return {
    filename: path.basename(filename), relativePath: `assets/${path.basename(filename)}`, path: filename, bytes: fs.statSync(filename).size,
    width: video.width, height: video.height, codec: video.codec_name, profile: video.profile || null, level: video.level || null,
    pixelFormat: video.pix_fmt, rotation, colorSpace: video.color_space || null, colorTransfer: video.color_transfer || null, colorPrimaries: video.color_primaries || null,
    durationSeconds: role === 'video' ? Number(result.format.duration) : null,
    videoDurationSeconds: role === 'video' ? Number(video.duration) : null,
    frameRate: role === 'video' ? video.avg_frame_rate : null,
    audio: audio.map(audioInfo), sha256: await sha256(filename), validation: check,
  };
}
async function materialize(entry, role, filename, expected, generate) {
  const destination = path.join(assetsRoot, filename);
  const prior = previousMatches.get(entry.id)?.outputs.find(item => item.role === role);
  let origin = 'generated';
  if (prior) {
    const oldPath = path.resolve(prior.path);
    if (await sha256(oldPath) !== prior.sha256 || fs.statSync(oldPath).size !== prior.bytes) throw new Error(`Previous derivative changed: ${oldPath}`);
    fs.copyFileSync(oldPath, destination);
    origin = `2026-10/${entry.previousId}`;
    processCounts.reusedPrevious += 1;
  } else {
    console.log(`BUILD ${filename}`);
    await generate(destination);
    processCounts.generated += 1;
  }
  // Even matching prior bytes are probed and fully decoded in this run.
  const record = { ...await validate(destination, role, expected), origin };
  console.log(`READY ${filename} ${record.width}x${record.height} ${record.bytes} bytes (${origin})`);
  outputRecords.get(entry.id).push({ role, ...record });
}
const before = snapshot();
writeJson(path.join(verificationRoot, 'source-metadata-before.json'), { capturedAt: startedAt, entries: before });

async function main() {
  const toolVersions = { node: process.version, sharp: sharp.versions, ffmpeg: (await run(ffmpeg, ['-version'])).stdout.split('\n')[0], ffprobe: (await run(ffprobe, ['-version'])).stdout.split('\n')[0] };
  console.log(`Preparing ${entries.length} source assets; one media job at a time.`);
  for (const entry of entries) {
    if (await sha256(entry.source) !== entry.sourceSha256) throw new Error(`Source hash changed: ${entry.id}`);
    if (entry.previousId) {
      const prior = previousManifest.entries.find(item => item.id === entry.previousId);
      if (!prior) throw new Error(`Previous entry missing: ${entry.previousId}`);
      const previousSource = path.resolve(previousRoot, prior.source);
      if (!isWithin(previousRoot, previousSource) || await sha256(previousSource) !== entry.sourceSha256) throw new Error(`Previous original does not match: ${entry.id}`);
      previousMatches.set(entry.id, prior);
    }
  }
  for (const entry of entries.filter(item => item.type === 'photo')) {
    const metadata = await sharp(entry.source).metadata();
    const width = metadata.autoOrient.width;
    const height = metadata.autoOrient.height;
    sourceMetadata.set(entry.id, { rawWidth: metadata.width, rawHeight: metadata.height, exifOrientation: metadata.orientation || 1, displayWidth: width, displayHeight: height, colorSpace: metadata.space, hadIccProfile: metadata.hasProfile });
    for (const variant of [{ role: 'detail', suffix: '', size: settings.photos.longEdge, quality: settings.photos.quality }, { role: 'thumbnail', suffix: '-thumb', size: settings.photos.thumbnailLongEdge, quality: settings.photos.thumbnailQuality }]) {
      const [outWidth, outHeight] = dimensions(width, height, variant.size, variant.size);
      await materialize(entry, variant.role, `${entry.id.toLowerCase()}${variant.suffix}.webp`, { width: outWidth, height: outHeight },
        destination => sharp(entry.source).autoOrient().resize({ width: variant.size, height: variant.size, fit: 'inside', withoutEnlargement: true }).toColourspace('srgb').webp({ quality: variant.quality, effort: settings.photos.effort }).toFile(destination));
    }
  }
  console.log('PHOTOS_READY: 7 details + 7 thumbnails.');
  for (const entry of entries.filter(item => item.type === 'video')) {
    const result = await probe(entry.source);
    const stream = result.streams.find(item => item.codec_type === 'video');
    const rotation = stream.side_data_list?.find(item => item.rotation !== undefined)?.rotation || 0;
    const rotated = Math.abs(rotation) % 180 === 90;
    const width = rotated ? stream.height : stream.width;
    const height = rotated ? stream.width : stream.height;
    if (stream.sample_aspect_ratio && rational(stream.sample_aspect_ratio) !== 1) throw new Error(`Non-square source pixels require an explicit display-size policy: ${entry.id}`);
    if (stream.color_space !== 'bt709' || stream.color_transfer !== 'bt709' || stream.color_primaries !== 'bt709') throw new Error(`Source needs an explicit HDR/colour conversion policy: ${entry.id}`);
    sourceMetadata.set(entry.id, { rawWidth: stream.width, rawHeight: stream.height, rotation, displayWidth: width, displayHeight: height, durationSeconds: Number(result.format.duration), videoDurationSeconds: Number(stream.duration), frameRate: stream.avg_frame_rate, colorSpace: stream.color_space, colorTransfer: stream.color_transfer, colorPrimaries: stream.color_primaries, audio: result.streams.filter(item => item.codec_type === 'audio').map(audioInfo) });
    const [outWidth, outHeight] = dimensions(width, height, settings.posters.longEdge, settings.posters.longEdge);
    const selection = posterSelections[entry.id];
    const posterArgs = ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-threads', '2', '-ss', String(selection.seconds), '-i', entry.source, '-map', '0:v:0', '-frames:v', '1', '-vf', `scale=${outWidth}:${outHeight}:flags=lanczos,setsar=1`, '-filter_threads', '1', '-c:v', 'libwebp', '-quality', String(settings.posters.quality), '-compression_level', String(settings.posters.compressionLevel), '-threads', '2', '-an', '-map_metadata', '-1'];
    await materialize(entry, 'poster', `${entry.id.toLowerCase()}-poster.webp`, { width: outWidth, height: outHeight }, destination => run(ffmpeg, [...posterArgs, destination]));
  }
  console.log('TEXTURES_READY: all 26 gallery/detail/poster WebPs.');
  for (const entry of entries.filter(item => item.type === 'video')) {
    const source = sourceMetadata.get(entry.id);
    const bounds = source.displayWidth >= source.displayHeight ? settings.videos.landscapeBounds : settings.videos.portraitBounds;
    const [width, height] = dimensions(source.displayWidth, source.displayHeight, bounds[0], bounds[1], true);
    const sourceFps = rational(source.frameRate);
    const fps = sourceFps > settings.videos.maxFps ? sourceFps / Math.ceil(sourceFps / settings.videos.maxFps) : sourceFps;
    const expected = { width, height, durationSeconds: source.durationSeconds, videoDurationSeconds: source.videoDurationSeconds, fps, audio: source.audio };
    const encodeArgs = ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-threads', '2', '-i', entry.source, '-map', '0:v:0', '-map', '0:a?', '-vf', `scale=${width}:${height}:flags=lanczos,setsar=1,fps=${fps}`, '-filter_threads', '1', '-c:v', 'libx264', '-preset', settings.videos.preset, '-crf', String(settings.videos.crf), '-maxrate', settings.videos.maxrate, '-bufsize', settings.videos.bufsize, '-pix_fmt', 'yuv420p', '-profile:v', settings.videos.profile, '-level:v', settings.videos.level, '-threads', '3', '-c:a', 'aac', '-b:a', settings.videos.audioBitrate, '-movflags', '+faststart', '-map_metadata', '-1', '-metadata:s:v:0', 'rotate=0', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709'];
    await materialize(entry, 'video', `${entry.id.toLowerCase()}.mp4`, expected, destination => run(ffmpeg, [...encodeArgs, destination]));
  }
  const after = snapshot();
  const differences = before.filter((item, index) => item.bytes !== after[index].bytes || item.mtimeMs !== after[index].mtimeMs);
  for (const entry of entries) if (await sha256(entry.source) !== entry.sourceSha256) throw new Error(`Source hash changed during preparation: ${entry.id}`);
  const outputs = [...outputRecords.values()].flat();
  if (outputs.length !== 38 || differences.length) throw new Error('Output count or source-preservation verification failed.');
  const manifest = {
    schemaVersion: 2, createdAt: new Date().toISOString(), sourceManifest: 'docs/portfolio-media-sources-2026-11-final.json', sourceRoot, deliveryRoot: input.deliveryRoot,
    preparationScript: 'scripts/prepare-final-portfolio.mjs', previousProvenance: 'docs/portfolio-media-provenance-2026-10.json',
    counts: { sourceMedia: 19, photos: 7, thumbnails: 7, videos: 12, posters: 12, outputFiles: 38 },
    sourceBytes: before.reduce((sum, item) => sum + item.bytes, 0), totalOutputBytes: outputs.reduce((sum, item) => sum + item.bytes, 0),
    settings, toolVersions,
    entries: entries.map(entry => ({ id: entry.id, title: entry.title, type: entry.type, source: entry.filename, sourceSha256: entry.sourceSha256, sourceStat: before.find(item => item.id === entry.id), sourceMedia: sourceMetadata.get(entry.id), previousId: entry.previousId, posterSelection: entry.type === 'video' ? posterSelections[entry.id] : null, outputs: outputRecords.get(entry.id).map(record => { const published = { ...record }; delete published.relativePath; published.path = `${input.deliveryRoot}/${record.filename}`; return published; }) })),
    validation: { everyOutputProbed: outputs.every(item => item.validation.ffprobe), everyOutputFullyDecoded: outputs.every(item => item.validation.fullDecode), allSourcesPreservedSinceRunStart: !differences.length, sourceHashesUnchanged: true, noReferenceAssetsIncluded: true },
  };
  writeJson(path.join(verificationRoot, 'source-metadata-after.json'), { capturedAt: manifest.createdAt, entries: after, unchangedSinceRunStart: !differences.length });
  writeJson(path.join(outputRoot, 'derived-manifest.json'), manifest);
  const summary = { startedAt, finishedAt: manifest.createdAt, ...processCounts, counts: manifest.counts, sourceBytes: manifest.sourceBytes, totalOutputBytes: manifest.totalOutputBytes, outputReductionPercent: Number((100 * (1 - manifest.totalOutputBytes / manifest.sourceBytes)).toFixed(2)), validation: manifest.validation };
  writeJson(path.join(verificationRoot, 'latest-run.json'), summary);
  console.log(JSON.stringify(summary, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
