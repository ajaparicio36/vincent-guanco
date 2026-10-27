import { expect, test, type Page } from "@playwright/test";

interface Silhouette {
  readonly center: number;
  readonly centroid: number;
  readonly width: number;
}

async function silhouette(page: Page): Promise<Silhouette> {
  const png = await page.locator(".spatial-canvas").screenshot();
  return page.evaluate(async encoded => {
    const image = new Image();
    image.src = "data:image/png;base64," + encoded;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas inspection is unavailable.");
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let left = canvas.width;
    let right = 0;
    let sum = 0;
    let count = 0;
    for (let y = 0; y < canvas.height; y += 1) for (let x = 0; x < canvas.width; x += 1) {
      const offset = (y * canvas.width + x) * 4;
      if (pixels[offset] < 20 && pixels[offset + 1] < 20 && pixels[offset + 2] < 20) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      sum += x;
      count += 1;
    }
    return { center: (left + right + 1) / 2 / canvas.width, centroid: (sum / count + 0.5) / canvas.width, width: (right - left + 1) / canvas.width };
  }, png.toString("base64"));
}

function expectCentered(result: Silhouette, label: string): void {
  expect(Math.abs(result.center - 0.5), label + ": silhouette bounds center").toBeLessThan(0.035);
  expect(Math.abs(result.centroid - 0.5), label + ": visible silhouette area center").toBeLessThan(0.065);
}

const viewports = [
  { width: 390, height: 844 }, { width: 820, height: 1180 },
  { width: 768, height: 1024 }, { width: 320, height: 740 },
  { width: 1440, height: 900 }, { width: 440, height: 956 },
] as const;

for (const viewport of viewports) {
  test(viewport.width + "px deck silhouette stays centered through yaw, selection and reduced motion", async ({ browser }) => {
    const context = await browser.newContext({
      viewport, reducedMotion: "no-preference",
      isMobile: viewport.width <= 1024, hasTouch: viewport.width <= 1024,
    });
    const page = await context.newPage();
    // Neutral test textures expose geometric area, independent of photograph brightness.
    await page.route(/\/portfolio\/.*(?:-thumb|-poster)\.webp$/, route => route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><path fill="white" d="M0 0h2v2H0z"/></svg>',
    }));
    await page.route(/\/portfolio\/.*\.mp4$/, route => route.abort());
    await page.addInitScript(() => {
      let seed = 125;
      Math.random = (): number => {
        seed = seed * 16807 % 2147483647;
        return (seed - 1) / 2147483646;
      };
    });
    await page.goto("http://localhost:3100/");
    await expect(page.locator(".spatial-canvas")).toHaveAttribute("data-ready", "true");
    await page.waitForTimeout(4800);
    await page.getByRole("button", { name: "Pause motion", exact: true }).click();
    expectCentered(await silhouette(page), "positive idle yaw");
    for (const progress of [1.25, 13.5, 27.75]) {
      await page.evaluate(progress => {
        const track = document.querySelector<HTMLElement>(".spatial-scroll-track");
        const pin = document.querySelector<HTMLElement>(".gallery-pin");
        const header = document.querySelector<HTMLElement>(".site-header");
        if (!track || !pin || !header) throw new Error("The gallery scroll layout is unavailable.");
        const start = track.getBoundingClientRect().top + scrollY - header.offsetHeight;
        scrollTo({ top: start + progress / 28 * (track.offsetHeight - pin.offsetHeight), behavior: "instant" });
      }, progress);
      await page.waitForTimeout(500);
      expectCentered(await silhouette(page), "selection transition " + progress);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("region", { name: "Spatial archive" }).press("Home");
    await page.locator(".current-work h2").click();
    expectCentered(await silhouette(page), "reduced-motion landscape");
    for (const index of [1, 7, 14, 28]) {
      const region = page.getByRole("region", { name: "Spatial archive" });
      await region.press("Home");
      for (let step = 0; step < index; step += 1) await region.press("ArrowRight");
      await page.locator(".current-work h2").click();
      expectCentered(await silhouette(page), "selection " + (index + 1));
      await page.getByRole("button", { name: "View work", exact: true }).click();
      const focused = await silhouette(page);
      expect(Math.abs(focused.center - 0.5), "focused active image center").toBeLessThan(0.005);
      expect(focused.width, "focused image remains complete").toBeLessThan(0.9);
      await page.getByRole("button", { name: "Back to stack", exact: true }).click();
    }
    await context.close();
  });
}
