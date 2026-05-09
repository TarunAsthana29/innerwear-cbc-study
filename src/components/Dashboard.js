import { useState } from "react";
import { BRANDS, USPS, NCCS, PLATFORMS, BRAND_COLORS, TASKS } from "../data";
import Analysis from "./Analysis";

function Bar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#444", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: "#888" }}>{pct}% ({count})</span>
      </div>
      <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
        <div style={{ height: 6, width: pct + "%", background: color || "#111", borderRadius: 3, transition: "width 0.6s" }} />
      </div>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div style={{ background: "#f8f8f8", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#111" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard({ responses, onClearData, maxResponses }) {
  const [activeTab, setActiveTab] = useState("overview");
  const n = responses.length;

  const allChoices = responses.flatMap(r =>
    r.choices.map((c, ti) => c !== null && c !== "none" ? { ...TASKS[ti][c], task: ti } : null).filter(Boolean)
  );

  const brandCounts = {};
  BRANDS.forEach(b => brandCounts[b] = 0);
  allChoices.forEach(c => brandCounts[c.b]++);
  const totalChoices = allChoices.length || 1;

  const uspCounts = {};
  USPS.forEach(u => uspCounts[u] = 0);
  allChoices.forEach(c => uspCounts[c.u]++);

  const avgPrice = allChoices.length ? Math.round(allChoices.reduce((s, c) => s + c.p, 0) / allChoices.length) : 0;
  const noneRate = Math.round((responses.flatMap(r => r.choices).filter(c => c === "none").length / ((n * 12) || 1)) * 100);

  const nccsBreakdown = {};
  const tierBreakdown = {};
  const platformBreakdown = {};
  responses.forEach(r => {
    nccsBreakdown[r.nccs] = (nccsBreakdown[r.nccs] || 0) + 1;
    tierBreakdown[r.tier] = (tierBreakdown[r.tier] || 0) + 1;
    platformBreakdown[r.platform] = (platformBreakdown[r.platform] || 0) + 1;
  });

  function exportCSV() {
    const rows = [["respondent_id","age","nccs","tier","platform","task","option","brand","price","pack","rating","usp"]];
    responses.forEach(r => {
      r.choices.forEach((c, ti) => {
        if (c === null) return;
        if (c === "none") {
          rows.push([r.id, r.age, r.nccs, r.tier, r.platform, ti + 1, "none", "", "", "", "", ""]);
        } else {
          const opt = TASKS[ti][c];
          rows.push([r.id, r.age, r.nccs, r.tier, r.platform, ti + 1, String.fromCharCode(65 + c), opt.b, opt.p, opt.k, opt.r, opt.u]);
        }
      });
    });
    const csv = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "cbc_responses.csv"; a.click();
  }

  const progress = Math.round((n / maxResponses) * 100);

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: 680, margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>Live results</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCSV}
            style={{ padding: "7px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Export CSV ↓
          </button>
          <button onClick={onClearData}
            style={{ padding: "7px 14px", background: "transparent", color: "#c0392b", border: "1px solid #c0392b", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Clear data
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 4 }}>
          <span>{n} of {maxResponses} responses collected</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2 }}>
          <div style={{ height: 4, width: progress + "%", background: progress >= 100 ? "#c0392b" : "#111", borderRadius: 2, transition: "width 0.5s" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem" }}>
        {[{ id: "overview", label: "Overview" }, { id: "analysis", label: "Part-worths & WTP" }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: "7px 14px", border: "none", background: activeTab === t.id ? "#111" : "#f0f0f0", color: activeTab === t.id ? "#fff" : "#666", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "analysis" ? (
        <Analysis responses={responses} />
      ) : (
        <>
          {n === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#aaa" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14 }}>No responses yet. Share the survey link to start collecting.</div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.5rem" }}>
                <Stat label="Responses" value={n} sub="completed" />
                <Stat label="Avg price chosen" value={"₹" + avgPrice} />
                <Stat label="None rate" value={noneRate + "%"} sub="tasks skipped" />
                <Stat label="Total choices" value={allChoices.length} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "1.5rem" }}>
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Brand preference</div>
                  {BRANDS.map(b => <Bar key={b} label={b} count={brandCounts[b]} total={totalChoices} color={BRAND_COLORS[b]} />)}
                </div>
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>USP preference</div>
                  {USPS.map((u, i) => <Bar key={u} label={u.split(" & ")[0]} count={uspCounts[u]} total={totalChoices} color={["#1D9E75","#185FA5","#D85A30","#534AB7"][i]} />)}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "1.5rem" }}>
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>NCCS breakdown</div>
                  {NCCS.map(nc => <Bar key={nc} label={nc} count={nccsBreakdown[nc] || 0} total={n} color="#534AB7" />)}
                </div>
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>City tier</div>
                  {["Tier 1","Tier 2","Tier 3"].map(t => <Bar key={t} label={t} count={tierBreakdown[t] || 0} total={n} color="#0F6E56" />)}
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Platform</div>
                {PLATFORMS.map(p => <Bar key={p} label={p} count={platformBreakdown[p] || 0} total={n} color="#BA7517" />)}
              </div>

              <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Price distribution of chosen options</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[250, 450, 650, 850].map(price => {
                    const cnt = allChoices.filter(c => c.p === price).length;
                    const pct = Math.round((cnt / totalChoices) * 100);
                    return (
                      <div key={price} style={{ textAlign: "center", background: "#f8f8f8", borderRadius: 8, padding: "12px 8px" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>₹{price}</div>
                        <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{pct}% ({cnt})</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
