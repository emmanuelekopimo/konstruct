// Five sample building plans. scripts/make-samples.ts renders each one into a
// drawing sheet PDF in public/samples/ and an SVG thumbnail used on the cards.

export type Room = {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Edges with a window: n (top), s (bottom), e (right), w (left). */
  win?: string;
  hatch?: boolean;
};

export type Floor = { label: string; rooms: Room[] };

export type SamplePlan = {
  key: string;
  title: string;
  shortTitle: string;
  buildingType: "bungalow" | "duplex" | "block_of_flats" | "commercial";
  city: string;
  state: string;
  site: string;
  client: string;
  architect: string;
  drawingNo: string;
  blurb: string;
  floors: Floor[];
  specs: string[];
  doors: string[];
  windows: string[];
};

export const SAMPLE_PLANS: SamplePlan[] = [
  {
    key: "bungalow-2bed-ikorodu",
    title: "Two Bedroom Bungalow",
    shortTitle: "2-bed bungalow",
    buildingType: "bungalow",
    city: "Ikorodu",
    state: "Lagos",
    site: "Plot 14, Agric Road, Ikorodu, Lagos State",
    client: "Mr and Mrs Babatunde Ogunleye",
    architect: "Adebayo Lawal, MNIA",
    drawingNo: "KS-01/A-101",
    blurb: "Compact family starter home, about 96 m2, single floor.",
    floors: [
      {
        label: "Ground floor plan",
        rooms: [
          { name: "Living room", x: 0, y: 0, w: 5.4, h: 5.0, win: "nw" },
          { name: "Dining", x: 0, y: 5.0, w: 5.4, h: 3.4, win: "ws" },
          { name: "Kitchen", x: 5.4, y: 0, w: 3.0, h: 3.0, win: "n" },
          { name: "Bath / WC", x: 8.4, y: 0, w: 3.0, h: 1.8, win: "e" },
          { name: "Store", x: 8.4, y: 1.8, w: 3.0, h: 1.2 },
          { name: "Corridor", x: 5.4, y: 3.0, w: 6.0, h: 1.2 },
          { name: "Bedroom 1", x: 5.4, y: 4.2, w: 3.0, h: 4.2, win: "s" },
          { name: "Bedroom 2", x: 8.4, y: 4.2, w: 3.0, h: 4.2, win: "se" },
        ],
      },
    ],
    specs: [
      "Foundation: strip footing 675mm wide x 225mm thick, 1:3:6 concrete, base at 900mm below ground. 4 courses of 9 inch blocks filled with concrete below DPC.",
      "Ground floor: 150mm oversite concrete 1:2:4 on 1000 gauge DPM on compacted laterite filling, 450mm average depth.",
      "Walls: 9 inch sandcrete blocks to external walls, 6 inch to internal walls, 3.0m high, 1:6 mortar. Lintel 225 x 225mm all round with 4 no. 12mm rods and 10mm links at 200mm.",
      "Columns: 225 x 225mm at corners and wall junctions (12 no.), 4 no. 12mm rods, 10mm links at 200mm.",
      "Roof: hipped roof, 2x4 inch hardwood rafters at 600mm, 2x6 inch wall plate, long-span aluminium 0.55mm, 600mm overhang.",
      "Finishes: 60x60cm porcelain tiles to all floors, ceramic wall tiles to bath and kitchen to 1.8m. Cement render 1:4 both faces. PVC ceiling throughout. Emulsion paint internally, textured paint externally.",
      "Services: 1 WC, 1 basin, 1 shower, 1 kitchen sink, 2000L overhead tank. 14 light points, 12 double sockets, 1 distribution board.",
    ],
    doors: ["D1 Steel security door 1.2 x 2.1m: 2 no.", "D2 Hardwood panel door 0.9 x 2.1m: 4 no."],
    windows: ["W1 Aluminium sliding window 1.2 x 1.2m: 7 no.", "W2 Louvre window 0.6 x 0.6m (bath): 1 no."],
  },
  {
    key: "bungalow-3bed-lugbe",
    title: "Three Bedroom Bungalow",
    shortTitle: "3-bed bungalow",
    buildingType: "bungalow",
    city: "Abuja",
    state: "FCT",
    site: "Plot 2207, Sector F, Lugbe, Abuja FCT",
    client: "Dr Aisha Bello",
    architect: "Ibrahim Musa, MNIA",
    drawingNo: "KS-02/A-101",
    blurb: "Three bedrooms with master en-suite and study, about 162 m2.",
    floors: [
      {
        label: "Ground floor plan",
        rooms: [
          { name: "Sitting room", x: 0, y: 0, w: 6.0, h: 5.4, win: "nw" },
          { name: "Dining", x: 0, y: 5.4, w: 6.0, h: 2.7, win: "w" },
          { name: "Kitchen", x: 0, y: 8.1, w: 3.6, h: 2.7, win: "ws" },
          { name: "Laundry / Store", x: 3.6, y: 8.1, w: 2.4, h: 2.7, win: "s" },
          { name: "Corridor", x: 6.0, y: 0, w: 1.2, h: 10.8 },
          { name: "Master bedroom", x: 7.2, y: 0, w: 4.8, h: 4.2, win: "n" },
          { name: "Master bath", x: 12.0, y: 0, w: 3.0, h: 2.4, win: "ne" },
          { name: "Closet", x: 12.0, y: 2.4, w: 3.0, h: 1.8 },
          { name: "Bedroom 2", x: 7.2, y: 4.2, w: 3.9, h: 3.6 },
          { name: "Bedroom 3", x: 11.1, y: 4.2, w: 3.9, h: 3.6, win: "e" },
          { name: "Shared bath", x: 7.2, y: 7.8, w: 2.4, h: 3.0, win: "s" },
          { name: "Guest WC", x: 9.6, y: 7.8, w: 1.8, h: 3.0, win: "s" },
          { name: "Study", x: 11.4, y: 7.8, w: 3.6, h: 3.0, win: "se" },
        ],
      },
    ],
    specs: [
      "Foundation: strip footing 750mm wide x 225mm thick, 1:3:6 concrete, base at 1.0m below ground. 5 courses of 9 inch blocks filled with concrete below DPC.",
      "Ground floor: 150mm oversite concrete 1:2:4 with A142 mesh on 1000 gauge DPM on compacted laterite filling, 600mm average depth.",
      "Walls: 9 inch sandcrete blocks to external walls, 6 inch to internal walls, 3.0m high. Lintel 225 x 225mm all round, 4 no. 12mm rods, 10mm links at 200mm.",
      "Columns: 225 x 225mm, 18 no., 4 no. 12mm rods, 10mm links at 200mm.",
      "Roof: hipped roof, hardwood 2x4 inch rafters and 2x6 inch purlins and wall plate, long-span aluminium 0.55mm, 600mm overhang. Fascia 1x12 inch.",
      "Finishes: 60x60cm porcelain tiles to all floors, ceramic wall tiles to bathrooms full height 2.4m and kitchen splash 1.2m. PVC ceiling to all rooms. Emulsion internally, textured paint externally, gloss to doors.",
      "Services: 3 WC, 3 basins, 2 showers, 1 kitchen sink, 2 no. 2000L tanks. 24 light points, 22 double sockets, 1 distribution board.",
    ],
    doors: ["D1 Steel security door 1.2 x 2.1m: 2 no.", "D2 Hardwood panel door 0.9 x 2.1m: 9 no."],
    windows: ["W1 Aluminium sliding window 1.2 x 1.2m: 12 no.", "W2 Louvre window 0.6 x 0.6m: 4 no."],
  },
  {
    key: "duplex-4bed-lekki",
    title: "Four Bedroom Duplex",
    shortTitle: "4-bed duplex",
    buildingType: "duplex",
    city: "Lagos",
    state: "Lagos",
    site: "Plot 31, Ocean View Estate, Lekki Phase 2, Lagos State",
    client: "Mr Chukwuemeka Nwosu",
    architect: "Funmilayo Adeyemi, MNIA",
    drawingNo: "KS-03/A-101",
    blurb: "Two-storey family home, suspended slab, about 328 m2.",
    floors: [
      {
        label: "Ground floor plan",
        rooms: [
          { name: "Living room", x: 0, y: 0, w: 7.2, h: 6.0, win: "nw" },
          { name: "Dining", x: 7.2, y: 0, w: 4.2, h: 4.2, win: "n" },
          { name: "Kitchen", x: 11.4, y: 0, w: 3.0, h: 4.2, win: "ne" },
          { name: "Store", x: 11.4, y: 4.2, w: 3.0, h: 1.8 },
          { name: "Guest bedroom", x: 0, y: 6.0, w: 4.2, h: 5.4, win: "ws" },
          { name: "Guest bath", x: 4.2, y: 6.0, w: 3.0, h: 2.4 },
          { name: "Visitors WC", x: 4.2, y: 8.4, w: 3.0, h: 3.0, win: "s" },
          { name: "Hall and stairs", x: 7.2, y: 4.2, w: 4.2, h: 7.2, win: "s" },
          { name: "Laundry", x: 11.4, y: 6.0, w: 3.0, h: 5.4, win: "es" },
        ],
      },
      {
        label: "First floor plan",
        rooms: [
          { name: "Master bedroom", x: 0, y: 0, w: 5.4, h: 5.4, win: "nw" },
          { name: "Master bath", x: 5.4, y: 0, w: 3.0, h: 3.0, win: "n" },
          { name: "Closet", x: 5.4, y: 3.0, w: 3.0, h: 2.4 },
          { name: "Family lounge", x: 8.4, y: 0, w: 6.0, h: 5.4, win: "ne" },
          { name: "Bedroom 2", x: 0, y: 5.4, w: 4.2, h: 6.0, win: "ws" },
          { name: "Bath 2", x: 4.2, y: 5.4, w: 3.0, h: 2.4 },
          { name: "Bath 3", x: 4.2, y: 7.8, w: 3.0, h: 3.6, win: "s" },
          { name: "Landing", x: 7.2, y: 5.4, w: 4.2, h: 6.0 },
          { name: "Bedroom 3", x: 11.4, y: 5.4, w: 3.0, h: 6.0, win: "es" },
        ],
      },
    ],
    specs: [
      "Foundation: reinforced strip footing 900mm wide x 250mm thick, 1:2:4 concrete, 3 no. 12mm rods longitudinal and 12mm at 225mm across, base at 1.2m. 5 courses of 9 inch blocks filled with concrete below DPC.",
      "Ground floor: 150mm oversite concrete 1:2:4 on DPM on compacted laterite filling, 600mm deep.",
      "Frame: 225 x 225mm columns (22 no., 2 storeys at 3.0m), 4 no. 16mm rods, 10mm links at 150mm. Beams 225 x 450mm at first floor and roof level, 4 no. 16mm rods, 10mm links at 200mm.",
      "First floor: 150mm suspended slab 1:2:4 over the full footprint, 12mm rods at 150mm both ways bottom and 12mm top at supports. Formwork in 1x12 inch planks on 2x4 inch props.",
      "Stairs: reinforced concrete waist slab 150mm, 16 risers, 12mm rods at 150mm.",
      "Walls: 9 inch blocks external, 6 inch internal, 3.0m per floor. Roof: stone-coated roofing tiles on 2x4 inch battens and 2x6 inch rafters at 600mm.",
      "Finishes: 60x60cm porcelain floor tiles throughout, wall tiles to all baths and kitchen to 2.4m, POP ceiling throughout. Emulsion internally, textured paint externally.",
      "Services: 5 WC, 5 basins, 4 showers, 1 kitchen sink, 2 no. 2000L tanks. 48 light points, 40 double sockets, 2 distribution boards.",
    ],
    doors: ["D1 Steel security door 1.5 x 2.4m (main): 1 no., 1.0 x 2.1m (kitchen): 1 no.", "D2 Hardwood panel door 0.9 x 2.1m: 14 no."],
    windows: ["W1 Aluminium sliding window 1.2 x 1.2m: 22 no.", "W2 Louvre window 0.6 x 0.6m: 6 no."],
  },
  {
    key: "flats-4x2bed-rumuokoro",
    title: "Block of Four 2-Bedroom Flats",
    shortTitle: "Block of 4 flats",
    buildingType: "block_of_flats",
    city: "Port Harcourt",
    state: "Rivers",
    site: "No. 7 Okporo Road, Rumuokoro, Port Harcourt, Rivers State",
    client: "Chief Tamuno Briggs",
    architect: "Ebiere Dappa, MNIA",
    drawingNo: "KS-04/A-101",
    blurb: "Ground plus one, two flats per floor, about 440 m2.",
    floors: [
      {
        label: "Typical floor plan (ground and first floor identical)",
        rooms: [
          { name: "Living (Flat A)", x: 0, y: 0, w: 5.4, h: 5.4, win: "nw" },
          { name: "Kitchen A", x: 5.4, y: 0, w: 4.2, h: 3.0, win: "n" },
          { name: "Dining A", x: 5.4, y: 3.0, w: 4.2, h: 2.4 },
          { name: "Bedroom A1", x: 0, y: 5.4, w: 3.9, h: 5.4, win: "ws" },
          { name: "Bath A1", x: 3.9, y: 5.4, w: 2.1, h: 2.7 },
          { name: "Bath A2", x: 3.9, y: 8.1, w: 2.1, h: 2.7, win: "s" },
          { name: "Bedroom A2", x: 6.0, y: 5.4, w: 3.6, h: 5.4, win: "s" },
          { name: "Stairs", x: 9.6, y: 0, w: 1.2, h: 10.8, hatch: true },
          { name: "Living (Flat B)", x: 15.0, y: 0, w: 5.4, h: 5.4, win: "ne" },
          { name: "Kitchen B", x: 10.8, y: 0, w: 4.2, h: 3.0, win: "n" },
          { name: "Dining B", x: 10.8, y: 3.0, w: 4.2, h: 2.4 },
          { name: "Bedroom B1", x: 16.5, y: 5.4, w: 3.9, h: 5.4, win: "es" },
          { name: "Bath B1", x: 14.4, y: 5.4, w: 2.1, h: 2.7 },
          { name: "Bath B2", x: 14.4, y: 8.1, w: 2.1, h: 2.7, win: "s" },
          { name: "Bedroom B2", x: 10.8, y: 5.4, w: 3.6, h: 5.4, win: "s" },
        ],
      },
    ],
    specs: [
      "Building: ground floor plus first floor, footprint 20.4 x 10.8m, 2 flats per floor, 4 flats in total. Floor to floor 3.0m.",
      "Foundation: reinforced strip footing 900mm wide x 250mm, 1:2:4 concrete, 12mm rods, base at 1.2m (soft soil). 6 courses of 9 inch blocks filled with concrete below DPC.",
      "Ground floor: 150mm oversite concrete on DPM on 900mm laterite filling (waterlogged site).",
      "Frame: 225 x 225mm columns, 28 no. per floor, 4 no. 16mm rods, 10mm links at 150mm. Beams 225 x 450mm, 4 no. 16mm rods.",
      "First floor: 150mm suspended slab over the full footprint, 12mm rods at 150mm both ways. Concrete staircase.",
      "Walls: 9 inch blocks external and party wall, 6 inch internal. Roof: hipped, long-span aluminium 0.55mm on hardwood 2x4 and 2x6 inch members.",
      "Finishes per flat: porcelain floor tiles throughout, wall tiles to baths and kitchen, PVC ceiling, emulsion inside, textured paint outside.",
      "Services per flat: 2 WC, 2 basins, 2 showers, 1 kitchen sink. Shared 4 no. 2000L tanks. Per flat 16 light points, 14 double sockets, 1 distribution board.",
    ],
    doors: ["D1 Steel security door 1.0 x 2.1m: 8 no. (2 per flat)", "D2 Hardwood panel door 0.9 x 2.1m: 20 no. (5 per flat)"],
    windows: ["W1 Aluminium sliding window 1.2 x 1.2m: 32 no. (8 per flat)", "W2 Louvre window 0.6 x 0.6m: 8 no."],
  },
  {
    key: "shops-6-ogui-enugu",
    title: "Row of Six Lock-up Shops",
    shortTitle: "6 lock-up shops",
    buildingType: "commercial",
    city: "Enugu",
    state: "Enugu",
    site: "Plot 45, Ogui Road, Enugu, Enugu State",
    client: "Mrs Ngozi Eze",
    architect: "Obinna Okafor, MNIA",
    drawingNo: "KS-05/A-101",
    blurb: "Six shops with front walkway and two toilets, about 144 m2.",
    floors: [
      {
        label: "Ground floor plan",
        rooms: [
          { name: "Shop 1", x: 0, y: 0, w: 3.6, h: 4.8 },
          { name: "Shop 2", x: 3.6, y: 0, w: 3.6, h: 4.8 },
          { name: "Shop 3", x: 7.2, y: 0, w: 3.6, h: 4.8 },
          { name: "Shop 4", x: 10.8, y: 0, w: 3.6, h: 4.8 },
          { name: "Shop 5", x: 14.4, y: 0, w: 3.6, h: 4.8 },
          { name: "Shop 6", x: 18.0, y: 0, w: 3.6, h: 4.8 },
          { name: "WC 1", x: 21.6, y: 0, w: 2.4, h: 2.4, win: "e" },
          { name: "WC 2", x: 21.6, y: 2.4, w: 2.4, h: 2.4, win: "e" },
          { name: "Walkway", x: 0, y: 4.8, w: 24.0, h: 1.2, hatch: true },
        ],
      },
    ],
    specs: [
      "Foundation: strip footing 675mm wide x 225mm thick, 1:3:6 concrete, base at 900mm. 4 courses of 9 inch blocks filled with concrete below DPC.",
      "Floor: 150mm oversite concrete 1:2:4 on DPM on 300mm laterite filling, walkway 100mm thick with 1:3 screed.",
      "Walls: 9 inch sandcrete blocks to all walls, 3.6m high. Lintel 225 x 225mm all round, 4 no. 12mm rods.",
      "Columns: 225 x 225mm, 14 no., 4 no. 12mm rods. Walkway posts 225 x 225mm, 7 no.",
      "Roof: mono-pitch, long-span aluminium 0.55mm on 2x6 inch hardwood rafters at 900mm and 2x4 inch purlins, roof covers walkway.",
      "Shop fronts: galvanised steel roller shutter 3.0 x 3.0m to each shop (6 no.).",
      "Finishes: cement screed floors to shops, ceramic tiles to WCs. Emulsion inside, textured paint outside. No ceiling to shops.",
      "Services: 2 WC, 2 basins, 1 no. 2000L tank. Per shop 2 light points, 3 double sockets and 1 prepaid meter. 1 distribution board.",
    ],
    doors: ["D2 Hardwood panel door 0.8 x 2.1m (WC): 2 no.", "Roller shutter 3.0 x 3.0m: 6 no."],
    windows: ["W2 Louvre window 0.6 x 0.6m (WC): 2 no.", "Fanlight above shutters: 6 no. 3.0 x 0.4m"],
  },
];

