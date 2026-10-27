import { Suspense } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Archive } from "@/components/portfolio/archive";
import { Statistics } from "@/components/portfolio/statistics";
import { About, type AboutPhoto } from "@/components/sections/about";
import { Footer } from "@/components/sections/footer";
import { listMediaInFolder } from "@/lib/r2";
import { ABOUT_ME_PREFIX } from "@/data/media-map";

async function getAboutPhotos(): Promise<readonly AboutPhoto[]> {
  try {
    const items = await listMediaInFolder(ABOUT_ME_PREFIX);
    return items.map(({ url, key }) => ({ url, key }));
  } catch (error: unknown) {
    console.error("The portfolio portrait listing could not be loaded.", error instanceof Error ? error.message : "Unknown media error");
    return [];
  }
}

async function AboutWithPhotos(): Promise<React.ReactElement> {
  return <About photos={await getAboutPhotos()} />;
}

export default function Home(): React.ReactElement {
  return (
    <>
      <Navigation />
      <main>
        <Archive />
        <Statistics />
        <Suspense fallback={<About photos={[]} loading />}>
          <AboutWithPhotos />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
