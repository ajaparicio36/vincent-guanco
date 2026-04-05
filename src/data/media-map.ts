export interface MediaCategory {
  readonly slug: string;
  readonly r2Prefix: string;
  readonly displayName: string;
  readonly type: "video" | "photo";
}

// Ordered per docs/categories.md. Files within each folder are numbered;
// r2 listing returns them in key-sorted order, so numeric prefixes drive
// in-folder ordering downstream.
export const VIDEO_CATEGORIES: readonly MediaCategory[] = [
  {
    slug: "cannes",
    r2Prefix: "1_VIDEOS/1_CANNES",
    displayName: "Cannes",
    type: "video",
  },
  {
    slug: "fashion-week",
    r2Prefix: "1_VIDEOS/2_FASHION_WEEK",
    displayName: "Fashion Week",
    type: "video",
  },
  {
    slug: "streetstyle",
    r2Prefix: "1_VIDEOS/3_STREETSTYLE",
    displayName: "Streetstyle",
    type: "video",
  },
  {
    slug: "brands",
    r2Prefix: "1_VIDEOS/4_BRANDS",
    displayName: "Brands",
    type: "video",
  },
  {
    slug: "zuhair-murad",
    r2Prefix: "1_VIDEOS/5_ZUHAIR_MURAD",
    displayName: "Zuhair Murad",
    type: "video",
  },
  {
    slug: "georges-hobeika",
    r2Prefix: "1_VIDEOS/6_GEORGES_HOBEIKA",
    displayName: "Georges Hobeika",
    type: "video",
  },
  {
    slug: "balmain",
    r2Prefix: "1_VIDEOS/7_BALMAIN",
    displayName: "Balmain",
    type: "video",
  },
  {
    slug: "amiri",
    r2Prefix: "1_VIDEOS/8_AMIRI",
    displayName: "Amiri",
    type: "video",
  },
  {
    slug: "stephane-rolland",
    r2Prefix: "1_VIDEOS/9_STEPHANNE_ROLLAND",
    displayName: "Stephane Rolland",
    type: "video",
  },
  {
    slug: "tony-ward",
    r2Prefix: "1_VIDEOS/10_TONY_WARD",
    displayName: "Tony Ward",
    type: "video",
  },
  {
    slug: "events",
    r2Prefix: "1_VIDEOS/11_EVENTS",
    displayName: "Events",
    type: "video",
  },
] as const;

export const PHOTO_CATEGORIES: readonly MediaCategory[] = [
  {
    slug: "aline",
    r2Prefix: "2_PHOTOS/1_ALINE",
    displayName: "Aline",
    type: "photo",
  },
  {
    slug: "leonardo",
    r2Prefix: "2_PHOTOS/2_LEONARDO",
    displayName: "Leonardo",
    type: "photo",
  },
  {
    slug: "sara",
    r2Prefix: "2_PHOTOS/3_SARA",
    displayName: "Sara",
    type: "photo",
  },
  {
    slug: "loewe",
    r2Prefix: "2_PHOTOS/4_LOEWE",
    displayName: "Loewe",
    type: "photo",
  },
  {
    slug: "miss-sohee",
    r2Prefix: "2_PHOTOS/5_MISS_SOHEE",
    displayName: "Miss Sohee",
    type: "photo",
  },
  {
    slug: "miumiu",
    r2Prefix: "2_PHOTOS/6_MIUMIU",
    displayName: "Miu Miu",
    type: "photo",
  },
  {
    slug: "zuhair-murad",
    r2Prefix: "2_PHOTOS/7_ZUHAIR_MURAD",
    displayName: "Zuhair Murad",
    type: "photo",
  },
] as const;

export const ALL_CATEGORIES: readonly MediaCategory[] = [
  ...VIDEO_CATEGORIES,
  ...PHOTO_CATEGORIES,
] as const;

// Single-purpose folders used by dedicated sections (hero, viral views, about).
export const THUMBNAILS_PREFIX = "THUMBNAILS" as const;
export const MILLION_VIEWS_PREFIX = "MILLION_VIEWS" as const;
export const ABOUT_ME_PREFIX = "ABOUT_ME" as const;

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
