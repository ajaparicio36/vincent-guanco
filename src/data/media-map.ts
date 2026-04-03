export interface MediaCategory {
  readonly slug: string;
  readonly r2Prefix: string;
  readonly displayName: string;
  readonly type: "video" | "photo";
}

export const VIDEO_CATEGORIES: readonly MediaCategory[] = [
  { slug: "zuhair-murad", r2Prefix: "videos/zuhair murad", displayName: "Zuhair Murad", type: "video" },
  { slug: "tony-ward", r2Prefix: "videos/tony ward", displayName: "Tony Ward", type: "video" },
  { slug: "streetstyle", r2Prefix: "videos/streetsyle", displayName: "Streetstyle", type: "video" },
  { slug: "stephane-rolland", r2Prefix: "videos/stephane rolland", displayName: "Stephane Rolland", type: "video" },
  { slug: "georges-hobeika", r2Prefix: "videos/georges hobeika", displayName: "Georges Hobeika", type: "video" },
  { slug: "fashion-week", r2Prefix: "videos/fashion week", displayName: "Fashion Week", type: "video" },
  { slug: "events", r2Prefix: "videos/events", displayName: "Events", type: "video" },
  { slug: "cannes", r2Prefix: "videos/cannes", displayName: "Cannes", type: "video" },
  { slug: "brands", r2Prefix: "videos/brands", displayName: "Brands", type: "video" },
  { slug: "balmain", r2Prefix: "videos/balmain", displayName: "Balmain", type: "video" },
  { slug: "amiri", r2Prefix: "videos/amiri", displayName: "Amiri", type: "video" },
] as const;

export const PHOTO_CATEGORIES: readonly MediaCategory[] = [
  { slug: "zuhair-murad", r2Prefix: "photos/zuhair-murad", displayName: "Zuhair Murad", type: "photo" },
  { slug: "miumiu", r2Prefix: "photos/miumiu", displayName: "Miu Miu", type: "photo" },
  { slug: "loewe", r2Prefix: "photos/loewe", displayName: "Loewe", type: "photo" },
  { slug: "leonardo", r2Prefix: "photos/leonardo", displayName: "Leonardo", type: "photo" },
  { slug: "aline", r2Prefix: "photos/aline", displayName: "Aline", type: "photo" },
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
