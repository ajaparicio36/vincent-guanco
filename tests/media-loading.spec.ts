import { expect, test, type Page } from "@playwright/test";
import manifest from "../src/data/video-assets.json";
import { PORTFOLIO_WORK, type PortfolioWork } from "../src/data/portfolio";

type Asset = { readonly desktopKey: string; readonly mobileKey: string; readonly posterKey: string };
const assets: Readonly<Record<string, Asset>> = manifest;
const publicBase = "https://r2.vincentguanco.com/";

async function readySpatial(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.locator(".spatial-canvas")).toHaveAttribute("data-ready", "true");
  await expect(page.getByRole("button", { name: "Stack", exact: true })).toHaveAttribute("aria-pressed", "true");
}

async function archiveOrder(page: Page): Promise<readonly PortfolioWork[]> {
  await page.getByRole("button", { name: "Flat view", exact: true }).click();
  const ids = await page.locator(".flat-work").evaluateAll(elements => elements.map(element => element.getAttribute("data-work-id")));
  const works = ids.map(id => {
    const work = PORTFOLIO_WORK.find(item => item.id === id);
    if (!work) throw new Error(`Unknown archive work: ${id}`);
    return work;
  });
  await page.getByRole("button", { name: "Stack", exact: true }).click();
  await expect(page.locator(".spatial-canvas")).toHaveAttribute("data-ready", "true");
  return works;
}

async function scrollToWork(page: Page, index: number): Promise<void> {
  await page.evaluate(index => {
    const track = document.querySelector<HTMLElement>(".spatial-scroll-track");
    const pin = document.querySelector<HTMLElement>(".gallery-pin");
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!track || !pin || !header) throw new Error("The spatial scroll track is unavailable.");
    const start = track.getBoundingClientRect().top + scrollY - header.offsetHeight;
    scrollTo({ top: start + index / 28 * (track.offsetHeight - pin.offsetHeight), behavior: "instant" });
  }, index);
  await expect(page.locator(".work-number")).toHaveText(`${String(index + 1).padStart(2, "0")} / 29`);
}

async function scrollSelection(page: Page): Promise<number> {
  return page.evaluate(() => {
    const track = document.querySelector<HTMLElement>(".spatial-scroll-track");
    const pin = document.querySelector<HTMLElement>(".gallery-pin");
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!track || !pin || !header) throw new Error("The spatial scroll track is unavailable.");
    const start = track.getBoundingClientRect().top + scrollY - header.offsetHeight;
    return Math.round((scrollY - start) / (track.offsetHeight - pin.offsetHeight) * 28);
  });
}

async function setHidden(page: Page, hidden: boolean): Promise<void> {
  await page.evaluate(hidden => {
    Object.defineProperty(document, "hidden", { configurable: true, value: hidden });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);
}

async function expectIdentity(page: Page): Promise<void> {
  for (const value of ["28M+", "33K+", "1M+"]) await expect(page.getByText(value, { exact: true })).toHaveCount(1);
  await expect(page.getByText("Based in Paris", { exact: true })).toHaveCount(1);
  await expect(page.locator("#contact a").first()).toHaveAttribute("href", "mailto:vincentguancostaes@gmail.com");
  await expect(page.locator('#contact a[href="https://wa.me/33614984173"]')).toContainText("+33 614 98 41 73");
  await expect(page.locator('#contact a[href="https://www.instagram.com/vincentguanco/"]')).toHaveCount(1);
}

test("existing media API preserves category selection and versioned sources", async ({ request }) => {
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
  expect((await request.get("/api/media?type=invalid&category=amiri")).status()).toBe(400);
});

test("29 mixed works shuffle once per load and retain order across view changes", async ({ page }) => {
  expect(new Set(PORTFOLIO_WORK.map(work => work.id)).size).toBe(29);
  expect(new Set(PORTFOLIO_WORK.flatMap(work => [work.thumbnail, work.src])).size).toBe(58);
  await readySpatial(page);
  const first = await archiveOrder(page);
  expect(first.filter(work => work.kind === "photo")).toHaveLength(18);
  expect(first.filter(work => work.kind === "video")).toHaveLength(11);
  expect((await archiveOrder(page)).map(work => work.id)).toEqual(first.map(work => work.id));
  await expect(page.locator("#photos, #videos, #all-work, [role=dialog], video[controls]")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".spatial-canvas")).toHaveAttribute("data-ready", "true");
  expect((await archiveOrder(page)).map(work => work.id)).not.toEqual(first.map(work => work.id));
});