export function getSample(key: string): SamplePlan | undefined {
  return SAMPLE_PLANS.find((s) => s.key === key);
}

export function samplePdfPath(key: string): string {
  return `/samples/${key}.pdf`;
}

export function sampleThumbPath(key: string): string {
  return `/samples/${key}.svg`;
}

/** Footprint size of a floor in metres. */
export function floorExtent(f: Floor): { w: number; h: number } {
  let w = 0;
  let h = 0;
  for (const r of f.rooms) {
    w = Math.max(w, r.x + r.w);
    h = Math.max(h, r.y + r.h);
  }
  return { w: round1(w), h: round1(h) };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/**
 * Draws a floor plan as SVG. With detail=false it is a clean thumbnail
 * (no labels); with detail=true it carries room names, sizes and dimensions.
 */
export function floorSvg(f: Floor, opts: { scale: number; detail: boolean; pad?: number }): string {
  const { scale: s, detail } = opts;
  const pad = opts.pad ?? (detail ? 40 : 8);
  const ext = floorExtent(f);
  const W = ext.w * s + pad * 2;
  const H = ext.h * s + pad * 2;
  const X = (m: number) => pad + m * s;
  const Y = (m: number) => pad + m * s;
  const parts: string[] = [];

  parts.push(
    `<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#9aa0a6" stroke-width="1"/></pattern></defs>`,
  );
  for (const r of f.rooms) {
    const fill = r.hatch ? "url(#hatch)" : detail ? "#ffffff" : "#e8f5ee";
    parts.push(
      `<rect x="${X(r.x)}" y="${Y(r.y)}" width="${r.w * s}" height="${r.h * s}" fill="${fill}" stroke="#202124" stroke-width="${detail ? 1.6 : 1.2}"/>`,
    );
    for (const edge of r.win ?? "") {
      const len = Math.min(1.2, (edge === "n" || edge === "s" ? r.w : r.h) * 0.6) * s;
      let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
      if (edge === "n" || edge === "s") {
        const cx = X(r.x + r.w / 2);
        const y = edge === "n" ? Y(r.y) : Y(r.y + r.h);
        [x1, y1, x2, y2] = [cx - len / 2, y, cx + len / 2, y];
      } else {
        const cy = Y(r.y + r.h / 2);
        const x = edge === "w" ? X(r.x) : X(r.x + r.w);
        [x1, y1, x2, y2] = [x, cy - len / 2, x, cy + len / 2];
      }
      parts.push(
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="${detail ? 6 : 4}"/>`,
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1a73e8" stroke-width="${detail ? 2 : 1.5}"/>`,
      );
    }
    if (detail) {
      const cx = X(r.x + r.w / 2);
      const cy = Y(r.y + r.h / 2);
      const small = r.w < 2.5 || r.h < 1.6;
      parts.push(
        `<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="${small ? 8 : 10}" font-weight="700" fill="#202124">${esc(r.name.toUpperCase())}</text>`,
        `<text x="${cx}" y="${cy + 11}" text-anchor="middle" font-size="${small ? 7 : 9}" fill="#5f6368">${r.w.toFixed(1)} x ${r.h.toFixed(1)}m</text>`,
      );
    }
  }
  // Thick outer wall.
  parts.push(
    `<rect x="${X(0)}" y="${Y(0)}" width="${ext.w * s}" height="${ext.h * s}" fill="none" stroke="#202124" stroke-width="${detail ? 4 : 2.5}"/>`,
  );
  if (detail) {
    const y = pad - 18;
    const x = pad - 18;
    parts.push(
      `<line x1="${X(0)}" y1="${y}" x2="${X(ext.w)}" y2="${y}" stroke="#5f6368"/>`,
      `<line x1="${X(0)}" y1="${y - 5}" x2="${X(0)}" y2="${y + 5}" stroke="#5f6368"/>`,
      `<line x1="${X(ext.w)}" y1="${y - 5}" x2="${X(ext.w)}" y2="${y + 5}" stroke="#5f6368"/>`,
      `<text x="${X(ext.w / 2)}" y="${y - 4}" text-anchor="middle" font-size="10" fill="#202124">${ext.w.toFixed(2)}m</text>`,
      `<line x1="${x}" y1="${Y(0)}" x2="${x}" y2="${Y(ext.h)}" stroke="#5f6368"/>`,
      `<line x1="${x - 5}" y1="${Y(0)}" x2="${x + 5}" y2="${Y(0)}" stroke="#5f6368"/>`,
      `<line x1="${x - 5}" y1="${Y(ext.h)}" x2="${x + 5}" y2="${Y(ext.h)}" stroke="#5f6368"/>`,
      `<text x="${x - 4}" y="${Y(ext.h / 2)}" text-anchor="middle" font-size="10" fill="#202124" transform="rotate(-90 ${x - 4} ${Y(ext.h / 2)})">${ext.h.toFixed(2)}m</text>`,
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Roboto, Arial, sans-serif">${parts.join("")}</svg>`;
}
