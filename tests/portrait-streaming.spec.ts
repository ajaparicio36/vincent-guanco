import { expect, test } from "@playwright/test";
import { createElement, type ComponentType } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { JsxEmit, ModuleKind, transpileModule } from "typescript";
import { Navigation } from "../src/components/layout/navigation";
import { About } from "../src/components/sections/about";
import { Footer } from "../src/components/sections/footer";

type Portrait = { readonly url: string; readonly key: string };

function pageWithListing(listMediaInFolder: () => Promise<readonly Portrait[]>): ComponentType {
  const filename = resolve("src/app/page.tsx");
  const compiled = transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { jsx: JsxEmit.ReactJSX, module: ModuleKind.CommonJS },
  });
  const pageExports: { default?: ComponentType } = {};
  const nodeRequire = createRequire(resolve("package.json"));
  const aliases: Readonly<Record<string, unknown>> = {
    "@/components/layout/navigation": { Navigation },
    "@/components/portfolio/archive": { Archive: () => createElement("section", { id: "work" }, "Local archive") },
    "@/components/sections/about": { About },
    "@/components/sections/footer": { Footer },
    "@/lib/r2": { listMediaInFolder },
    "@/data/media-map": { ABOUT_ME_PREFIX: "ABOUT_ME" },
  };
  runInNewContext(compiled.outputText, {
    exports: pageExports,
    require: (specifier: string): unknown => aliases[specifier] ?? nodeRequire(specifier),
    console: { error: (): void => undefined },
  }, { filename });
  if (!pageExports.default) throw new Error("The home route did not export a component.");
  return pageExports.default;
}

function render(Home: ComponentType): { shell: Promise<void>; finished: Promise<void>; html: () => string } {
  const output = new PassThrough();
  const chunks: string[] = [];
  output.on("data", (chunk: Buffer) => chunks.push(chunk.toString()));
  const finished = new Promise<void>((resolveFinished, reject) => {
    output.on("end", resolveFinished);
    output.on("error", reject);
  });
  const shell = new Promise<void>((resolveShell, reject) => {
    const stream = renderToPipeableStream(createElement(Home), {
      onShellReady: () => { stream.pipe(output); resolveShell(); },
      onShellError: reject,
      onError: reject,
    });
  });
  return { shell, finished, html: () => chunks.join("") };
}

function expectEssentialContent(html: string): void {
  for (const text of ["Local archive", "Based in Paris"]) {
    expect(html).toContain(text);
  }
  for (const text of ["portfolio-statistics", "28M+", "33K+", "1M+", "Total Views", "Followers", "Likes"]) {
    expect(html).not.toContain(text);
  }
  expect(html).toContain('href="mailto:vincentguancostaes@gmail.com"');
  expect(html).toContain('href="https://wa.me/33614984173"');
  expect(html).toContain('href="https://www.instagram.com/vincentguanco/"');
}

test("pending portrait listing streams the archive and full contact first", async () => {
  let finish: ((photos: readonly Portrait[]) => void) | undefined;
  const listing = new Promise<readonly Portrait[]>(resolveListing => { finish = resolveListing; });
  const output = render(pageWithListing(() => listing));
  await output.shell;
  expectEssentialContent(output.html());
  expect(output.html()).toContain("VG");
  if (!finish) throw new Error("The pending listing did not start.");
  finish([]);
  await output.finished;
});

test("missing or unavailable portrait listing preserves essential content", async () => {
  const output = render(pageWithListing(async () => { throw new Error("Missing required environment variable: R2_BUCKET_NAME"); }));
  await output.finished;
  expectEssentialContent(output.html());
  expect(output.html()).toContain("VG");
});
