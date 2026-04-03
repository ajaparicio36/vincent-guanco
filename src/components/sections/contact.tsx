"use client";

import { useRef, useState, type FormEvent } from "react";
import { motion, useInView } from "framer-motion";

export function Contact(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const formRef = useRef<HTMLDivElement>(null);
  const formInView = useInView(formRef, { once: true, margin: "-80px" });

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="flex flex-col overflow-x-hidden"
    >
      {/* Top: Vision split */}
      <div className="py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left: placeholder image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="aspect-[4/5] overflow-hidden bg-surface-container-low"
          >
            {/* TODO: swap with street fashion shot — Paris 1st arrondissement, daylight, grayscale hover effect */}
            <div
              className="w-full h-full transition-all duration-700"
              style={{
                background:
                  "linear-gradient(170deg, #cac9bd 0%, #b0aea3 50%, #a8a79c 100%)",
                filter: "grayscale(1) brightness(1.05)",
              }}
            />
          </motion.div>

          {/* Right: text */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <span className="font-sans uppercase tracking-[0.3em] text-[10px] text-secondary">
              AESTHETIC &amp; VISION
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extralight tracking-tight leading-[1.1] text-[#0e0e0c]">
              Captured in the streets of the 1st Arrondissement.
            </h2>
            <p className="font-sans text-lg text-on-surface-variant max-w-md leading-relaxed font-light">
              Defining luxury through the lens of minimalism and Parisian
              architectural light. A quiet study of form and texture.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom: Contact form */}
      <div className="bg-[#F5F2ED] w-full">
        <div
          ref={formRef}
          className="flex flex-col md:flex-row w-full px-6 md:px-12 py-20 md:py-48 items-baseline max-w-7xl mx-auto"
        >
          {/* Left: heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={formInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-1/2 mb-16 md:mb-0"
          >
            <h2 className="font-serif text-4xl sm:text-6xl md:text-8xl font-light tracking-tight text-[#0e0e0c]">
              Let&apos;s Work
              <br />
              Together
            </h2>
          </motion.div>

          {/* Right: email input */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={formInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-1/2 flex items-end"
          >
            {submitted ? (
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary">
                Thank you — we&apos;ll be in touch.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-md relative"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL@EXAMPLE.COM"
                  className="w-full bg-transparent border-0 border-b border-[#0e0e0c] focus:border-[#0e0e0c] focus:ring-0 focus:outline-none placeholder:text-[#0e0e0c]/30 text-[#0e0e0c] font-sans text-xs tracking-[0.2em] py-4 pr-10 uppercase transition-all duration-500"
                />
                <button
                  type="submit"
                  className="absolute right-0 bottom-4 text-[#0e0e0c] hover:translate-x-2 transition-transform duration-300"
                  aria-label="Submit"
                >
                  →
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
