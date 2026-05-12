const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const TASKS = [
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

const NCCS_LIST = ["NCCS A1", "NCCS A2", "NCCS A3", "NCCS B1"];
const SEGMENT_MIN = 30;
const TRIGGER_MIN = 50;

// Feature vector — 9 dimensions, NO index overlap:
// [0] brand_DixcyScott  [1] brand_Jockey  (ref=XYXX)
// [2] price_norm
// [3] rating_4.2  [4] rating_4.5  (ref=3.9)
// [5] fabric_Blended  [6] fabric_Modal  (ref=100% Cotton)
// [7] usp_Breathable  [8] usp_Stretchable  (ref=Sweat Absorbent)
function encode(opt) {
  const v = new Array(9).fill(0);
  if (opt.b === "Dixcy Scott Alpha") v[0] = 1;
  if (opt.b === "Jockey")            v[1] = 1;
  v[2] = (opt.p - 300) / 500;
  if (opt.r === "4.2★") v[3] = 1;
  if (opt.r === "4.5★") v[4] = 1;
  if (opt.f === "Blended Cotton") v[5] = 1;
  if (opt.f === "Modal")          v[6] = 1;
  if (opt.u === "Ultra Breathable")    v[7] = 1;
  if (opt.u === "Highly Stretchable")  v[8] = 1;
  return v;
}

function logLik(beta, obs) {
  let ll = 0;
  for (const { vecs, chosen } of obs) {
    const utils = vecs.map(v => v.reduce((s, x, i) => s + x * beta[i], 0));
    const maxU = Math.max(...utils);
    const exps = utils.map(u => Math.exp(u - maxU));
    const sumE = exps.reduce((a, b) => a + b, 0);
    ll += Math.log(exps[chosen] / sumE);
  }
  return ll;
}

function runHB(responses, iterations = 2000, burnin = 500) {
  const obs = [];
  responses.forEach(r => {
    const choices = typeof r.choices === "string" ? JSON.parse(r.choices) : r.choices;
    choices.forEach((choice, ti) => {
      if (choice === null || choice === "none") return;
      obs.push({ vecs: TASKS[ti].map(encode), chosen: choice });
    });
  });

  if (obs.length < 6) return null;

  const nP = 9;
  let beta = new Array(nP).fill(0);
  let currentLL = logLik(beta, obs);
  const samples = [];
  const stepSize = 0.15;

  for (let iter = 0; iter < iterations; iter++) {
    const proposed = beta.map(b => b + (Math.random() - 0.5) * 2 * stepSize);
    const proposedLL = logLik(proposed, obs);
    if (Math.log(Math.random()) < proposedLL - currentLL) {
      beta = proposed;
      currentLL = proposedLL;
    }
    if (iter >= burnin) samples.push([...beta]);
  }

  const mean = new Array(nP).fill(0);
  samples.forEach(s => s.forEach((v, i) => mean[i] += v));
  const posterior = mean.map(v => v / samples.length);

  const priceCoef = posterior[2];
  const priceRange = 500;

  function wtp(util) {
    if (!priceCoef || priceCoef >= 0) return 0;
    return Math.round((util / Math.abs(priceCoef)) * priceRange);
  }

  const brandUtils  = { "XYXX": 0, "Dixcy Scott Alpha": posterior[0], "Jockey": posterior[1] };
  const ratingUtils = { "3.9★": 0, "4.2★": posterior[3], "4.5★": posterior[4] };
  const fabricUtils = { "100% Cotton": 0, "Blended Cotton": posterior[5], "Modal": posterior[6] };
  const uspUtils    = { "Sweat Absorbent": 0, "Ultra Breathable": posterior[7], "Highly Stretchable": posterior[8] };

  const brandRange  = Math.max(...Object.values(brandUtils))  - Math.min(...Object.values(brandUtils));
  const ratingRange = Math.max(...Object.values(ratingUtils)) - Math.min(...Object.values(ratingUtils));
  const fabricRange = Math.max(...Object.values(fabricUtils)) - Math.min(...Object.values(fabricUtils));
  const uspRange    = Math.max(...Object.values(uspUtils))    - Math.min(...Object.values(uspUtils));
  const priceImp    = Math.abs(priceCoef) * 0.5;
  const totalRange  = brandRange + ratingRange + fabricRange + uspRange + priceImp || 1;

  return {
    brandUtils, ratingUtils, fabricUtils, uspUtils, priceCoef,
    brandWTP:  Object.fromEntries(Object.entries(brandUtils).map(([k,v])  => [k, wtp(v)])),
    uspWTP:    Object.fromEntries(Object.entries(uspUtils).map(([k,v])    => [k, wtp(v)])),
    fabricWTP: Object.fromEntries(Object.entries(fabricUtils).map(([k,v]) => [k, wtp(v)])),
    importance: {
      Brand:  Math.round((brandRange  / totalRange) * 100),
      Rating: Math.round((ratingRange / totalRange) * 100),
      Fabric: Math.round((fabricRange / totalRange) * 100),
      USP:    Math.round((uspRange    / totalRange) * 100),
      Price:  Math.round((priceImp    / totalRange) * 100),
    },
    nRespondents: responses.length,
    nChoices: obs.length
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { data: responses, error } = await supabase.from("responses").select("*");
    if (error) throw error;
    const n = responses.length;
    if (n < TRIGGER_MIN && !req.query.force) {
      return res.status(200).json({ skipped: true, n, message: `Need at least ${TRIGGER_MIN} responses` });
    }

    const results = {};
    results.overall = runHB(responses);
    for (const nccs of NCCS_LIST) {
      const segment = responses.filter(r => r.nccs === nccs);
      results[nccs] = segment.length >= SEGMENT_MIN ? runHB(segment) : null;
    }

    const { error: insertError } = await supabase.from("hb_results").upsert([{
      id: "latest",
      n_responses: n,
      results: JSON.stringify(results),
      computed_at: new Date().toISOString()
    }]);
    if (insertError) throw insertError;

    return res.status(200).json({ success: true, n, segments: Object.keys(results) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
