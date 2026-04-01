'use client';

import { useState, useEffect, useCallback } from 'react';

const NAV_LINKS = [
  { label: 'WORK', href: '#collections' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
] as const;

const SECTION_IDS = ['hero', 'collections', 'about', 'contact'] as const;
type SectionId = (typeof SECTION_IDS)[number];

export function Navigation(): React.ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('hero');

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const handleScroll = (): void => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        }
      },
      { threshold: 0.3 },
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const isActive = (href: string): boolean =>
    href === `#${activeSection}` ||
    (href === '#collections' && activeSection === 'hero');

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-[#0e0e0c]/10'
          : 'bg-transparent backdrop-blur-sm'
      }`}
    >
      <div className="flex justify-between items-center px-6 md:px-12 py-6">
        {/* Branding */}
        <a
          href="#hero"
          className="font-sans uppercase tracking-[0.2em] text-sm font-semibold text-[#0e0e0c] hover:text-secondary transition-colors duration-300"
        >
          PARIS | PHOTO &amp; VIDEO
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`font-sans uppercase tracking-[0.15em] text-[10px] transition-colors duration-300 pb-0.5 ${
                isActive(href)
                  ? 'text-[#0e0e0c] border-b border-[#0e0e0c]'
                  : 'text-secondary hover:text-[#0e0e0c]'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden flex flex-col justify-center gap-[5px] p-1"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-5 h-px bg-[#0e0e0c] transition-all duration-300 ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`}
          />
          <span
            className={`block w-5 h-px bg-[#0e0e0c] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block w-3 h-px bg-[#0e0e0c] transition-all duration-300 ${menuOpen ? '-translate-y-[6px] -rotate-45 w-5' : ''}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ${
          menuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        } bg-background border-b border-[#0e0e0c]/10`}
      >
        <div className="flex flex-col gap-6 px-6 pb-8 pt-2">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={closeMenu}
              className="font-sans uppercase tracking-[0.15em] text-[10px] text-secondary hover:text-[#0e0e0c] transition-colors duration-300"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