test("initial spatial view limits previews and owns at most one film source", async ({ page }) => {
  const filmRequests = new Set<string>();
  const previewRequests = new Set<string>();
  page.on("request", request => {
    if (/\/portfolio\/.*\.mp4/.test(request.url())) filmRequests.add(request.url());
    if (/\/portfolio\/.*\.webp/.test(request.url())) previewRequests.add(request.url());
  });
  await readySpatial(page);
  expect(await page.locator("video").count()).toBeLessThanOrEqual(1);
  expect(filmRequests.size).toBeLessThanOrEqual(1);
  // Thirteen resident previews plus the hydration-safe initial placeholder.
  expect(previewRequests.size).toBeLessThanOrEqual(14);
});

test("native scroll, keyboard and arrows share selection and Contact immediately escapes", async ({ page }) => {
  await readySpatial(page);
  const order = await archiveOrder(page);
  await scrollToWork(page, 5);
  await expect(page.locator(".current-work h2")).toHaveText(order[5].title);
  const stage = page.getByRole("region", { name: "Spatial archive" });
  await stage.focus();
  await stage.press("ArrowRight");
  await expect(page.locator(".current-work h2")).toHaveText(order[6].title);
  expect(await scrollSelection(page)).toBe(6);
  await page.getByRole("button", { name: "Previous work", exact: true }).click();
  await expect(page.locator(".current-work h2")).toHaveText(order[5].title);
  expect(await scrollSelection(page)).toBe(5);
  await stage.focus();
  await stage.press("End");
  await expect(page.locator(".current-work h2")).toHaveText(order[28].title);
  await expect(page.getByRole("button", { name: "Next work", exact: true })).toBeDisabled();
  await page.mouse.wheel(0, 450);
  await expect(page.locator(".portfolio-statistics")).toBeInViewport();
  await stage.focus();
  await stage.press("Home");
  await expect(page.locator(".current-work h2")).toHaveText(order[0].title);
  await expect(page.getByRole("button", { name: "Previous work", exact: true })).toBeDisabled();
  await page.locator('.site-navigation a[href="#contact"]').click();
  await expect(page.locator("#contact")).toBeInViewport();
  expect(await page.locator(".site-header").evaluate(element => element.getBoundingClientRect().top)).toBe(0);
  await expectIdentity(page);
});

test("drag synchronizes document position and cancelled drag restores selection", async ({ page }) => {
  await readySpatial(page);
  const order = await archiveOrder(page);
  await scrollToWork(page, 5);
  const canvas = page.locator(".spatial-canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("The gallery has no layout.");
  const x = bounds.x + bounds.width * 0.75;
  const y = bounds.y + bounds.height * 0.5;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await canvas.dispatchEvent("pointerdown", { pointerId: 77, pointerType: "pen", isPrimary: true, clientX: x, clientY: y, button: 0 });
  await page.mouse.move(bounds.x + bounds.width * 0.15, y, { steps: 8 });
  await canvas.dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse", isPrimary: true });
  await page.mouse.up();
  await expect(page.locator(".current-work h2")).toHaveText(order[5].title);
  expect(await scrollSelection(page)).toBe(5);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.15, y, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => scrollSelection(page)).toBeGreaterThan(5);
  const index = await scrollSelection(page);
  await expect(page.locator(".current-work h2")).toHaveText(order[index].title);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("reduced-motion Spatial films update the actual plane and custom controls release sources", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await readySpatial(page);
  const order = await archiveOrder(page);
  const index = order.findIndex(work => work.kind === "video");
  await scrollToWork(page, index);
  const video = page.locator(".spatial-video-source");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0.3);
  await expect(video).toHaveJSProperty("controls", false);
  await expect(video).toHaveJSProperty("crossOrigin", "anonymous");
  await expect(video).toHaveJSProperty("muted", true);
  await expect(video).toHaveJSProperty("loop", true);
  const before = await page.locator(".spatial-canvas").screenshot();
  await page.waitForTimeout(450);
  const after = await page.locator(".spatial-canvas").screenshot();
  expect(after.equals(before)).toBe(false);
  await page.getByRole("button", { name: "Pause film", exact: true }).click();
  await expect(video).toHaveJSProperty("paused", true);
  await page.getByRole("button", { name: "Play film", exact: true }).click();
  await expect(video).toHaveJSProperty("paused", false);
  await setHidden(page, true);
  await expect(video).toHaveJSProperty("paused", true);
  await setHidden(page, false);
  await expect(video).toHaveJSProperty("paused", false);
  const mounted = await video.elementHandle();
  if (!mounted) throw new Error("The film did not mount.");
  await scrollToWork(page, order.findIndex(work => work.kind === "photo"));
  await expect(video).toHaveCount(0);
  expect(await mounted.evaluate(element => element.getAttribute("src"))).toBeNull();
  expect(await mounted.evaluate(element => element instanceof HTMLVideoElement && element.paused)).toBe(true);
});

