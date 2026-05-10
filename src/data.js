export const TASKS = [
  [{b:"Levi's",p:800,k:"3 pcs",r:"3.8★",u:"Sweat Absorbent & Cotton"},{b:"Lux Nitro",p:450,k:"3 pcs",r:"4.5★",u:"Sweat Absorbent & Cotton"},{b:"XYXX",p:300,k:"3 pcs",r:"3.9★",u:"Ultra-Soft & Blended"}],
  [{b:"Dixcy Scott Alpha",p:600,k:"3 pcs",r:"4.2★",u:"Sweat Absorbent & Cotton"},{b:"Levi's",p:300,k:"3 pcs",r:"4.5★",u:"Ultra-Soft & Blended"},{b:"XYXX",p:800,k:"3 pcs",r:"3.9★",u:"Ultra-Soft & Blended"}],
  [{b:"Dixcy Scott Alpha",p:800,k:"3 pcs",r:"3.8★",u:"Sweat Absorbent & Cotton"},{b:"XYXX",p:450,k:"3 pcs",r:"4.5★",u:"Ultra-Soft & Blended"},{b:"Levi's",p:600,k:"3 pcs",r:"4.2★",u:"Ultra-Soft & Blended"}],
  [{b:"Dixcy Scott Alpha",p:800,k:"3 pcs",r:"3.9★",u:"4-Way Stretch & Blended"},{b:"Levi's",p:600,k:"3 pcs",r:"3.9★",u:"Airy & Breathable Mesh"},{b:"XYXX",p:300,k:"3 pcs",r:"3.8★",u:"Airy & Breathable Mesh"}],
  [{b:"XYXX",p:600,k:"3 pcs",r:"4.2★",u:"Airy & Breathable Mesh"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"3.9★",u:"Airy & Breathable Mesh"},{b:"Lux Nitro",p:800,k:"3 pcs",r:"4.5★",u:"4-Way Stretch & Blended"}],
  [{b:"Levi's",p:600,k:"3 pcs",r:"3.8★",u:"4-Way Stretch & Blended"},{b:"Lux Nitro",p:300,k:"3 pcs",r:"4.2★",u:"Sweat Absorbent & Cotton"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"4.2★",u:"Airy & Breathable Mesh"}],
  [{b:"Lux Nitro",p:300,k:"3 pcs",r:"4.2★",u:"4-Way Stretch & Blended"},{b:"XYXX",p:600,k:"3 pcs",r:"3.8★",u:"Airy & Breathable Mesh"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"3.9★",u:"Ultra-Soft & Blended"}],
  [{b:"Lux Nitro",p:300,k:"3 pcs",r:"3.9★",u:"Airy & Breathable Mesh"},{b:"Levi's",p:600,k:"3 pcs",r:"3.9★",u:"Sweat Absorbent & Cotton"},{b:"XYXX",p:800,k:"3 pcs",r:"3.8★",u:"Sweat Absorbent & Cotton"}],
  [{b:"Levi's",p:800,k:"3 pcs",r:"4.5★",u:"4-Way Stretch & Blended"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"3.8★",u:"Sweat Absorbent & Cotton"},{b:"Lux Nitro",p:300,k:"3 pcs",r:"4.5★",u:"4-Way Stretch & Blended"}],
];

export const BRANDS = ["XYXX","Dixcy Scott Alpha","Lux Nitro","Levi's"];
export const USPS = ["Sweat Absorbent & Cotton","Airy & Breathable Mesh","Ultra-Soft & Blended","4-Way Stretch & Blended"];
export const RATINGS = ["3.8★","3.9★","4.2★","4.5★"];
export const NCCS = ["NCCS A1","NCCS A2","NCCS A3","NCCS B1"];

// ── NCCS screener: proper education + SEC asset grid ─────────────────────────
// Education of chief wage earner (single select)
export const EDUCATION_OPTIONS = [
  "Illiterate",
  "Literate but no formal schooling",
  "School up to 4th standard",
  "School 5th – 9th standard",
  "SSC / HSC (10th or 12th passed)",
  "Some college but not graduate",
  "Graduate / Post-graduate: General",
  "Graduate / Post-graduate: Professional (Engineering, Medicine, MBA, CA)"
];

// Assets owned (multi-select)
export const ASSET_OPTIONS = [
  "Air conditioner (AC)",
  "Car / SUV",
  "Washing machine",
  "Refrigerator",
  "Two-wheeler (scooter or motorcycle)"
];

// NCCS grid: education index (0-7) x asset score (0-5) → NCCS
// Simplified from MRS/MRUC official grid
export function mapToNCCS(educationIdx, assetCount) {
  if (educationIdx >= 7) {
    return assetCount >= 4 ? "NCCS A1" : assetCount >= 2 ? "NCCS A2" : "NCCS A3";
  } else if (educationIdx >= 5) {
    return assetCount >= 4 ? "NCCS A1" : assetCount >= 3 ? "NCCS A2" : assetCount >= 1 ? "NCCS A3" : "NCCS B1";
  } else if (educationIdx >= 4) {
    return assetCount >= 4 ? "NCCS A2" : assetCount >= 2 ? "NCCS A3" : "NCCS B1";
  } else {
    return assetCount >= 4 ? "NCCS A3" : "NCCS B1";
  }
}

export const CITY_TIERS = [
  "Tier 1 — Metro (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune)",
  "Tier 2 (Jaipur, Lucknow, Indore, Nagpur, Surat, Vadodara)",
  "Tier 3 — Smaller towns & cities"
];

export const PLATFORMS = [
  "Amazon",
  "Flipkart",
  "Myntra",
  "Quick Comm (Blinkit, Zepto, Instamart)",
  "Multiple platforms"
];

export const BRAND_COLORS = {
  "XYXX": "#1D9E75",
  "Dixcy Scott Alpha": "#534AB7",
  "Lux Nitro": "#D85A30",
  "Levi's": "#185FA5"
};

// NCCS quota targets (suggestive only — not enforced)
export const NCCS_QUOTA = {
  "NCCS A1": 100,
  "NCCS A2": 150,
  "NCCS A3": 150,
  "NCCS B1": 100
};
