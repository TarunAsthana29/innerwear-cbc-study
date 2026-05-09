import { useState, useMemo } from "react";
import { TASKS, BRANDS, USPS, BRAND_COLORS } from "../data";

// ── MNL Part-worth estimation via gradient descent ────────────────────────────
function estimateMNL(responses) {
  const PRICES = [250, 450, 650, 850];
  const PACKS = ["2 pcs", "3 pcs", "5 pcs"];
  const RATINGS = ["3.9★", "4.2★", "4.5★"];

  // Encode a profile as feature vector
  // [brand0..3(ref=XYXX), price_cont, pack0..1(ref=2pcs), rating0..1(ref=3.9★), usp0..3(ref=MW)]
  function encode(opt) {
    const brandIdx = BRANDS.indexOf(opt.b);
    const priceNorm = (opt.p - 250) / 600;
    const packIdx = PACKS.indexOf(opt.k);
    const ratingIdx = RATINGS.indexOf(opt.r);
    const uspIdx = USPS.indexOf(opt.u);
    const v = new Array(12).fill(0);
    if (brandIdx > 0) v[brandIdx - 1] = 1;        // brand 1,2,3 (0=XYXX ref)
    v[3] = priceNorm;                               // price
    if (packIdx > 0) v[3 + packIdx] = 1;           // pack 1,2
    if (ratingIdx > 0) v[5 + ratingIdx] = 1;       // rating 1,2
    if (uspIdx > 0) v[7 + uspIdx] = 1;             // usp 1,2,3
    return v;
  }

  // Build observations: each task with a valid choice
  const obs = [];
  responses.forEach(r => {
    r.choices.forEach((choice, ti) => {
      if (choice === null || choice === "none") return;
      const task = TASKS[ti];
      const vecs = task.map(opt => encode(opt));
      obs.push({ vecs, chosen: choice });
    });
  });

  if (obs.length < 10) return null;

  // Gradient descent MNL
  const nParams = 11;
  let beta = new Array(nParams).fill(0);
  const lr = 0.05;
  const epochs = 300;

  for (let e = 0; e < epochs; e++) {
    const grad = new Array(nParams).fill(0);
    obs.forEach(({ vecs, chosen }) => {
      const utils = vecs.map(v => v.reduce((s, x, i) => s + x * beta[i], 0));
      const maxU = Math.max(...utils);
      const exps = utils.map(u => Math.exp(u - maxU));
      const sumExp = exps.reduce((a, b) => a + b, 0);
      const probs = exps.map(e => e / sumExp);
      vecs.forEach((v, j) => {
        const indicator = j === chosen ? 1 : 0;
        v.forEach((xi, i) => {
          grad[i] += (indicator - probs[j]) * xi;
        });
      });
    });
    beta = beta.map((b, i) => b + lr * grad[i] / obs.length);
  }

  // Extract utilities
  const priceCoef = beta[3];
  const priceRange = 600;

  function wtp(util) {
    if (!priceCoef || priceCoef >= 0) return null;
    return Math.round((util / Math.abs(priceCoef)) * priceRange);
  }

  const brandUtils = {
    "XYXX": 0,
    "Dixcy Scott Alpha": beta[0],
    "Lux Nitro": beta[1],
    "Levi's": beta[2]
  };

  const uspUtils = {
    "Moisture-Wicking & Quick Dry": 0,
    "Airy & Breathable Mesh": beta[8],
    "Ultra-Soft & Skin-Friendly": beta[9],
    "4-Way Stretch & Snug Fit": beta[10]
  };

  const packUtils = { "2 pcs": 0, "3 pcs": beta[4], "5 pcs": beta[5] };
  const ratingUtils = { "3.9★": 0, "4.2★": beta[6], "4.5★": beta[7] };

  // Relative importance
  const brandRange = Math.max(...Object.values(brandUtils)) - Math.min(...Object.values(brandUtils));
  const uspRange = Math.max(...Object.values(uspUtils)) - Math.min(...Object.values(uspUtils));
  const packRange = Math.max(...Object.values(packUtils)) - Math.min(...Object.values(packUtils));
  const ratingRange = Math.max(...Object.values(ratingUtils)) - Math.min(...Object.values(ratingUtils));
  const priceImp = Math.abs(priceCoef) * 0.6;
  const totalRange = brandRange + uspRange + packRange + ratingRange + priceImp;

  const importance = {
    "Brand": Math.round((brandRange / totalRange) * 100),
    "USP": Math.round((uspRange / totalRange) * 100),
    "Pack size": Math.round((packRange / totalRange) * 100),
    "Rating": Math.round((ratingRange / totalRange) * 100),
    "Price": Math.round((priceImp / totalRange) * 100),
  };

  return { brandUtils, uspUtils, packUtils, ratingUtils, priceCoef, wtp, importance, nObs: obs.length };
}

