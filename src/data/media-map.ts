export interface MediaCategory {
  readonly slug: string;
  readonly r2Prefix: string;
  readonly displayName: string;
  readonly type: "video" | "photo";
}

export const VIDEO_CATEGORIES: readonly MediaCategory[] = [
  { slug: "amiri", r2Prefix: "videos/AMIRI", displayName: "Amiri", type: "video" },
  { slug: "balmain", r2Prefix: "videos/BALMAIN", displayName: "Balmain", type: "video" },
  { slug: "brands", r2Prefix: "videos/BRANDS", displayName: "Brands", type: "video" },
  { slug: "cannes", r2Prefix: "videos/CANNES", displayName: "Cannes", type: "video" },
  { slug: "events", r2Prefix: "videos/EVENTS", displayName: "Events", type: "video" },
  { slug: "fashion-week", r2Prefix: "videos/FASHION_WEEK", displayName: "Fashion Week", type: "video" },
  { slug: "georges-hobeika", r2Prefix: "videos/GEORGES_HOBEIKA", displayName: "Georges Hobeika", type: "video" },
  { slug: "stephane-rolland", r2Prefix: "videos/STEPHANE_ROLLAND", displayName: "Stephane Rolland", type: "video" },
  { slug: "streetstyle", r2Prefix: "videos/STREETSTYLE", displayName: "Streetstyle", type: "video" },
  { slug: "tony-ward", r2Prefix: "videos/TONY_WARD", displayName: "Tony Ward", type: "video" },
  { slug: "zuhair-murad", r2Prefix: "videos/ZUHAIR_MURAD", displayName: "Zuhair Murad", type: "video" },
] as const;

export const PHOTO_CATEGORIES: readonly MediaCategory[] = [
  { slug: "aline", r2Prefix: "photos/ALINE", displayName: "Aline", type: "photo" },
  { slug: "leonardo", r2Prefix: "photos/LEONARDO", displayName: "Leonardo", type: "photo" },
  { slug: "loewe", r2Prefix: "photos/LOEWE", displayName: "Loewe", type: "photo" },
  { slug: "miumiu", r2Prefix: "photos/MIUMIU", displayName: "Miu Miu", type: "photo" },
  { slug: "zuhair-murad", r2Prefix: "photos/ZUHAIR_MURAD", displayName: "Zuhair Murad", type: "photo" },
] as const;

export const ALL_CATEGORIES: readonly MediaCategory[] = [
  ...VIDEO_CATEGORIES,
  ...PHOTO_CATEGORIES,
] as const;

export function findCategory(
  type: "video" | "photo",
  slug: string,
): MediaCategory | undefined {
  return ALL_CATEGORIES.find((c) => c.type === type && c.slug === slug);
}

export function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
