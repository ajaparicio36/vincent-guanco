export function Footer(): React.ReactElement {
  return (
    <footer className="site-footer">
      <a href="#hero" className="footer-wordmark">VINCENT GUANCO</a>
      <nav aria-label="Footer navigation">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <p>© {new Date().getFullYear()} Vincent Guanco. All rights reserved.</p>
    </footer>
  );
}