test("Stack focus and paused motion preserve the selected work and keyboard escape", async ({ page }) => {
  await readySpatial(page);
  const order = await archiveOrder(page);
  const index = order.findIndex(work => work.kind === "photo");
  await scrollToWork(page, index);
  const canvas = page.locator(".spatial-canvas");
  const drifting = await canvas.screenshot();
  await page.waitForTimeout(650);
  expect((await canvas.screenshot()).equals(drifting)).toBe(false);
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume motion", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(500);
  const paused = await canvas.screenshot();
  await page.waitForTimeout(180);
  expect((await canvas.screenshot()).equals(paused)).toBe(true);
  await page.getByRole("button", { name: "View work", exact: true }).click();
  const stage = page.getByRole("region", { name: "Spatial archive" });
  await expect(stage).toHaveAttribute("data-inspecting", "true");
  await expect(page.locator(".current-work h2")).toHaveText(order[index].title);
  await page.waitForTimeout(500);
  const focused = await canvas.screenshot();
  expect(focused.equals(paused)).toBe(false);
  await page.waitForTimeout(180);
  expect((await canvas.screenshot()).equals(focused)).toBe(true);
  await stage.focus();
  await stage.press("Escape");
  await expect(stage).toHaveAttribute("data-inspecting", "false");
  await stage.press("Enter");
  await expect(stage).toHaveAttribute("data-inspecting", "true");
  await stage.press("ArrowRight");
  await expect(page.locator(".current-work h2")).toHaveText(order[index + 1].title);
  await expect(stage).toHaveAttribute("data-inspecting", "true");
  await stage.press("Escape");
  await scrollToWork(page, index);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("button", { name: "Resume motion", exact: true })).toHaveCount(0);
  await page.waitForTimeout(350);
  const reduced = await canvas.screenshot();
  await page.waitForTimeout(180);
  expect((await canvas.screenshot()).equals(reduced)).toBe(true);
});

