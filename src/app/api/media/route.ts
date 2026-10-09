import { NextResponse, type NextRequest } from "next/server";
import { findCategory } from "@/data/media-map";
import { listMediaInFolder } from "@/lib/r2";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const category = searchParams.get("category");

  if (!type || !category) {
    return NextResponse.json(
      { error: "Missing required query params: type, category" },
      { status: 400 },
    );
  }

  if (type !== "video" && type !== "photo") {
    return NextResponse.json(
      { error: "Invalid type. Must be 'video' or 'photo'" },
      { status: 400 },
    );
  }

  const matched = findCategory(type, category);
  if (!matched) {
    return NextResponse.json(
      { error: `Unknown category: ${type}/${category}` },
      { status: 400 },
    );
  }

  if (!checkRateLimit()) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429 },
    );
  }

  const items = await listMediaInFolder(matched.r2Prefix);
  const visibleItems = matched.visibleFileNames
    ? items.filter(({ key }) => {
        const fileName = key.slice(key.lastIndexOf("/") + 1);
        return matched.visibleFileNames?.includes(fileName) ?? false;
      })
    : items;

  return NextResponse.json(
    { items: visibleItems.map(({ key, url, mobileUrl, posterUrl }) => ({ key, url, mobileUrl, posterUrl })) },
    {
      headers: {
        // Listings change as media is added; only versioned media files are immutable.
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60",
      },
    },
  );
}