// ── Preference share simulator ────────────────────────────────────────────────
function simShare(scenarios, model) {
  if (!model) return scenarios.map(() => 0);
  const utils = scenarios.map(s => {
    const bU = model.brandUtils[s.brand] || 0;
    const uU = model.uspUtils[s.usp] || 0;
    const pU = model.priceCoef * ((s.price - 250) / 600);
    const pkU = model.packUtils[s.pack] || 0;
    const rU = model.ratingUtils[s.rating] || 0;
    return bU + uU + pU + pkU + rU;
  });
  const maxU = Math.max(...utils);
  const exps = utils.map(u => Math.exp(u - maxU));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => Math.round((e / sum) * 100));
}

function Bar({ label, value, max, color, suffix = "" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#444", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: "#888" }}>{typeof value === "number" ? (value > 0 ? "+" : "") + value : value}{suffix}</span>
      </div>
      <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
        <div style={{ height: 6, width: pct + "%", background: color || "#111", borderRadius: 3, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
      {children}
    </div>
  );
}

const DEFAULT_SCENARIOS = [
  { brand: "Levi's",            price: 650, pack: "3 pcs", rating: "4.5★", usp: "Ultra-Soft & Skin-Friendly" },
  { brand: "XYXX",              price: 450, pack: "3 pcs", rating: "4.2★", usp: "Moisture-Wicking & Quick Dry" },
  { brand: "Dixcy Scott Alpha", price: 250, pack: "3 pcs", rating: "4.2★", usp: "4-Way Stretch & Snug Fit" },
  { brand: "Lux Nitro",         price: 450, pack: "3 pcs", rating: "4.2★", usp: "Airy & Breathable Mesh" },
];

export default function Analysis({ responses }) {
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);

  const model = useMemo(() => {
    if (responses.length < 5) return null;
    return estimateMNL(responses);
  }, [responses]);

  const shares = useMemo(() => simShare(scenarios, model), [scenarios, model]);

  function updateScenario(i, key, val) {
    const next = scenarios.map((s, idx) => idx === i ? { ...s, [key]: key === "price" ? +val : val } : s);
    setScenarios(next);
  }

  if (responses.length < 5) return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#aaa" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚗️</div>
      <div style={{ fontSize: 14 }}>Need at least 5 responses to run analysis. Currently have {responses.length}.</div>
    </div>
  );

  if (!model) return (
    <div style={{ textAlign: "center", padding: "3rem", color: "#aaa", fontSize: 13 }}>Running analysis...</div>
  );

  const maxBrandU = Math.max(...Object.values(model.brandUtils));
  const minBrandU = Math.min(...Object.values(model.brandUtils));
  const brandSpan = maxBrandU - minBrandU || 1;

  const maxUspU = Math.max(...Object.values(model.uspUtils));
  const minUspU = Math.min(...Object.values(model.uspUtils));
  const uspSpan = maxUspU - minUspU || 1;

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: 680, margin: "0 auto" }}>

      <div style={{ background: "#f8f8f8", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#666", marginBottom: "1rem" }}>
        Multinomial logit analysis · {model.nObs} valid choices · Results update as responses come in
      </div>

      <Section title="Attribute importance (%)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
          {Object.entries(model.importance).map(([k, v]) => (
            <div key={k} style={{ textAlign: "center", background: "#f8f8f8", borderRadius: 8, padding: "12px 6px" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{v}%</div>
              <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
        <Section title="Brand part-worths">
          {BRANDS.map(b => {
            const u = model.brandUtils[b];
            const w = model.wtp(u);
            return (
              <div key={b} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#444", fontWeight: 500 }}>{b}</span>
                  <span style={{ fontSize: 11, color: w !== null ? (w >= 0 ? "#0F6E56" : "#c0392b") : "#888", fontWeight: 600 }}>
                    {w !== null ? (w >= 0 ? "+" : "") + "₹" + Math.abs(w) + " WTP" : "ref"}
                  </span>
                </div>
                <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
                  <div style={{ height: 6, width: Math.round(((u - minBrandU) / brandSpan) * 100) + "%", background: BRAND_COLORS[b], borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>WTP = premium vs XYXX (base)</div>
        </Section>

        <Section title="USP part-worths">
          {USPS.map((u, i) => {
            const util = model.uspUtils[u];
            const w = model.wtp(util);
            const colors = ["#1D9E75","#185FA5","#D85A30","#534AB7"];
            return (
              <div key={u} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#444", fontWeight: 500 }}>{u.split(" & ")[0]}</span>
                  <span style={{ fontSize: 11, color: w !== null ? (w >= 0 ? "#0F6E56" : "#c0392b") : "#888", fontWeight: 600 }}>
                    {w !== null ? (w >= 0 ? "+" : "") + "₹" + Math.abs(w) + " WTP" : "ref"}
                  </span>
                </div>
                <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
                  <div style={{ height: 6, width: Math.round(((util - minUspU) / uspSpan) * 100) + "%", background: colors[i], borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>WTP = premium vs Moisture-Wicking (base)</div>
        </Section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
        <Section title="Price sensitivity">
          <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111" }}>{Math.abs(model.priceCoef).toFixed(3)}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>price coefficient (normalised)</div>
            <div style={{ marginTop: 12, fontSize: 12, color: "#444" }}>
              Every ₹100 increase → utility drops by <strong>{Math.round(Math.abs(model.priceCoef) * (100/600) * 100) / 100}</strong> units
            </div>
          </div>
        </Section>

        <Section title="Rating & pack WTP">
          {[["4.5★ vs 3.9★", model.wtp(model.ratingUtils["4.5★"])],
            ["4.2★ vs 3.9★", model.wtp(model.ratingUtils["4.2★"])],
            ["5 pcs vs 2 pcs", model.wtp(model.packUtils["5 pcs"])],
            ["3 pcs vs 2 pcs", model.wtp(model.packUtils["3 pcs"])]
          ].map(([label, w]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "0.5px solid #f5f5f5", fontSize: 12 }}>
              <span style={{ color: "#666" }}>{label}</span>
              <span style={{ fontWeight: 600, color: w !== null && w >= 0 ? "#0F6E56" : "#c0392b" }}>
                {w !== null ? (w >= 0 ? "+" : "") + "₹" + Math.abs(w) : "—"}
              </span>
            </div>
          ))}
        </Section>
      </div>

      <Section title="Preference share simulator — edit any cell">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                {["Brand","Price","Pack","Rating","USP","Share"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "#888", fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid #f8f8f8" }}>
                  <td style={{ padding: "6px 4px" }}>
                    <select value={s.brand} onChange={e => updateScenario(i, "brand", e.target.value)}
                      style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px 4px", background: "#fff" }}>
                      {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <select value={s.price} onChange={e => updateScenario(i, "price", e.target.value)}
                      style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px 4px", background: "#fff" }}>
                      {[250,450,650,850].map(p => <option key={p} value={p}>₹{p}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <select value={s.pack} onChange={e => updateScenario(i, "pack", e.target.value)}
                      style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px 4px", background: "#fff" }}>
                      {["2 pcs","3 pcs","5 pcs"].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <select value={s.rating} onChange={e => updateScenario(i, "rating", e.target.value)}
                      style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px 4px", background: "#fff" }}>
                      {["3.9★","4.2★","4.5★"].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <select value={s.usp} onChange={e => updateScenario(i, "usp", e.target.value)}
                      style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px 4px", background: "#fff" }}>
                      {USPS.map(u => <option key={u} value={u}>{u.split(" & ")[0]}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3 }}>
                        <div style={{ height: 6, width: shares[i] + "%", background: BRAND_COLORS[s.brand] || "#111", borderRadius: 3, transition: "width 0.4s" }} />
                      </div>
                      <span style={{ fontWeight: 700, color: "#111", minWidth: 32, fontSize: 13 }}>{shares[i]}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 10 }}>Change any dropdown to see preference share update instantly</div>
      </Section>
    </div>
  );
}
