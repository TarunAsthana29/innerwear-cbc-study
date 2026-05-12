import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { BRANDS, USPS, FABRICS, NCCS, BRAND_COLORS, ANALYSIS_THRESHOLDS } from "../data";

const NCCS_COLORS = { "NCCS A1": "#185FA5", "NCCS A2": "#534AB7", "NCCS A3": "#1D9E75", "NCCS B1": "#D85A30" };

const DEFAULT_SCENARIOS = [
  { brand: "Jockey",            price: 600, rating: "4.5★", fabric: "100% Cotton",    usp: "Ultra Breathable" },
  { brand: "XYXX",              price: 450, rating: "4.2★", fabric: "Blended Cotton", usp: "Sweat Absorbent" },
  { brand: "Dixcy Scott Alpha", price: 300, rating: "4.2★", fabric: "100% Cotton",    usp: "Highly Stretchable" },
];

function calcUtil(scenario, model) {
  if (!model) return 0;
  return (model.brandUtils[scenario.brand] || 0)
    + (model.uspUtils[scenario.usp] || 0)
    + (model.fabricUtils[scenario.fabric] || 0)
    + (model.ratingUtils[scenario.rating] || 0)
    + (model.priceCoef * ((scenario.price - 300) / 500));
}

function simShares(scenarios, model) {
  if (!model) return scenarios.map(() => 0);
  const utils = scenarios.map(s => calcUtil(s, model));
  const maxU = Math.max(...utils);
  const exps = utils.map(u => Math.exp(u - maxU));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => Math.round((e / sum) * 100));
}

function WTPBar({ label, value, color }) {
  const abs = Math.abs(value);
  const isPos = value >= 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: "#444" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: isPos ? "#0F6E56" : "#c0392b" }}>
          {isPos ? "+" : ""}₹{value}
        </span>
      </div>
      <div style={{ height: 5, background: "#f0f0f0", borderRadius: 3 }}>
        <div style={{ height: 5, width: Math.min(Math.round((abs / 500) * 100), 100) + "%", background: color || "#111", borderRadius: 3 }} />
      </div>
    </div>
  );
}

