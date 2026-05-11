// api/run-hb.js — Vercel Serverless Function
// Called automatically when response count hits multiple of 10
// Runs HB-approximation via MCMC, stores results in Supabase

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const TASKS = [
  [{b:"Dixcy Scott Alpha",p:650,k:"3 pcs",r:"4.5★",u:"Ultra-Soft & Skin-Friendly"},{b:"XYXX",p:450,k:"5 pcs",r:"3.9★",u:"Ultra-Soft & Skin-Friendly"},{b:"Levi's",p:250,k:"3 pcs",r:"4.5★",u:"Airy & Breathable Mesh"}],
  [{b:"Lux Nitro",p:850,k:"3 pcs",r:"4.5★",u:"4-Way Stretch & Snug Fit"},{b:"Levi's",p:250,k:"5 pcs",r:"4.2★",u:"Moisture-Wicking & Quick Dry"},{b:"XYXX",p:450,k:"5 pcs",r:"4.2★",u:"Ultra-Soft & Skin-Friendly"}],
  [{b:"Lux Nitro",p:450,k:"3 pcs",r:"4.2★",u:"Ultra-Soft & Skin-Friendly"},{b:"Levi's",p:250,k:"2 pcs",r:"3.9★",u:"Moisture-Wicking & Quick Dry"},{b:"XYXX",p:850,k:"2 pcs",r:"4.2★",u:"Moisture-Wicking & Quick Dry"}],
  [{b:"Dixcy Scott Alpha",p:650,k:"2 pcs",r:"4.5★",u:"Moisture-Wicking & Quick Dry"},{b:"Levi's",p:850,k:"3 pcs",r:"3.9★",u:"Ultra-Soft & Skin-Friendly"},{b:"Lux Nitro",p:450,k:"2 pcs",r:"3.9★",u:"4-Way Stretch & Snug Fit"}],
  [{b:"Levi's",p:450,k:"5 pcs",r:"4.2★",u:"Airy & Breathable Mesh"},{b:"XYXX",p:650,k:"2 pcs",r:"4.2★",u:"Airy & Breathable Mesh"},{b:"Lux Nitro",p:250,k:"2 pcs",r:"4.2★",u:"Moisture-Wicking & Quick Dry"}],
  [{b:"Dixcy Scott Alpha",p:850,k:"2 pcs",r:"4.5★",u:"Ultra-Soft & Skin-Friendly"},{b:"XYXX",p:650,k:"3 pcs",r:"3.9★",u:"4-Way Stretch & Snug Fit"},{b:"Lux Nitro",p:250,k:"2 pcs",r:"3.9★",u:"Airy & Breathable Mesh"}],
  [{b:"Levi's",p:650,k:"5 pcs",r:"4.5★",u:"Moisture-Wicking & Quick Dry"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"4.2★",u:"4-Way Stretch & Snug Fit"},{b:"XYXX",p:250,k:"3 pcs",r:"3.9★",u:"Ultra-Soft & Skin-Friendly"}],
  [{b:"Dixcy Scott Alpha",p:650,k:"5 pcs",r:"4.2★",u:"Airy & Breathable Mesh"},{b:"Lux Nitro",p:850,k:"2 pcs",r:"4.5★",u:"Moisture-Wicking & Quick Dry"},{b:"XYXX",p:450,k:"3 pcs",r:"3.9★",u:"4-Way Stretch & Snug Fit"}],
  [{b:"Dixcy Scott Alpha",p:650,k:"5 pcs",r:"4.5★",u:"Ultra-Soft & Skin-Friendly"},{b:"Lux Nitro",p:450,k:"5 pcs",r:"4.5★",u:"Airy & Breathable Mesh"},{b:"Levi's",p:850,k:"5 pcs",r:"3.9★",u:"Ultra-Soft & Skin-Friendly"}],
  [{b:"Levi's",p:250,k:"2 pcs",r:"4.5★",u:"Ultra-Soft & Skin-Friendly"},{b:"XYXX",p:850,k:"2 pcs",r:"4.5★",u:"4-Way Stretch & Snug Fit"},{b:"Lux Nitro",p:650,k:"5 pcs",r:"4.5★",u:"Airy & Breathable Mesh"}],
  [{b:"Lux Nitro",p:850,k:"5 pcs",r:"4.2★",u:"4-Way Stretch & Snug Fit"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"3.9★",u:"4-Way Stretch & Snug Fit"},{b:"XYXX",p:250,k:"2 pcs",r:"3.9★",u:"Airy & Breathable Mesh"}],
  [{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"4.2★",u:"Moisture-Wicking & Quick Dry"},{b:"XYXX",p:850,k:"2 pcs",r:"4.2★",u:"Airy & Breathable Mesh"},{b:"Levi's",p:250,k:"5 pcs",r:"3.9★",u:"4-Way Stretch & Snug Fit"}]
];

