# Implementation Plan: Vincent Guanco Photography Portfolio

## Context
Building a one-page smooth-scrolling photographer portfolio for "Paris Photo & Video" (Vincent Guanco). The design follows a "Parisian Editorial Minimalism" system from Stitch — luxury, print-inspired, asymmetric layouts with extreme whitespace, serif/sans-serif contrast, no shadows, 0px corners, and a film-grain overlay. The site showcases fashion photography (4:5 aspect ratio) and short videos.

**Stack:** Next.js 16.2.2, React 19, Tailwind v4, shadcn/ui (base-nova), pnpm

---

## Phase 1 — Copy Plan to `./docs/implementation-plan.md`
- [x] Copy this final plan into `./docs/implementation-plan.md` so future sessions can reference it
- [x] Mark phases as completed as work progresses

---

## Phase 2 — Save Stitch Screens as HTML References
- [x] Create `./assets/stitch-designs/` directory
- [x] Download and save the HTML for each screen using their `htmlCode.downloadUrl`:
  - `hero.html` — Hero section (screen `edab7a58a94f4d42a328e16d0c67a92e`)
  - `about.html` — About section (screen `1c522aac1e2a40c58cc96822d273dc92`)
  - `collections.html` — Collections/Archive navigator (screen `51167f589c734898882c4efdc9fd5553`)
  - `contact-footer.html` — Contact & Footer (screen `f50b5013ae8340e18a1ec580f5cd9487`)
- [ ] Save screenshots as reference images alongside the HTML
- [x] Save the design system markdown from the Stitch project data as `design-system.md`

**HTML download URLs:**
- Hero: `https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzZiNTczM2EwZjRlZjQ0NjhiODlhOTFlZjAwNzBlYjZkEgoSBhD7iOvERhgBkgEjCgpwcm9qZWN0X2lkEhVCEzg2MDU2NDI3NDkxOTU5NzUzODk&filename=&opi=89354086`
- About: `https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sX2ExMGRjZDUxNmE1ZTQ2ZjRiNzc1ZWQ3NTY1MDJlM2ZlEgoSBhD7iOvERhgBkgEjCgpwcm9qZWN0X2lkEhVCEzg2MDU2NDI3NDkxOTU5NzUzODk&filename=&opi=89354086`
- Collections: `https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzc2OWQ3Mzc5YmJiOTRiZjE5OTdlMjRlZDUxMTFiY2EyEgoSBhD7iOvERhgBkgEjCgpwcm9qZWN0X2lkEhVCEzg2MDU2NDI3NDkxOTU5NzUzODk&filename=&opi=89354086`
- Contact: `https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzhjYjRmNTBmYTZhODRiMTA5ZjA0ODA2YzI3YzY1YWIzEgoSBhD7iOvERhgBkgEjCgpwcm9qZWN0X2lkEhVCEzg2MDU2NDI3NDkxOTU5NzUzODk&filename=&opi=89354086`