export default function HBResults() {
  const [hbData, setHbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState("overall");
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("hb_results").select("*").eq("id", "latest").single();
      if (data) setHbData({ ...data, results: JSON.parse(data.results) });
      setLoading(false);
    }
    load();
    const channel = supabase.channel("hb_results")
      .on("postgres_changes", { event: "*", schema: "public", table: "hb_results" }, payload => {
        if (payload.new) setHbData({ ...payload.new, results: JSON.parse(payload.new.results) });
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function forceRun() {
    setRunning(true);
    await fetch("/api/run-hb?force=1", { method: "POST" });
    setTimeout(() => setRunning(false), 4000);
  }

  function updateScenario(i, key, val) {
    setScenarios(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: key === "price" ? +val : val } : s));
  }

  if (loading) return <div style={{ textAlign: "center", padding: "3rem", color: "#aaa", fontSize: 13 }}>Loading results...</div>;

  if (!hbData) return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#aaa" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚗️</div>
      <div style={{ fontSize: 14, marginBottom: 16 }}>Analysis runs once we reach {ANALYSIS_THRESHOLDS.HB_TRIGGER_MIN} responses.</div>
      <button onClick={forceRun} disabled={running}
        style={{ padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        {running ? "Running..." : "Run now (force)"}
      </button>
    </div>
  );

  const model = hbData.results[activeSegment];
  const shares = simShares(scenarios, model);
  const availableSegments = ["overall", ...NCCS.filter(nc => hbData.results[nc] !== null)];

  return (
    <div style={{ padding: "0 0 2rem" }}>

      <div style={{ background: "#f8f8f8", borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#666", marginBottom: "1rem", lineHeight: 1.5 }}>
        <strong style={{ color: "#111" }}>Pooled MNL via MCMC.</strong> This is an aggregate-level estimator — not true Hierarchical Bayes (which requires individual-level draws). Results are directional and suitable for the business questions being asked.
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: 12, color: "#888" }}>
          Based on <strong style={{ color: "#111" }}>{hbData.n_responses}</strong> responses ·
          computed {new Date(hbData.computed_at).toLocaleTimeString()}
        </div>
        <button onClick={forceRun} disabled={running}
          style={{ padding: "6px 12px", background: "transparent", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 11, color: "#666", cursor: "pointer" }}>
          {running ? "Running..." : "↻ Rerun"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {availableSegments.map(seg => (
          <button key={seg} onClick={() => setActiveSegment(seg)}
            style={{
              padding: "6px 14px", border: "none", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: activeSegment === seg ? (seg === "overall" ? "#111" : NCCS_COLORS[seg]) : "#f0f0f0",
              color: activeSegment === seg ? "#fff" : "#666"
            }}>
            {seg === "overall" ? "All respondents" : seg}
            {seg !== "overall" && hbData.results[seg] && (
              <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.8 }}>n={hbData.results[seg].nRespondents}</span>
            )}
          </button>
        ))}
      </div>

      {!model ? (
        <div style={{ background: "#f8f8f8", borderRadius: 10, padding: "1.5rem", textAlign: "center", color: "#aaa", fontSize: 13 }}>
          Not enough {activeSegment} respondents for analysis (need {ANALYSIS_THRESHOLDS.SEGMENT_MIN}+ per cohort).
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Attribute importance — {activeSegment === "overall" ? "All" : activeSegment}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
              {Object.entries(model.importance).map(([k, v]) => (
                <div key={k} style={{ textAlign: "center", background: "#f8f8f8", borderRadius: 8, padding: "10px 6px" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{v}%</div>
                  <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{k}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
            <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Brand WTP vs XYXX</div>
              {BRANDS.map(b => (
                <WTPBar key={b} label={b} value={model.brandWTP[b] || 0} color={BRAND_COLORS[b]} />
              ))}
            </div>
            <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>USP WTP vs Sweat Absorbent</div>
              {USPS.map((u, i) => (
                <WTPBar key={u} label={u} value={model.uspWTP[u] || 0} color={["#1D9E75","#185FA5","#534AB7"][i]} />
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Fabric WTP vs 100% Cotton</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {FABRICS.map((f, i) => (
                <WTPBar key={f} label={f} value={model.fabricWTP ? (model.fabricWTP[f] || 0) : 0} color={["#1D9E75","#185FA5","#534AB7"][i]} />
              ))}
            </div>
          </div>

          {activeSegment === "overall" && (
            <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem", marginBottom: "1rem", overflowX: "auto" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Brand WTP by NCCS cohort (₹ premium vs XYXX)</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", color: "#888", fontWeight: 600 }}>Brand</th>
                    {NCCS.map(nc => (
                      <th key={nc} style={{ padding: "6px 8px", textAlign: "center", color: NCCS_COLORS[nc], fontWeight: 600 }}>
                        {nc.replace("NCCS ", "")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BRANDS.map(b => (
                    <tr key={b} style={{ borderBottom: "0.5px solid #f8f8f8" }}>
                      <td style={{ padding: "7px 8px", fontWeight: 500, color: "#333" }}>{b}</td>
                      {NCCS.map(nc => {
                        const seg = hbData.results[nc];
                        const val = seg ? (seg.brandWTP[b] || 0) : null;
                        return (
                          <td key={nc} style={{ padding: "7px 8px", textAlign: "center", fontWeight: 600, color: val === null ? "#ccc" : val >= 0 ? "#0F6E56" : "#c0392b" }}>
                            {val === null ? "—" : (val >= 0 ? "+" : "") + "₹" + Math.abs(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>— = insufficient sample (need {ANALYSIS_THRESHOLDS.SEGMENT_MIN}+ per cohort)</div>
            </div>
          )}

          <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Preference share simulator</div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 12 }}>
              {activeSegment === "overall" ? "All respondents" : activeSegment} · Edit any cell to update
            </div>
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
                      <td style={{ padding: "5px 4px" }}>
                        <select value={s.brand} onChange={e => updateScenario(i, "brand", e.target.value)}
                          style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px", background: "#fff" }}>
                          {BRANDS.map(b => <option key={b}>{b}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "5px 4px" }}>
                        <select value={s.price} onChange={e => updateScenario(i, "price", e.target.value)}
                          style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px", background: "#fff" }}>
                          {[300,450,600,800].map(p => <option key={p} value={p}>₹{p}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "5px 4px" }}>
                        <select value={s.rating} onChange={e => updateScenario(i, "rating", e.target.value)}
                          style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px", background: "#fff" }}>
                          {["3.9★","4.2★","4.5★"].map(r => <option key={r}>{r}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "5px 4px" }}>
                        <select value={s.fabric} onChange={e => updateScenario(i, "fabric", e.target.value)}
                          style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px", background: "#fff" }}>
                          {FABRICS.map(f => <option key={f}>{f}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "5px 4px" }}>
                        <select value={s.usp} onChange={e => updateScenario(i, "usp", e.target.value)}
                          style={{ fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px", background: "#fff" }}>
                          {USPS.map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "5px 8px" }}>
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
          </div>
        </>
      )}
    </div>
  );
}
