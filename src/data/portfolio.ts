interface WorkBase {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly width: number;
  readonly height: number;
  readonly thumbnail: string;
}

export type PortfolioWork = WorkBase & (
  | { readonly kind: "photo"; readonly src: string }
  | { readonly kind: "video"; readonly src: string; readonly duration: string }
);

const ROOT = "/portfolio/2026-10/";

function photo(id: string, title: string, description: string, width = 1067, height = 1600): PortfolioWork {
  return { id, title, description, width, height, kind: "photo", src: ROOT + id + ".webp", thumbnail: ROOT + id + "-thumb.webp" };
}

function film(id: string, title: string, description: string, duration: string, width = 720, height = 1280): PortfolioWork {
  return { id, title, description, duration, width, height, kind: "video", src: ROOT + id + ".mp4", thumbnail: ROOT + id + "-poster.webp" };
}

/** Stable source catalog; shuffled once per load. Provenance is in docs/portfolio-media.md. */
export const PORTFOLIO_WORK = [
  photo("photo-14", "Above Paris", "A fashion portrait on a Paris rooftop overlooking the Eiffel Tower.", 1600, 1323),
  photo("photo-16", "Silver light", "A close fashion portrait with silver fabric, pale hair and sculptural architecture."),
  photo("photo-13", "The details", "A blue sculptural handbag, golden jewellery and a red ruffled blouse."),
  film("film-01", "Street study", "A portrait in a red leather jacket on a city street.", "0:14", 1280, 720),
  photo("photo-06", "After the walk", "A runway model in a black dress beneath a line of show lights."),
  photo("photo-18", "By the water", "An evening portrait in a silver dress beside the sea."),
  film("film-09", "Schiaparelli fittings", "A sequence of garments, fittings and accessories in an atelier.", "0:19", 1280, 720),
  photo("photo-01", "Between shows", "Two street-style portraits together beside a city crossing."),
  film("film-08", "AMIRI", "Details, portraits and runway moments from the AMIRI film.", "0:32"),
  photo("photo-17", "An afternoon outside", "A portrait in a colour-block jacket, lying beneath trees."),
  film("film-11", "VETEMENTS", "Arrival portraits, event moments and fashion details.", "0:39", 1280, 720),
  photo("photo-02", "Evening, in lace", "A fashion portrait in black lace inside an ornate room."),
  film("film-02", "The corridor", "A black evening gown moving through a warmly lit corridor.", "0:21"),
  film("film-03", "In close-up", "A close portrait sequence in a black lace dress.", "0:26"),
  photo("photo-15", "Under the lights", "An evening runway look, surrounded by a seated audience."),
  film("film-04", "On the carpet", "An evening portrait on the carpet, in black lace and green jewellery.", "0:17"),
  film("film-05", "In the city", "Street fashion in a dark jersey, sunglasses and a fur hat.", "0:20"),
  film("film-06", "After dark", "A portrait in a dark suit and sunglasses against the night.", "0:18"),
  film("film-07", "Gold details", "An evening look with sculptural golden jewellery and a black handbag.", "0:18"),
  film("film-10", "Tamara", "A street portrait in a grey jacket with gold accessories.", "0:19", 960, 720),
  photo("photo-03", "Runway / Floral", "A floral runway look, photographed full length."),
  photo("photo-04", "Runway / Graphic", "A graphic black-and-white runway look."),
  photo("photo-05", "Runway / Texture", "A dark textured runway look beneath overhead lights."),
  photo("photo-07", "Runway / Gold", "A golden patterned dress on the runway."),
  photo("photo-08", "Runway / White", "A layered white runway look with a dark handbag."),
  photo("photo-09", "Runway / Movement", "A flowing white runway dress captured in motion."),
  photo("photo-10", "Runway / Form", "A sculptural white hat and dress on the runway.", 1066, 1600),
  photo("photo-11", "Runway / Finale", "A model leading a sequence of evening runway looks."),
  photo("photo-12", "The final walk", "The runway finale, with several models walking in both directions."),
] as const satisfies readonly PortfolioWork[];
