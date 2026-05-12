// ─── Study attributes ────────────────────────────────────────────────────
// Locked decisions per master checklist (v8)
// Brands: 3 · Price: 4 levels (₹ pack of 3) · Rating: 3 · Fabric: 3 · USP: 3

export const TASKS = [
  [{b:"Jockey",p:450,r:"4.5★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:600,r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:300,r:"3.9★",f:"Modal",u:"Highly Stretchable"}],
  [{b:"XYXX",p:800,r:"4.2★",f:"Blended Cotton",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:600,r:"4.2★",f:"Modal",u:"Highly Stretchable"},{b:"Jockey",p:300,r:"4.5★",f:"100% Cotton",u:"Highly Stretchable"}],
  [{b:"XYXX",p:300,r:"3.9★",f:"Blended Cotton",u:"Ultra Breathable"},{b:"Jockey",p:800,r:"4.2★",f:"100% Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:450,r:"4.2★",f:"100% Cotton",u:"Sweat Absorbent"}],
  [{b:"XYXX",p:300,r:"4.2★",f:"Modal",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:600,r:"4.2★",f:"Modal",u:"Ultra Breathable"},{b:"Jockey",p:800,r:"4.5★",f:"Modal",u:"Sweat Absorbent"}],
  [{b:"Jockey",p:800,r:"3.9★",f:"Blended Cotton",u:"Ultra Breathable"},{b:"Dixcy Scott Alpha",p:600,r:"4.5★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:450,r:"4.2★",f:"100% Cotton",u:"Highly Stretchable"}],
  [{b:"Jockey",p:600,r:"4.5★",f:"Modal",u:"Sweat Absorbent"},{b:"XYXX",p:300,r:"4.5★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:450,r:"3.9★",f:"100% Cotton",u:"Ultra Breathable"}],
  [{b:"Dixcy Scott Alpha",p:300,r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Jockey",p:450,r:"4.5★",f:"Modal",u:"Highly Stretchable"},{b:"XYXX",p:800,r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"}],
  [{b:"XYXX",p:600,r:"3.9★",f:"100% Cotton",u:"Highly Stretchable"},{b:"Jockey",p:300,r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:800,r:"4.2★",f:"100% Cotton",u:"Sweat Absorbent"}],
  [{b:"Jockey",p:600,r:"3.9★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:300,r:"4.2★",f:"Blended Cotton",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:800,r:"3.9★",f:"Modal",u:"Ultra Breathable"}],
  [{b:"XYXX",p:300,r:"4.5★",f:"100% Cotton",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:450,r:"4.2★",f:"100% Cotton",u:"Highly Stretchable"},{b:"Jockey",p:800,r:"3.9★",f:"Modal",u:"Sweat Absorbent"}],
  [{b:"Jockey",p:600,r:"4.2★",f:"Blended Cotton",u:"Ultra Breathable"},{b:"Dixcy Scott Alpha",p:450,r:"3.9★",f:"Modal",u:"Sweat Absorbent"},{b:"XYXX",p:800,r:"4.5★",f:"Blended Cotton",u:"Sweat Absorbent"}],
  [{b:"Dixcy Scott Alpha",p:450,r:"3.9★",f:"Modal",u:"Ultra Breathable"},{b:"Jockey",p:800,r:"4.5★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:600,r:"4.5★",f:"Modal",u:"Highly Stretchable"}],
];

export const BRANDS  = ["XYXX", "Dixcy Scott Alpha", "Jockey"];
export const USPS    = ["Sweat Absorbent", "Ultra Breathable", "Highly Stretchable"];
export const FABRICS = ["100% Cotton", "Blended Cotton", "Modal"];
export const RATINGS = ["3.9★", "4.2★", "4.5★"];
export const PRICES  = [300, 450, 600, 800];
export const NCCS    = ["NCCS A1", "NCCS A2", "NCCS A3", "NCCS B1"];

// ─── NCCS quota guidance (visual only, not enforced) ────────────────────
export const NCCS_QUOTAS = {
  "NCCS A1": 100,
  "NCCS A2": 150,
  "NCCS A3": 150,
  "NCCS B1": 100,
};

// ─── Screener options ───────────────────────────────────────────────────
export const CITY_TIERS = [
  "Tier 1 — Metro (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune)",
  "Tier 2 (Jaipur, Lucknow, Indore, Nagpur, Surat, Vadodara)",
];

export const PLATFORMS = [
  "Amazon",
  "Flipkart",
  "Myntra",
  "Quick Comm (Blinkit, Zepto, Instamart)",
  "Multiple platforms"
];

// ─── NCCS classification (MRSI/MRUC grid) ───────────────────────────────
// Education levels (6) × Durables count (0..5) → NCCS class
export const EDUCATION_LEVELS = [
  { value: "illiterate",            label: "Illiterate / Just literate" },
  { value: "school_5",              label: "Studied up to 4th standard" },
  { value: "school_9",              label: "Studied 5th–9th standard" },
  { value: "ssc_hsc",               label: "SSC / HSC (10th–12th pass)" },
  { value: "graduate_general",      label: "Graduate / Postgraduate (general)" },
  { value: "graduate_professional", label: "Graduate / Postgraduate (professional — CA, doctor, engineer, MBA)" },
];

export const DURABLES = [
  "AC",
  "Car",
  "Washing machine",
  "Refrigerator",
  "Two-wheeler",
];

const NCCS_GRID = {
  illiterate:            ["E3", "E2", "E1", "D2", "D2", "D1"],
  school_5:              ["E2", "E1", "D2", "D1", "D1", "C2"],
  school_9:              ["E1", "D2", "D1", "C2", "C1", "B2"],
  ssc_hsc:               ["D2", "D1", "C2", "C1", "B2", "B1"],
  graduate_general:      ["D1", "C2", "C1", "B2", "B1", "A3"],
  graduate_professional: ["D1", "C2", "B2", "B1", "A3", "A2"],
};

export function classifyNCCS(education, durableCount) {
  if (education === "graduate_professional" && durableCount === 5) return "A1";
  const row = NCCS_GRID[education];
  if (!row) return null;
  return row[Math.min(durableCount, 5)];
}

export const NCCS_COHORT_MAP = {
  "A1": "NCCS A1",
  "A2": "NCCS A2",
  "A3": "NCCS A3",
  "B1": "NCCS B1",
};

// ─── Display thresholds ─────────────────────────────────────────────────
export const ANALYSIS_THRESHOLDS = {
  MNL_MIN: 30,        // show aggregate MNL at n>=30
  SEGMENT_MIN: 30,    // show segment results at n>=30 per cohort
  HB_TRIGGER_MIN: 50, // trigger pooled MNL run at n>=50
};

// ─── Colour palette ─────────────────────────────────────────────────────
export const BRAND_COLORS = {
  "XYXX": "#1D9E75",
  "Dixcy Scott Alpha": "#534AB7",
  "Jockey": "#185FA5"
};