**Screenshot URLs:**
- Hero: `https://lh3.googleusercontent.com/aida/ADBb0uiJjr8oqPO3Q6eEw63Qe-Wm4Dh9JyxyVZNo3XGUgAJJhq9PGIWW9Q3doeydn-Fre3tljn0c4LZ-6TLBv-iKlRCrnlgN1pQe0go_HO_wM7oUYfRJut-AOMxW_J-yGqoO2V9rYtu_RaGRYve6_1A1U4RLA5ve83Z745LUpUjwNwgkI7BqgJVEmHYr8cuRP1PP0Vf0LA7KLUSoorrPsw7xiVb79FrPiK74aHgfd0fyI_AjzeShzzYhglwAMQ`
- About: `https://lh3.googleusercontent.com/aida/ADBb0ug68-x4iR-VuWD5Zwyab3-jsI69Hqw076yPuiisZeWJY763ju1g3eXimxCkBR1trkxsJyMf7GpMwhYDEd2YLeHL_SuvJB78nboxNXyZ8g85Tdf3i6xpd7agmfWRerMBEFyIZc9oegAMs1kt4W42fVE2DOYCDrnojn6Tb9M3-EKUMdt0xyxqWDK3dFkG_cq_4m8iduAYwf7J7kh4tCE3Xe75kAQ1kWVAv0V9RGhm3g8HBErQZJaWqCkz4g`
- Collections: `https://lh3.googleusercontent.com/aida/ADBb0uiytEL_trcGmL9DCVoT8bxJUEu9IDacG_hOkKFFYJlEgf-Vbkv8lClXm4Ep22SmUh1viV8LeGOSYRp1LkZ0NDtn8wTB2jQq5fCeU4PHfi0T0LkUflm1eddkBG2PxQdlOxJliIT89rOO-l6IDGxA5AhWh8zuoOFWr_azLUIqfFux2o2KeTnf9dU6phVNkeTUt_nZJB_9L5EqDsbP4kcEM-vpbA-BEIJMXj5ajCb_uUHY68nYdZZkfa1v`
- Contact: `https://lh3.googleusercontent.com/aida/ADBb0uhZl1cuq0dXUMF_1DJF6wU5stArZwLhVN0G2cbhR4mz4hx-MxU8EyK8YDeY5k_YRIkRxy_NMDRQcpLdxDl8ygWCF3FhDde2Kyl660J532Mp1GGp8-feedE3bjIRlYqJGEBtbVyUxiwK8nW7fjEdAXiXEdhrdZVVENoMUs0os93xwMyibgcyBS9VkGoeT6yPBwgt9N-SEmlEezekhQfGidNlrcIEktxsalfEo7RqMpN6imxkvV17SDldAg`

---

## Phase 3 — Prepare Dependencies, Typography & Design Tokens
- [x] Install animation library (framer-motion for scroll-triggered animations)
- [x] Configure fonts in `layout.tsx`: **Newsreader** (serif, headlines) + **Inter** (sans-serif, body/labels) via `next/font/google`
- [x] Override globals.css color tokens to match design system:
  - Background: `#fffcf7` (bone white)
  - Foreground/Text: `#0e0e0c` (near-black charcoal)
  - Secondary/Stone: `#6f6349` (warm stone accent)
  - Surface containers: `#f6f4ec`, `#f0eee5`, `#eae8de`, `#fcf9f3`
  - Outline: `#818178`, Outline-variant: `#babab0`
- [x] Set `--radius: 0` (0px corners per design system)
- [x] Remove dark mode (this is a light-only editorial design)
- [x] Add custom Tailwind theme extensions for:
  - Font families (`font-serif`, `font-sans`)
  - Design-specific spacing scale (the design uses 3x spacing scale)
  - Letter-spacing utilities for wide-tracked labels (`tracking-editorial`)
- [x] Create the film-grain noise texture overlay (3% opacity, fixed to viewport)
- [x] Set up smooth scroll CSS (`scroll-behavior: smooth` on html)

---

## Phase 4A — Layout Shell & Navigation
- [x] Replace boilerplate `page.tsx` with section-based one-page layout
- [x] Create `src/components/layout/navigation.tsx` — sticky/fixed nav bar:
  - "PARIS | PHOTO & VIDEO" branding top-left (uppercase, wide-tracked Inter)
  - Nav links: WORK, ABOUT, CONTACT (uppercase Inter labels)
  - Smooth-scroll anchor links to each section
- [x] Wire up scroll-spy for active nav state (IntersectionObserver)

## Phase 4B — Hero Section
- [x] Create `src/components/sections/hero.tsx`
- [x] Full-bleed hero image (100vw x 100vh) with placeholder (gradient)
- [x] Gradient overlay for text legibility
- [x] Serif display text: "The Silent Curator" italic headline
- [x] Scroll-down indicator (bottom-right)
- [x] Entrance animation (framer-motion fade+slide)
- [x] Placeholder container documented with TODO comment for real photo swap

## Phase 4C — Collections / Archive Section
- [x] Create `src/components/sections/collections.tsx`
- [x] Large serif italic "Archive" heading
- [x] Two category sections: PHOTOS (Editorial, Brands, Portrait, Campaign, Personal) + VIDEOS (Motion, Commercial, Documentary)
- [x] Each row with hairline dividers (outline-variant at 10-30% opacity)
- [x] Hover filmstrip effect (CSS group-hover, placeholder strips)
- [x] Editorial quote block at bottom with attribution
- [x] Scroll-triggered fade-in animations for list items (framer-motion + useInView)