test("Stack Play, Space and Retry invoke media playback within the user gesture", async ({ page }) => {
  await page.addInitScript(() => {
    let gestureDepth = 0;
    const add = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
      if (!listener || !["click", "keydown"].includes(type)) { add.call(this, type, listener, options); return; }
      const wrapped: EventListener = event => {
        gestureDepth += 1;
        try { if (typeof listener === "function") listener.call(this, event); else listener.handleEvent(event); }
        finally { gestureDepth -= 1; }
      };
      add.call(this, type, wrapped, options);
    };
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (): Promise<void> {
      if (this.classList.contains("spatial-video-source") && gestureDepth === 0) {
        return Promise.reject(new DOMException("Playback requires the synchronous gesture stack", "NotAllowedError"));
      }
      return original.call(this);
    };
  });
  await readySpatial(page);
  const order = await archiveOrder(page);
  const films = order.flatMap((work, index) => work.kind === "video" ? [index] : []);
  await scrollToWork(page, films[0]);
  await page.getByRole("button", { name: "Play film", exact: true }).click();
  await expect(page.locator(".spatial-video-source")).toHaveJSProperty("paused", false);
  await page.getByRole("button", { name: "Pause film", exact: true }).click();
  const stage = page.getByRole("region", { name: "Spatial archive" });
  await stage.focus();
  await stage.press("Space");
  await expect(page.locator(".spatial-video-source")).toHaveJSProperty("paused", false);
  const filmPattern = /\/portfolio\/.*\.mp4$/;
  await page.route(filmPattern, route => route.fulfill({ status: 503, body: "" }));
  await scrollToWork(page, films[1]);
  await expect(page.getByRole("button", { name: "Retry film", exact: true })).toBeVisible();
  await page.unroute(filmPattern);
  await page.getByRole("button", { name: "Retry film", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause film", exact: true })).toBeVisible();
});

test("Flat films autoplay in view, retain custom pause and release hidden or offscreen sources", async ({ page }) => {
  await readySpatial(page);
  await page.getByRole("button", { name: "Flat view", exact: true }).click();
  const film = page.locator(".inline-film").first();
  await film.scrollIntoViewIfNeeded();
  const video = film.locator("video");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0.3);
  await expect(video).toHaveJSProperty("controls", false);
  await expect(video).toHaveJSProperty("crossOrigin", "anonymous");
  await film.getByRole("button", { name: /^Pause / }).click();
  await expect(video).toHaveJSProperty("paused", true);
  await setHidden(page, true);
  await expect(video).not.toHaveAttribute("src");
  await setHidden(page, false);
  await expect(video).toHaveJSProperty("paused", true);
  await film.getByRole("button", { name: /^Play / }).click();
  await expect(video).toHaveJSProperty("paused", false);
  await page.locator('.site-navigation a[href="#contact"]').click();
  await expect(page.locator(".inline-film video[src]")).toHaveCount(0);
});

test("blocked inline autoplay has a working custom play control", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (): Promise<void> {
      if (this.closest(".inline-film") && !this.dataset.attempted) {
        this.dataset.attempted = "true";
        return Promise.reject(new DOMException("Simulated autoplay policy", "NotAllowedError"));
      }
      return original.call(this);
    };
  });
  await readySpatial(page);
  await page.getByRole("button", { name: "Flat view", exact: true }).click();
  const film = page.locator(".inline-film").first();
  await film.scrollIntoViewIfNeeded();
  await expect(film).toHaveAttribute("data-playback", "blocked");
  await film.getByRole("button", { name: /^Play / }).click();
  await expect(film).toHaveAttribute("data-playback", "playing");
});

for (const mode of ["spatial", "flat"] as const) {
  test(`${mode} film failure recovers through its custom retry`, async ({ page }) => {
    const filmPattern = /\/portfolio\/.*\.mp4$/;
    await page.route(filmPattern, route => route.fulfill({ status: 503, body: "" }));
    await readySpatial(page);
    if (mode === "spatial") {
      const order = await archiveOrder(page);
      await scrollToWork(page, order.findIndex(work => work.kind === "video"));
      await expect(page.getByRole("button", { name: "Retry film", exact: true })).toBeVisible();
      await page.unroute(filmPattern);
      await page.getByRole("button", { name: "Retry film", exact: true }).click();
      await expect(page.getByRole("button", { name: "Pause film", exact: true })).toBeVisible();
    } else {
      await page.getByRole("button", { name: "Flat view", exact: true }).click();
      const film = page.locator(".inline-film").first();
      await film.scrollIntoViewIfNeeded();
      await expect(film).toHaveAttribute("data-playback", "error");
      await page.unroute(filmPattern);
      await film.getByRole("button", { name: /^Retry / }).click();
      await expect(film).toHaveAttribute("data-playback", "playing");
    }
  });
}

test("WebGL context loss falls back without losing works, statistics or contact", async ({ page }) => {
  await readySpatial(page);
  await page.locator("canvas").dispatchEvent("webglcontextlost");
  await expect(page.locator(".flat-work")).toHaveCount(29);
  await expect(page.getByRole("status")).toContainText("spatial view is unavailable");
  await expectIdentity(page);
});

