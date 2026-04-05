import { Navigation } from "@/components/layout/navigation";
import { Hero, type HeroVideo } from "@/components/sections/hero";
import { ViralViews, type ViralVideo } from "@/components/sections/viral-views";
import { Collections } from "@/components/sections/collections";
import { About, type AboutPhoto } from "@/components/sections/about";
import { Footer } from "@/components/sections/footer";
import { NavigationProvider } from "@/contexts/navigation-context";
import { listMediaInFolder } from "@/lib/r2";
import {
  VIDEO_CATEGORIES,
  THUMBNAILS_PREFIX,
  MILLION_VIEWS_PREFIX,
  ABOUT_ME_PREFIX,
} from "@/data/media-map";

interface HeroSources {
  readonly desktop: readonly HeroVideo[];
  readonly mobile: readonly HeroVideo[];
}

function isWideKey(key: string): boolean {
  const noExt = key.replace(/\.[^.]+$/, "");
  return noExt.endsWith("_16_9");
}

async function getHeroSources(): Promise<HeroSources> {
  try {
    // Desktop: numbered THUMBNAILS videos (all 16:9).
    const thumbnails = await listMediaInFolder(THUMBNAILS_PREFIX);
    const desktop: HeroVideo[] = thumbnails.map((item) => ({
      url: item.url,
      displayName: "",
    }));

    // Mobile: 3 random non-16:9 videos from the collection.
    const collectionLists = await Promise.all(
      VIDEO_CATEGORIES.map(async (cat) => {
        const items = await listMediaInFolder(cat.r2Prefix);
        return items
          .filter((it) => !isWideKey(it.key))
          .map((it) => ({ url: it.url, displayName: cat.displayName }));
      }),
    );
    const pool = collectionLists.flat();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const mobile = pool.slice(0, 3);

    return { desktop, mobile };
  } catch {
    return { desktop: [], mobile: [] };
  }
}

async function getViralVideos(): Promise<readonly ViralVideo[]> {
  try {
    const items = await listMediaInFolder(MILLION_VIEWS_PREFIX);
    return items.map((item) => ({ url: item.url, key: item.key }));
  } catch {
    return [];
  }
}

async function getAboutPhotos(): Promise<readonly AboutPhoto[]> {
  try {
    const items = await listMediaInFolder(ABOUT_ME_PREFIX);
    return items.map((item) => ({ url: item.url, key: item.key }));
  } catch {
    return [];
  }
}

export default async function Home(): Promise<React.ReactElement> {
  const [hero, viralVideos, aboutPhotos] = await Promise.all([
    getHeroSources(),
    getViralVideos(),
    getAboutPhotos(),
  ]);

  return (
    <NavigationProvider>
      <div className="w-full max-w-full overflow-x-hidden">
        {/* Film grain overlay — fixed to viewport at 3% opacity */}
        <div className="film-grain" aria-hidden="true" />

        <Navigation />

        <main>
          <Hero desktopVideos={hero.desktop} mobileVideos={hero.mobile} />
          <ViralViews videos={viralVideos} />
          <Collections />
          <About photos={aboutPhotos} />
        </main>

        <Footer />
      </div>
    </NavigationProvider>
  );
}
