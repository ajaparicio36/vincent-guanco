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

const ROOT = "/portfolio/2026-11-final/";

function photo(id: string, title: string, description: string, width = 1067, height = 1600): PortfolioWork {
  return { id, title, description, width, height, kind: "photo", src: ROOT + id + ".webp", thumbnail: ROOT + id + "-thumb.webp" };
}

function film(id: string, title: string, description: string, duration: string, width = 720, height = 1280): PortfolioWork {
  return { id, title, description, duration, width, height, kind: "video", src: ROOT + id + ".mp4", thumbnail: ROOT + id + "-poster.webp" };
}

/** Stable source catalog; shuffled once per load. Provenance is in docs/portfolio-media.md. */
export const PORTFOLIO_WORK = [
  photo("sandro-paris", "SANDRO PARIS", "A fashion portrait on a Paris rooftop overlooking the Eiffel Tower.", 1600, 1323),
  film("balmain", "BALMAIN", "A fashion portrait in a black outfit against a pale event backdrop.", "0:12"),
  photo("editorial", "EDITORIAL", "A close portrait in pale fabric against sculptural architecture."),
  film("amiri", "AMIRI", "Street-style portraits, fashion details and runway moments.", "0:32"),
  photo("carolines-couture", "CAROLINE'S COUTURE", "A model in a dark evening dress walking a runway beneath warm lights."),
  film("georges-hobeika", "GEORGES HOBEIKA", "Evening gowns and models on a warmly lit runway.", "0:49"),
  photo("kristel-x-chopard", "KRISTEL X CHOPARD", "A portrait in a silver dress beside the water."),
  film("hermes", "HERMES", "A street-style portrait in a red leather jacket and sunglasses.", "0:14", 1280, 720),
  photo("miumiu", "MIUMIU", "Two street-style portraits together beside a city crossing."),
  film("karl-lagerfeld", "KARL LAGERFELD", "A portrait in a dark suit and sunglasses at night.", "0:18"),
  photo("weinsanto", "WEINSANTO", "A runway model in a black dress beneath a line of show lights."),
  film("le-grand-diner-du-louvre", "LE GRAND DINER DU LOUVRE", "A black evening gown moving through a warmly lit corridor.", "0:21"),
  photo("vincent-x-tommy-hilfiger", "VINCENT X TOMMY HILFIGER", "A portrait in a colour-block jacket, lying beneath trees."),
  film("schiaparelli", "SCHIAPARELLI", "Garments, fittings and accessories in an atelier.", "0:19", 1280, 720),
  film("amfar-gala", "AMFAR GALA", "A black lace evening look and green jewellery at an event backdrop.", "0:17"),
  film("simon-x-songmont", "SIMON X SONGMONT", "A street-style portrait followed by accessories and an exhibition.", "0:19"),
  film("stella-maxwell", "STELLA MAXWELL", "A portrait sequence in a black lace and feather dress.", "0:26"),
  film("vetements", "VETEMENTS", "Arrival portraits, fashion details and event moments.", "0:39", 1280, 720),
  film("zuhair-murad", "ZUHAIR MURAD", "A sequence of evening looks on a dark runway.", "0:33"),
] as const satisfies readonly PortfolioWork[];