test("failed spatial thumbnails preserve the complete archive and identity", async ({ page }) => {
  await page.route(/\/portfolio\/.*(?:-thumb|-poster)\.webp$/, route => route.abort());
  await page.goto("/");
  await expect(page.locator(".flat-work")).toHaveCount(29);
  await expect(page.getByRole("status")).toContainText("spatial view is unavailable");
  await expect(page.locator(".flat-image img").first()).toBeVisible();
  await expectIdentity(page);
});

test("portrait image failure keeps complete biography and contact", async ({ page }) => {
  await page.route("**/_next/image?**", route => route.abort());
  await readySpatial(page);
  await page.locator("#about").scrollIntoViewIfNeeded();
  await expect(page.getByText("Portrait unavailable", { exact: true })).toBeVisible();
  await expectIdentity(page);
});

test("320px chrome fits and mobile vertical touch advances the native scroll track", async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await readySpatial(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  expect(await page.locator(".site-header").evaluate(element => {
    const rect = element.getBoundingClientRect();
    return Array.from(element.querySelectorAll("a:not(.skip-link)")).every(link => {
      const bounds = link.getBoundingClientRect();
      return bounds.left >= rect.left && bounds.right <= rect.right;
    });
  })).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await scrollToWork(page, 4);
  const previousY = await page.evaluate(() => scrollY);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 600 }] });
  for (const y of [540, 480, 420, 360, 300]) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y }] });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(previousY + 80);
  await expect.poll(() => scrollSelection(page)).toBeGreaterThan(4);
  await cdp.detach();
});

test.describe("primary portrait touch layouts", () => {
  test.use({ isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }, { width: 768, height: 1024 }]) {
    test(`${viewport.width}px touch controls, horizontal drag and native exit remain usable`, async ({ page, context }) => {
      await page.setViewportSize(viewport);
      await readySpatial(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      const smallControls = await page.locator(".gallery-pin button, .site-navigation a").evaluateAll(elements => elements.filter(element => {
        const bounds = element.getBoundingClientRect();
        return bounds.width < 44 || bounds.height < 44;
      }).map(element => element.getAttribute("aria-label") ?? element.textContent));
      expect(smallControls).toEqual([]);
      await page.getByRole("button", { name: "View work", exact: true }).tap();
      await expect(page.getByRole("region", { name: "Spatial archive" })).toHaveAttribute("data-inspecting", "true");
      await page.getByRole("button", { name: "Back to stack", exact: true }).tap();
      await scrollToWork(page, 3);
      const bounds = await page.locator(".spatial-canvas").boundingBox();
      if (!bounds) throw new Error("The touch gallery has no layout.");
      const cdp = await context.newCDPSession(page);
      const swipe = async (from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
        for (let step = 1; step <= 8; step += 1) await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove", touchPoints: [{ x: from.x + (to.x - from.x) * step / 8, y: from.y + (to.y - from.y) * step / 8 }],
        });
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      };
      const y = bounds.y + bounds.height * 0.5;
      await swipe({ x: viewport.width * 0.8, y }, { x: viewport.width * 0.18, y });
      await expect.poll(() => scrollSelection(page)).toBeGreaterThan(3);
      await scrollToWork(page, 28);
      await swipe({ x: viewport.width * 0.5, y: bounds.y + bounds.height * 0.8 }, { x: viewport.width * 0.5, y: bounds.y + bounds.height * 0.2 });
      await expect(page.locator(".portfolio-statistics")).toBeInViewport();
      await page.locator('.site-navigation a[href="#about"]').tap();
      await expect(page.locator("#about")).toBeInViewport();
      await page.locator('.site-navigation a[href="#contact"]').tap();
      await expect(page.locator("#contact")).toBeInViewport();
      await expect.poll(() => page.locator(".spatial-video-source").evaluateAll(elements => elements.every(element => element instanceof HTMLVideoElement && element.paused))).toBe(true);
      await cdp.detach();
    });
  }
});
