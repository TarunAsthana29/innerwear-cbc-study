import { useState, useMemo } from "react";
import { TASKS, BRANDS, USPS, FABRICS, BRAND_COLORS } from "../data";

function estimateMNL(responses) {
  // Feature vector — 9 dims, no overlap
  // [0] brand_Dixcy [1] brand_Jockey [2] price_norm
  // [3] rating_4.2  [4] rating_4.5
  // [5] fabric_Blended [6] fabric_Modal
  // [7] usp_Breathable [8] usp_Stretchable
  function encode(opt) {
    const v = new Array(9).fill(0);
    if (opt.b === "Dixcy Scott Alpha") v[0] = 1;
    if (opt.b === "Jockey")            v[1] = 1;
    v[2] = (opt.p - 300) / 500;
    if (opt.r === "4.2★") v[3] = 1;
    if (opt.r === "4.5★") v[4] = 1;
    if (opt.f === "Blended Cotton") v[5] = 1;
    if (opt.f === "Modal")          v[6] = 1;
    if (opt.u === "Ultra Breathable")   v[7] = 1;
    if (opt.u === "Highly Stretchable") v[8] = 1;
    return v;
  }

  const obs = [];
  responses.forEach(r => {
    r.choices.forEach((choice, ti) => {
      if (choice === null || choice === "none") return;
      obs.push({ vecs: TASKS[ti].map(encode), chosen: choice });
    });
  });

  if (obs.length < 10) return null;

  const nP = 9;
  let beta = new Array(nP).fill(0);
  const lr = 0.05;

  for (let e = 0; e < 300; e++) {
    const grad = new Array(nP).fill(0);
    obs.forEach(({ vecs, chosen }) => {
      const utils = vecs.map(v => v.reduce((s, x, i) => s + x * beta[i], 0));
      const maxU = Math.max(...utils);
      const exps = utils.map(u => Math.exp(u - maxU));
      const sumExp = exps.reduce((a, b) => a + b, 0);
      const probs = exps.map(e => e / sumExp);
      vecs.forEach((v, j) => {
        v.forEach((xi, i) => { grad[i] += (j === chosen ? 1 : 0 - probs[j]) * xi; });
      });
    });
    beta = beta.map((b, i) => b + lr * grad[i] / obs.length);
  }

  const priceCoef = beta[2];
  const priceRange = 500;

  function wtp(util) {
    if (!priceCoef || priceCoef >= 0) return null;
    return Math.round((util / Math.abs(priceCoef)) * priceRange);
  }

  const brandUtils  = { "XYXX": 0, "Dixcy Scott Alpha": beta[0], "Jockey": beta[1] };
  const ratingUtils = { "3.9★": 0, "4.2★": beta[3], "4.5★": beta[4] };
  const fabricUtils = { "100% Cotton": 0, "Blended Cotton": beta[5], "Modal": beta[6] };
  const uspUtils    = { "Sweat Absorbent": 0, "Ultra Breathable": beta[7], "Highly Stretchable": beta[8] };

  const brandRange  = Math.max(...Object.values(brandUtils))  - Math.min(...Object.values(brandUtils));
  const ratingRange = Math.max(...Object.values(ratingUtils)) - Math.min(...Object.values(ratingUtils));
  const fabricRange = Math.max(...Object.values(fabricUtils)) - Math.min(...Object.values(fabricUtils));
  const uspRange    = Math.max(...Object.values(uspUtils))    - Math.min(...Object.values(uspUtils));
  const priceImp    = Math.abs(priceCoef) * 0.5;
  const totalRange  = brandRange + ratingRange + fabricRange + uspRange + priceImp || 1;

  return {
    brandUtils, ratingUtils, fabricUtils, uspUtils, priceCoef, wtp,
    importance: {
      Brand:  Math.round((brandRange  / totalRange) * 100),
      Rating: Math.round((ratingRange / totalRange) * 100),
      Fabric: Math.round((fabricRange / totalRange) * 100),
      USP:    Math.round((uspRange    / totalRange) * 100),
      Price:  Math.round((priceImp    / totalRange) * 100),
    },
    nObs: obs.length
  };
}

