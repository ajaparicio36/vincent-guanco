import { expect, test } from "@playwright/test";
import manifest from "../src/data/video-assets.json";

type Asset = { readonly desktopKey: string; readonly mobileKey: string; readonly posterKey: string };
const assets: Readonly<Record<string, Asset>> = manifest;
const publicBase = "https://r2.vincentguanco.com/";

test("media route serves versioned sources and preserves category selection", async ({ request }) => {
  const response = await request.get("/api/media?type=video&category=amiri&v=2026-10-09");
  expect(response.ok()).toBe(true);
  expect(response.headers()["cache-control"]).not.toContain("immutable");
  const body: unknown = await response.json();
  expect(body).toEqual({ items: [{
    key: "1_VIDEOS/11_AMIRI/2_FULL.mp4",
    url: publicBase + assets["1_VIDEOS/11_AMIRI/2_FULL.mp4"].desktopKey,
    mobileUrl: publicBase + assets["1_VIDEOS/11_AMIRI/2_FULL.mp4"].mobileKey,
    posterUrl: publicBase + assets["1_VIDEOS/11_AMIRI/2_FULL.mp4"].posterKey,
  }] });
  expect((await request.get("/api/media")).status()).toBe(400);
  expect((await request.get("/api/media?type=video&category=invalid")).status()).toBe(400);
});

test("desktop hero retains its existing clips and gallery waits for scrolling", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("#hero video").first();
  await expect(hero).toHaveJSProperty("paused", false);
  const source = await hero.getAttribute("src");
  const allowed = Object.entries(assets).filter(([key]) => key.startsWith("THUMBNAILS/")).map(([, asset]) => publicBase + asset.desktopKey);
  expect(allowed).toContain(source);
  expect(await page.locator("#about img").count()).toBe(0);
  expect(await page.locator('[data-accordion-key^="photo-"] img').count()).toBe(0);
  await page.locator('[data-accordion-key="video-fashion-week"]').scrollIntoViewIfNeeded();
  const video = page.locator('[data-accordion-key="video-fashion-week"] video').first();
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", false);
  await expect(video).toHaveAttribute("src", /\/desktop\.mp4$/);
  await expect(hero).toHaveJSProperty("paused", true);
});

test("mobile keeps the five hero clips and scroll loading retains video sources", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const hero = page.locator("#hero video").first();
  await expect(hero).toHaveJSProperty("paused", false);
  const allowed = [1, 2, 4, 5, 6].map((number) => publicBase + assets[`HERO_MOBILE/2026-09-28/${number}.mp4`].mobileKey);
  expect(allowed).toContain(await hero.getAttribute("src"));
  expect(await page.locator("#about img").count()).toBe(0);
  await page.locator('[data-accordion-key="video-fashion-week"]').scrollIntoViewIfNeeded();
  const video = page.locator('[data-accordion-key="video-fashion-week"] video').first();
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", false);
  await expect(video).toHaveAttribute("src", /\/mobile\.mp4$/);
  const source = await video.getAttribute("src");
  await page.locator("#about").scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", true);
  await expect(video).toHaveAttribute("src", source ?? "");
  await expect(page.locator("#about img").first()).toBeVisible();
  await page.locator('[data-accordion-key="video-fashion-week"]').scrollIntoViewIfNeeded();
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", false);
  await expect(video).toHaveAttribute("src", source ?? "");
});

test("a direct tap recovers when the embedded browser requires a gesture", async ({ page }) => {
  await page.addInitScript(() => {
    const originalPlay = HTMLMediaElement.prototype.play;
    let allowPlay = false;
    document.addEventListener("click", (event) => {
      if (event.isTrusted) allowPlay = true;
    }, { capture: true });
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement): Promise<void> {
      if (!allowPlay) return Promise.reject(new DOMException("Gesture required", "NotAllowedError"));
      return originalPlay.call(this);
    };
  });
  await page.goto("/");
  const gallery = page.locator('[data-accordion-key="video-vetements"]');
  await gallery.scrollIntoViewIfNeeded();
  await gallery.locator("video").scrollIntoViewIfNeeded();
  const playButton = gallery.getByRole("button", { name: "Play Vetements", exact: true });
  await expect(playButton).toBeVisible();
  await playButton.click();
  await expect(gallery.locator("video")).toHaveJSProperty("paused", false);
  await expect(playButton).not.toBeVisible();
});

test("collection photos load on approach and survive accordion reopening", async ({ page }) => {
  await page.goto("/");
  const gallery = page.locator('[data-accordion-key="photo-chopard"]');
  expect(await gallery.locator("img").count()).toBe(0);
  await gallery.getByRole("button", { name: "Chopard", exact: true }).scrollIntoViewIfNeeded();
  const photo = gallery.locator("img").first();
  await photo.scrollIntoViewIfNeeded();
  await expect(photo).toBeVisible();
  await expect.poll(() => photo.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  await gallery.getByRole("button", { name: "Chopard", exact: true }).click();
  await expect(photo).not.toBeVisible();
  await gallery.getByRole("button", { name: "Chopard", exact: true }).click();
  await expect(photo).toBeVisible();
});
