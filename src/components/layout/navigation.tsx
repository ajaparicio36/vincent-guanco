import { ArrowUpRight } from "lucide-react";

export function Navigation(): React.ReactElement {
  return (
    <header className="site-header" id="hero">
      <a className="skip-link" href="#work">Skip to work</a>
      <a href="#hero" className="site-identity" aria-label="Vincent Guanco, home">
        <span>VINCENT GUANCO</span>
      </a>
      <nav className="site-navigation" aria-label="Main navigation">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact" className="contact-link">Contact <ArrowUpRight size={14} aria-hidden="true" /></a>
      </nav>
    </header>
  );
}
