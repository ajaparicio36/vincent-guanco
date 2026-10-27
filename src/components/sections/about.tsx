"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useMediaViewport } from "@/hooks/use-media-viewport";

export interface AboutPhoto {
  readonly url: string;
  readonly key: string;
}

interface AboutProps {
  readonly photos: readonly AboutPhoto[];
  readonly loading?: boolean;
}

export function About({ photos, loading = false }: AboutProps): React.ReactElement {
  const { ref, hasApproached } = useMediaViewport<HTMLElement>();
  const [index, setIndex] = useState(0);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const current = photos[index];
  return (
    <section id="about" ref={ref} className="portfolio-about">
      <div className="about-portrait">
        {current && hasApproached && failedUrl !== current.url ? (
          <Image
            src={current.url}
            alt="Vincent Guanco"
            fill
            quality={60}
            sizes="(max-width: 767px) 100vw, 44vw"
            className="portrait-image"
            onError={() => setFailedUrl(current.url)}
          />
        ) : (
          <div className="portrait-placeholder">
            <span>VG</span>
            {hasApproached && <p>{loading ? "Loading portrait" : "Portrait unavailable"}</p>}
          </div>
        )}
        {photos.length > 1 && (
          <div className="portrait-controls">
            <button type="button" aria-label="Previous portrait" onClick={() => setIndex((index + photos.length - 1) % photos.length)}><ArrowLeft size={18} /></button>
            <span aria-live="polite">{index + 1} / {photos.length}</span>
            <button type="button" aria-label="Next portrait" onClick={() => setIndex((index + 1) % photos.length)}><ArrowRight size={18} /></button>
          </div>
        )}
      </div>
      <div className="about-content">
        <h2>Vincent<br />Guanco.</h2>
        <p className="about-role">Photographer | Videographer</p>
        <p className="about-location">Based in Paris</p>
        <div id="contact" className="contact-block">
          <h3>Contact</h3>
          <a className="contact-email" href="mailto:vincentguancostaes@gmail.com">vincentguancostaes@gmail.com<ArrowUpRight size={22} aria-hidden="true" /></a>
          <div className="contact-other">
            <a href="https://wa.me/33614984173" target="_blank" rel="noopener noreferrer">
              <span>WhatsApp <ArrowUpRight size={15} aria-hidden="true" /></span>
              <strong>+33 614 98 41 73</strong>
              <small>Discuss your project on WhatsApp</small>
            </a>
            <a href="https://www.instagram.com/vincentguanco/" target="_blank" rel="noopener noreferrer">
              <span>Instagram <ArrowUpRight size={15} aria-hidden="true" /></span>
              <strong>@vincentguanco</strong>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
