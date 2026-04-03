"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { VIDEO_CATEGORIES, PHOTO_CATEGORIES } from "@/data/media-map";
import { useNavigation } from "@/contexts/navigation-context";

export function Navigation(): React.ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { setActiveCategory } = useNavigation();

  useEffect(() => {
    const handleScroll = (): void => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryClick = useCallback(
    (type: string, slug: string) => {
      setOpen(false);
      setActiveCategory(`${type}-${slug}`);

      // Scroll to collections after sheet closes
      setTimeout(() => {
        document
          .getElementById("collections")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    },
    [setActiveCategory],
  );

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-[#0e0e0c]/10"
          : "bg-transparent backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center px-6 md:px-12 py-6">
        {/* Spacer for centering */}
        <div className="flex-1" />

        {/* Centered branding */}
        <a
          href="#hero"
          className="font-sans uppercase tracking-[0.2em] text-sm font-semibold text-[#0e0e0c] hover:text-secondary transition-colors duration-300"
        >
          VINCENT GUANCO
        </a>

        {/* Right side: hamburger */}
        <div className="flex-1 flex justify-end">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="flex flex-col justify-center gap-[5px] p-1 cursor-pointer"
              aria-label="Open menu"
            >
              <span className="block w-5 h-px bg-[#0e0e0c]" />
              <span className="block w-5 h-px bg-[#0e0e0c]" />
              <span className="block w-3 h-px bg-[#0e0e0c]" />
            </SheetTrigger>

            <SheetContent
              side="top"
              showCloseButton={false}
              className="bg-background/95 backdrop-blur-md px-8 md:px-12 py-12 max-h-[80vh] overflow-y-auto border-b border-[#0e0e0c]/10"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              {/* Close button */}
              <div className="flex justify-end mb-8">
                <SheetClose className="flex flex-col justify-center gap-[5px] p-1 cursor-pointer">
                  <span className="block w-5 h-px bg-[#0e0e0c] translate-y-[6px] rotate-45" />
                  <span className="block w-5 h-px bg-[#0e0e0c] opacity-0" />
                  <span className="block w-5 h-px bg-[#0e0e0c] -translate-y-[6px] -rotate-45" />
                </SheetClose>
              </div>

              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Photos */}
                <div>
                  <span
                    className="font-sans text-[10px] uppercase font-medium text-secondary block mb-6"
                    style={{ letterSpacing: "0.3em" }}
                  >
                    PHOTOS
                  </span>
                  <div className="flex flex-col gap-4">
                    {PHOTO_CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() =>
                          handleCategoryClick(cat.type, cat.slug)
                        }
                        className="font-serif text-2xl text-on-surface text-left hover:text-secondary transition-colors duration-300"
                      >
                        {cat.displayName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Videos */}
                <div>
                  <span
                    className="font-sans text-[10px] uppercase font-medium text-secondary block mb-6"
                    style={{ letterSpacing: "0.3em" }}
                  >
                    VIDEOS
                  </span>
                  <div className="flex flex-col gap-4">
                    {VIDEO_CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() =>
                          handleCategoryClick(cat.type, cat.slug)
                        }
                        className="font-serif text-2xl text-on-surface text-left hover:text-secondary transition-colors duration-300"
                      >
                        {cat.displayName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
