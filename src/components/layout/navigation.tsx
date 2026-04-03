"use client";

import { useState, useEffect, useCallback } from "react";

export function Navigation(): React.ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback((href: string) => {
    setOpen(false);
    setTimeout(() => {
      document.getElementById(href)?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
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
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex flex-col justify-center gap-[5px] p-1 cursor-pointer"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span
                className={`block w-5 h-px bg-[#0e0e0c] transition-all duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`}
              />
              <span
                className={`block w-5 h-px bg-[#0e0e0c] transition-all duration-300 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-3 h-px bg-[#0e0e0c] transition-all duration-300 ${open ? "-translate-y-[6px] -rotate-45 w-5" : ""}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen overlay menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } bg-black/40 backdrop-blur-md`}
        onClick={() => setOpen(false)}
      >
        <div
          className="flex flex-col items-center justify-center h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center">
            <div className="w-48 h-px bg-[#babab0]/40" />
            <button
              type="button"
              onClick={() => handleNavClick("collections")}
              className="py-6 font-serif text-2xl text-white hover:text-white/70 transition-colors duration-300 cursor-pointer"
            >
              PHOTOS
            </button>
            <div className="w-48 h-px bg-[#babab0]/40" />
            <button
              type="button"
              onClick={() => handleNavClick("collections")}
              className="py-6 font-serif text-2xl text-white hover:text-white/70 transition-colors duration-300 cursor-pointer"
            >
              VIDEOS
            </button>
            <div className="w-48 h-px bg-[#babab0]/40" />
          </div>
        </div>
      </div>
    </>
  );
}