## Phase 4D — About Section
- [x] Create `src/components/sections/about.tsx`
- [x] 50/50 asymmetric split layout
- [x] Left: full-height portrait placeholder (sticky on desktop)
- [x] Right: "Vincent Guanco" serif heading + bio paragraphs + action links
- [x] Wide-tracked uppercase "ABOUT" label with hairline
- [x] Scroll-triggered entrance animation (image from left, text from right)

## Phase 4E — Contact & Footer Section
- [x] Create `src/components/sections/contact.tsx`
- [x] Top: split layout — 4:5 placeholder image + "Captured in the streets..." serif text
- [x] Bottom: "Let's Work Together" heading + email input (bottom-border-only, 0px radius)
- [x] Form submit shows success state
- [x] Create `src/components/sections/footer.tsx`
- [x] Three-column footer: branding | nav links | copyright

## Phase 4F — Scroll Animations & Polish
- [x] framer-motion scroll-triggered animations on all sections (useInView)
- [x] Film-grain overlay renders across all sections (fixed, z-index 9999)
- [x] Smooth scrolling active (scroll-behavior: smooth in globals.css)
- [x] Responsive layout adjustments (mobile/desktop breakpoints)
- [x] Build passes cleanly (pnpm build ✓)

---

## Phase 5 — Documentation & Verification
- [ ] Create `./docs/CONTEXT.md` with:
  - Tech stack summary (Next.js 16, React 19, Tailwind v4, shadcn, framer-motion)
  - Design system origin (Stitch project, Parisian Editorial Minimalism)
  - Color tokens, typography, spacing conventions
  - Component architecture (sections-based single page)
  - File structure overview
  - How to swap placeholder images for real photography
  - Key patterns: Server Components by default, client boundaries only for animations
- [ ] Update `./docs/implementation-plan.md` marking all phases complete
- [ ] Verify build passes (`pnpm build`)
- [ ] Visual check against Stitch screenshots

---

## Key Design System Rules (Quick Reference)
| Rule | Detail |
|------|--------|
| Corners | Always 0px |
| Shadows | Forbidden (use surface tiers for depth) |
| Background | `#fffcf7` bone white |
| Text | `#0e0e0c` near-black (never #000) |
| Accent | `#6f6349` warm stone |
| Headlines | Newsreader serif, tight tracking (-2%) |
| Labels | Inter uppercase, letter-spacing 0.1-0.15em |
| Dividers | 1px outline-variant at 20% opacity max |
| Whitespace | Extreme — when in doubt, double it |
| Layout | Asymmetric (35/65, 40/60) |
| Film grain | 3% opacity noise texture, fixed viewport |
| Icons | Avoid — use text labels instead |

## Stitch Project Reference
- **Project ID:** `8605642749195975389`
- **Title:** Hero - Paris Photo & Video
- **Screen IDs:**
  - Hero: `edab7a58a94f4d42a328e16d0c67a92e`
  - About: `1c522aac1e2a40c58cc96822d273dc92`
  - Collections: `51167f589c734898882c4efdc9fd5553`
  - Contact & Footer: `f50b5013ae8340e18a1ec580f5cd9487`
  - Design System: `asset-stub-assets-8ec9c2899cb54abcb6c3e1c59bfbce1e-1774340710625`

## Critical Files
- `src/app/layout.tsx` — fonts, metadata, global shell
- `src/app/globals.css` — color tokens, design overrides
- `src/app/page.tsx` — main page composing all sections
- `src/components/layout/navigation.tsx` — sticky nav
- `src/components/sections/hero.tsx`
- `src/components/sections/collections.tsx`
- `src/components/sections/about.tsx`
- `src/components/sections/contact.tsx`
- `src/components/sections/footer.tsx`
- `assets/stitch-designs/` — reference HTML/screenshots
- `docs/implementation-plan.md` — this plan (trackable)
- `docs/CONTEXT.md` — codebase context for future sessions
