import { Navigation } from "@/components/layout/navigation";
import { Hero } from "@/components/sections/hero";
import { Collections } from "@/components/sections/collections";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";

export default function Home(): React.ReactElement {
  return (
    <>
      {/* Film grain overlay — fixed to viewport at 3% opacity */}
      <div className="film-grain" aria-hidden="true" />

      <Navigation />

      <main>
        <Hero />
        <Collections />
        <About />
      </main>

      <Footer />
    </>
  );
}
