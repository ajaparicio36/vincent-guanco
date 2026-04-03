import "server-only";

import {
  S3Client,
  ListObjectsV2Command,
  type _Object,
} from "@aws-sdk/client-s3";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${getEnvVar("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: getEnvVar("R2_ACCESS_KEY_ID"),
        secretAccessKey: getEnvVar("R2_SECRET_ACCESS_KEY"),
      },
    });
  }
  return _client;
}

export interface MediaItem {
  readonly key: string;
  readonly url: string;
  readonly lastModified: Date | undefined;
}

export async function listMediaInFolder(
  folder: string,
): Promise<MediaItem[]> {
  const bucketName = getEnvVar("R2_BUCKET_NAME");
  const prefix = folder.endsWith("/") ? folder : `${folder}/`;

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  const response = await getClient().send(command);
  const contents = response.Contents ?? [];

  return contents
    .filter((obj: _Object) => obj.Key && obj.Key !== prefix)
    .map((obj: _Object) => ({
      key: obj.Key!,
      url: getPublicUrl(obj.Key!),
      lastModified: obj.LastModified,
    }));
}

export function getPublicUrl(key: string): string {
  const publicUrl = getEnvVar("R2_PUBLIC_URL");
  const base = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
  return `${base}/${encodeURI(key)}`;
}