const BRANDS = ["XYXX","Dixcy Scott Alpha","Lux Nitro","Levi's"];
const USPS   = ["Moisture-Wicking & Quick Dry","Airy & Breathable Mesh","Ultra-Soft & Skin-Friendly","4-Way Stretch & Snug Fit"];
const PACKS  = ["2 pcs","3 pcs","5 pcs"];
const RATINGS= ["3.9★","4.2★","4.5★"];
const NCCS_LIST = ["NCCS A1","NCCS A2","NCCS A3","NCCS B1"];

// Encode profile → feature vector (11 dims)
function encode(opt) {
  const v = new Array(11).fill(0);
  const bi = BRANDS.indexOf(opt.b);
  if (bi > 0) v[bi - 1] = 1;
  v[3] = (opt.p - 250) / 600;
  const pi = PACKS.indexOf(opt.k);
  if (pi > 0) v[3 + pi] = 1;
  const ri = RATINGS.indexOf(opt.r);
  if (ri > 0) v[5 + ri] = 1;
  const ui = USPS.indexOf(opt.u);
  if (ui > 0) v[7 + ui] = 1;
  return v;
}

// MNL log-likelihood
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

// HB via MCMC (Metropolis-Hastings) for a group of respondents
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

  const nP = 11;
  let beta = new Array(nP).fill(0);
  let currentLL = logLik(beta, obs);
  const samples = [];
  const stepSize = 0.15;

  for (let iter = 0; iter < iterations; iter++) {
    // Propose new beta
    const proposed = beta.map(b => b + (Math.random() - 0.5) * 2 * stepSize);
    const proposedLL = logLik(proposed, obs);
    // Accept/reject
    if (Math.log(Math.random()) < proposedLL - currentLL) {
      beta = proposed;
      currentLL = proposedLL;
    }
    if (iter >= burnin) samples.push([...beta]);
  }

  // Posterior mean
  const mean = new Array(nP).fill(0);
  samples.forEach(s => s.forEach((v, i) => mean[i] += v));
  const posterior = mean.map(v => v / samples.length);

  const priceCoef = posterior[3];
  const priceRange = 600;

  function wtp(util) {
    if (!priceCoef || priceCoef >= 0) return 0;
    return Math.round((util / Math.abs(priceCoef)) * priceRange);
  }

  const brandUtils = {
    "XYXX": 0,
    "Dixcy Scott Alpha": posterior[0],
    "Lux Nitro": posterior[1],
    "Levi's": posterior[2]
  };

  const uspUtils = {
    "Moisture-Wicking & Quick Dry": 0,
    "Airy & Breathable Mesh": posterior[8],
    "Ultra-Soft & Skin-Friendly": posterior[9],
    "4-Way Stretch & Snug Fit": posterior[10]
  };

  const packUtils  = { "2 pcs": 0, "3 pcs": posterior[4], "5 pcs": posterior[5] };
  const ratingUtils= { "3.9★": 0, "4.2★": posterior[6], "4.5★": posterior[7] };

  const brandRange  = Math.max(...Object.values(brandUtils))  - Math.min(...Object.values(brandUtils));
  const uspRange    = Math.max(...Object.values(uspUtils))    - Math.min(...Object.values(uspUtils));
  const packRange   = Math.max(...Object.values(packUtils))   - Math.min(...Object.values(packUtils));
  const ratingRange = Math.max(...Object.values(ratingUtils)) - Math.min(...Object.values(ratingUtils));
  const priceImp    = Math.abs(priceCoef) * 0.6;
  const totalRange  = brandRange + uspRange + packRange + ratingRange + priceImp || 1;

  return {
    brandUtils,
    uspUtils,
    packUtils,
    ratingUtils,
    priceCoef,
    brandWTP: Object.fromEntries(Object.entries(brandUtils).map(([k,v]) => [k, wtp(v)])),
    uspWTP:   Object.fromEntries(Object.entries(uspUtils).map(([k,v])   => [k, wtp(v)])),
    importance: {
      Brand:     Math.round((brandRange  / totalRange) * 100),
      USP:       Math.round((uspRange    / totalRange) * 100),
      "Pack size": Math.round((packRange / totalRange) * 100),
      Rating:    Math.round((ratingRange / totalRange) * 100),
      Price:     Math.round((priceImp    / totalRange) * 100),
    },
    nRespondents: responses.length,
    nChoices: obs.length
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Fetch all responses
    const { data: responses, error } = await supabase
      .from("responses")
      .select("*");

    if (error) throw error;

    const n = responses.length;

    // Only run if multiple of 10 (or forced via ?force=1)
    if (n % 10 !== 0 && !req.query.force) {
      return res.status(200).json({ skipped: true, n, message: `Waiting — need ${10 - (n % 10)} more responses` });
    }

    if (n < 10) {
      return res.status(200).json({ skipped: true, message: "Need at least 10 responses" });
    }

    const results = {};

    // Overall HB
    results.overall = runHB(responses);

    // NCCS segment cuts
    for (const nccs of NCCS_LIST) {
      const segment = responses.filter(r => r.nccs === nccs);
      results[nccs] = segment.length >= 8 ? runHB(segment) : null;
    }

    // Store results in Supabase
    const { error: insertError } = await supabase
      .from("hb_results")
      .upsert([{
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
