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

  return NextResponse.json(
    { items: items.map(({ key, url }) => ({ key, url })) },
    {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
