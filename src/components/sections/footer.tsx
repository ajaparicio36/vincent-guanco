export function Footer(): React.ReactElement {
  return (
    <footer className="bg-[#F5F2ED] w-full">
      <div className="px-6 md:px-12">
        <hr className="border-t border-[#0e0e0c]/10 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 items-baseline w-full px-6 md:px-12 py-12 md:py-16">
        {/* Left: branding */}
        <div className="order-2 md:order-1">
          <span className="font-sans text-xs font-medium tracking-[0.25em] text-[#0e0e0c] uppercase">
            PHOTO &amp; VIDEO
          </span>
        </div>

        {/* Center: nav links */}
        <nav
          className="flex flex-col md:flex-row gap-6 md:gap-10 order-1 md:order-2"
          aria-label="Footer navigation"
        >
          {(["WORK", "ABOUT", "CONTACT"] as const).map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="font-sans uppercase tracking-[0.15em] text-[10px] text-secondary hover:text-[#0e0e0c] underline-offset-4 hover:underline transition-all duration-300"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right: copyright */}
        <div className="flex md:justify-end order-3">
          <span className="font-sans text-[10px] font-light tracking-[0.15em] text-secondary uppercase">
            VINCENT GUANCO © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