function simShare(scenarios, model) {
  if (!model) return scenarios.map(() => 0);
  const utils = scenarios.map(s => {
    return (model.brandUtils[s.brand] || 0)
      + (model.uspUtils[s.usp] || 0)
      + (model.fabricUtils[s.fabric] || 0)
      + (model.ratingUtils[s.rating] || 0)
      + model.priceCoef * ((s.price - 300) / 500);
  });
  const maxU = Math.max(...utils);
  const exps = utils.map(u => Math.exp(u - maxU));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => Math.round((e / sum) * 100));
}

function Bar({ label, value, color }) {
  const abs = Math.abs(value);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#444", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: value >= 0 ? "#0F6E56" : "#c0392b", fontWeight: 600 }}>
          {value !== null ? (value >= 0 ? "+" : "") + "₹" + Math.abs(value) : "ref"}
        </span>
      </div>
      <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
        <div style={{ height: 6, width: Math.min(Math.round((abs / 500) * 100), 100) + "%", background: color || "#111", borderRadius: 3 }} />
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
  { brand: "Jockey",            price: 600, rating: "4.5★", fabric: "100% Cotton",   usp: "Ultra Breathable" },
  { brand: "XYXX",              price: 450, rating: "4.2★", fabric: "Blended Cotton", usp: "Sweat Absorbent" },
  { brand: "Dixcy Scott Alpha", price: 300, rating: "4.2★", fabric: "100% Cotton",   usp: "Highly Stretchable" },
];

export default function Analysis({ responses }) {
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const model = useMemo(() => responses.length < 5 ? null : estimateMNL(responses), [responses]);
  const shares = useMemo(() => simShare(scenarios, model), [scenarios, model]);

  function updateScenario(i, key, val) {
    setScenarios(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: key === "price" ? +val : val } : s));
  }

  if (responses.length < 5) return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#aaa" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚗️</div>
      <div style={{ fontSize: 14 }}>Need at least 5 responses. Currently have {responses.length}.</div>
    </div>
  );

  if (!model) return <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>Running analysis...</div>;

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: 680, margin: "0 auto" }}>
      <div style={{ background: "#f8f8f8", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#666", marginBottom: "1rem" }}>
        MNL analysis · {model.nObs} valid choices · Updates live
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
        <Section title="Brand WTP vs XYXX">
          {BRANDS.map(b => <Bar key={b} label={b} value={model.wtp(model.brandUtils[b])} color={BRAND_COLORS[b]} />)}
        </Section>
        <Section title="USP WTP vs Sweat Absorbent">
          {USPS.map((u, i) => <Bar key={u} label={u} value={model.wtp(model.uspUtils[u])} color={["#1D9E75","#185FA5","#534AB7"][i]} />)}
        </Section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
        <Section title="Fabric WTP vs 100% Cotton">
          {FABRICS.map((f, i) => <Bar key={f} label={f} value={model.wtp(model.fabricUtils[f])} color={["#1D9E75","#185FA5","#534AB7"][i]} />)}
        </Section>
        <Section title="Price sensitivity">
          <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111" }}>{Math.abs(model.priceCoef).toFixed(3)}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>price coefficient</div>
            <div style={{ marginTop: 12, fontSize: 12, color: "#444" }}>
              Every ₹100 increase → utility drops by <strong>{Math.round(Math.abs(model.priceCoef) * (100/500) * 100) / 100}</strong> units
            </div>
          </div>
        </Section>
      </div>

      <Section title="Preference share simulator">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                {["Brand","Price","Rating","Fabric","USP","Share"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "#888", fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid #f8f8f8" }}>
                  <td style={{ padding: "6px 4px" }}>
                    <select value={s.brand} onChange={e => updateScenario(i, "brand", e.target.value)}
                      style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px", background: "#fff" }}>
                      {BRANDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <select value={s.price} onChange={e => updateScenario(i, "price", e.target.value)}
                      style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px", background: "#fff" }}>
                      {[300,450,600,800].map(p => <option key={p} value={p}>₹{p}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <select value={s.rating} onChange={e => updateScenario(i, "rating", e.target.value)}
                      style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px", background: "#fff" }}>
                      {["3.9★","4.2★","4.5★"].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <select value={s.fabric} onChange={e => updateScenario(i, "fabric", e.target.value)}
                      style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px", background: "#fff" }}>
                      {FABRICS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <select value={s.usp} onChange={e => updateScenario(i, "usp", e.target.value)}
                      style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px", background: "#fff" }}>
                      {USPS.map(u => <option key={u}>{u}</option>)}
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
      </Section>
    </div>
  );
}
