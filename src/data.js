export const TASKS = [
  [{b:"Jockey",p:450,k:"3 pcs",r:"4.5★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:600,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:300,k:"3 pcs",r:"3.9★",f:"Modal",u:"Highly Stretchable"}],
  [{b:"XYXX",p:800,k:"3 pcs",r:"4.2★",f:"Blended Cotton",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:600,k:"3 pcs",r:"4.2★",f:"Modal",u:"Highly Stretchable"},{b:"Jockey",p:300,k:"3 pcs",r:"4.5★",f:"100% Cotton",u:"Highly Stretchable"}],
  [{b:"XYXX",p:300,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Ultra Breathable"},{b:"Jockey",p:800,k:"3 pcs",r:"4.2★",f:"100% Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"4.2★",f:"100% Cotton",u:"Sweat Absorbent"}],
  [{b:"XYXX",p:300,k:"3 pcs",r:"4.2★",f:"Modal",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:600,k:"3 pcs",r:"4.2★",f:"Modal",u:"Ultra Breathable"},{b:"Jockey",p:800,k:"3 pcs",r:"4.5★",f:"Modal",u:"Sweat Absorbent"}],
  [{b:"Jockey",p:800,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Ultra Breathable"},{b:"Dixcy Scott Alpha",p:600,k:"3 pcs",r:"4.5★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:450,k:"3 pcs",r:"4.2★",f:"100% Cotton",u:"Highly Stretchable"}],
  [{b:"Jockey",p:600,k:"3 pcs",r:"4.5★",f:"Modal",u:"Sweat Absorbent"},{b:"XYXX",p:300,k:"3 pcs",r:"4.5★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"3.9★",f:"100% Cotton",u:"Ultra Breathable"}],
  [{b:"Dixcy Scott Alpha",p:300,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Jockey",p:450,k:"3 pcs",r:"4.5★",f:"Modal",u:"Highly Stretchable"},{b:"XYXX",p:800,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"}],
  [{b:"XYXX",p:600,k:"3 pcs",r:"3.9★",f:"100% Cotton",u:"Highly Stretchable"},{b:"Jockey",p:300,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:800,k:"3 pcs",r:"4.2★",f:"100% Cotton",u:"Sweat Absorbent"}],
  [{b:"Jockey",p:600,k:"3 pcs",r:"3.9★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:300,k:"3 pcs",r:"4.2★",f:"Blended Cotton",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:800,k:"3 pcs",r:"3.9★",f:"Modal",u:"Ultra Breathable"}],
  [{b:"XYXX",p:300,k:"3 pcs",r:"4.5★",f:"100% Cotton",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"4.2★",f:"100% Cotton",u:"Highly Stretchable"},{b:"Jockey",p:800,k:"3 pcs",r:"3.9★",f:"Modal",u:"Sweat Absorbent"}],
  [{b:"Jockey",p:600,k:"3 pcs",r:"4.2★",f:"Blended Cotton",u:"Ultra Breathable"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"3.9★",f:"Modal",u:"Sweat Absorbent"},{b:"XYXX",p:800,k:"3 pcs",r:"4.5★",f:"Blended Cotton",u:"Sweat Absorbent"}],
  [{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"3.9★",f:"Modal",u:"Ultra Breathable"},{b:"Jockey",p:800,k:"3 pcs",r:"4.5★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:600,k:"3 pcs",r:"4.5★",f:"Modal",u:"Highly Stretchable"}],
];

export const BRANDS = ["XYXX","Dixcy Scott Alpha","Jockey"];
export const USPS = ["Sweat Absorbent","Ultra Breathable","Highly Stretchable"];
export const FABRICS = ["100% Cotton","Blended Cotton","Modal"];
export const RATINGS = ["3.9★","4.2★","4.5★"];
export const NCCS = ["NCCS A1","NCCS A2","NCCS A3","NCCS B1"];

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

export const ASSET_OPTIONS = [
  "Air conditioner (AC)",
  "Car / SUV",
  "Washing machine",
  "Refrigerator",
  "Two-wheeler (scooter or motorcycle)"
];

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
  "Jockey": "#185FA5"
};

export const NCCS_QUOTA = {
  "NCCS A1": 100,
  "NCCS A2": 150,
  "NCCS A3": 150,
  "NCCS B1": 100
};
