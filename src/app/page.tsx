import { Navigation } from "@/components/layout/navigation";
import { Hero, type HeroVideo } from "@/components/sections/hero";
import { Collections } from "@/components/sections/collections";
import { Footer } from "@/components/sections/footer";
import { NavigationProvider } from "@/contexts/navigation-context";
import { listMediaInFolder } from "@/lib/r2";
import { VIDEO_CATEGORIES } from "@/data/media-map";

async function getHeroVideos(): Promise<HeroVideo[]> {
  try {
    const results = await Promise.all(
      VIDEO_CATEGORIES.map(async (cat) => {
        const items = await listMediaInFolder(cat.r2Prefix);
        return items.map((item) => ({
          url: item.url,
          displayName: cat.displayName,
        }));
      }),
    );

    // Shuffle and pick at most 3 videos to limit loading
    const all = results.flat();
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, 3);
  } catch {
    // R2 not configured — return empty to allow site to render
    return [];
  }
}

export default async function Home(): Promise<React.ReactElement> {
  const heroVideos = await getHeroVideos();

  return (
    <NavigationProvider>
      <div className="w-full max-w-full overflow-x-hidden">
        {/* Film grain overlay — fixed to viewport at 3% opacity */}
        <div className="film-grain" aria-hidden="true" />

        <Navigation />

        <main>
          <Hero videos={heroVideos} />
          <Collections />
        </main>

        <Footer />
      </div>
    </NavigationProvider>
  );
}
