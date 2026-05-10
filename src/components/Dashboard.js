import { useState } from "react";
import { BRANDS, USPS, NCCS, PLATFORMS, BRAND_COLORS, TASKS } from "../data";
import HBResults from "./HBResults";

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

  function downloadReport() {
    const now = new Date();
    const ts = now.toLocaleDateString("en-IN", {day:"2-digit",month:"short",year:"numeric"}) + " " + now.toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit"});
    const lines = [];
    lines.push("INNERWEAR CBC STUDY — DASHBOARD REPORT");
    lines.push("Generated: " + ts);
    lines.push("=".repeat(50));
    lines.push("");
    lines.push("FIELDWORK SUMMARY");
    lines.push("Responses collected: " + n + " of " + maxResponses);
    lines.push("Progress: " + Math.round((n/maxResponses)*100) + "%");
    lines.push("Avg price chosen: ₹" + (allChoices.length ? Math.round(allChoices.reduce((s,c)=>s+c.p,0)/allChoices.length) : 0));
    lines.push("None rate: " + Math.round((responses.flatMap(r=>r.choices).filter(c=>c==="none").length/((n*9)||1))*100) + "%");
    lines.push("Total valid choices: " + allChoices.length);
    lines.push("");
    lines.push("BRAND PREFERENCE (raw choice share)");
    BRANDS.forEach(b => {
      const cnt = allChoices.filter(c=>c.b===b).length;
      const pct = Math.round((cnt/Math.max(allChoices.length,1))*100);
      lines.push("  " + b + ": " + pct + "% (" + cnt + " choices)");
    });
    lines.push("");
    lines.push("USP / FABRIC PREFERENCE (raw choice share)");
    USPS.forEach(u => {
      const cnt = allChoices.filter(c=>c.u===u).length;
      const pct = Math.round((cnt/Math.max(allChoices.length,1))*100);
      lines.push("  " + u + ": " + pct + "% (" + cnt + " choices)");
    });
    lines.push("");
    lines.push("NCCS BREAKDOWN");
    NCCS.forEach(nc => {
      const cnt = responses.filter(r=>r.nccs===nc).length;
      lines.push("  " + nc + ": " + cnt + " respondents (" + Math.round((cnt/Math.max(n,1))*100) + "%)");
    });
    lines.push("");
    lines.push("CITY TIER");
    ["Tier 1","Tier 2","Tier 3"].forEach(t => {
      const cnt = responses.filter(r=>r.tier===t).length;
      lines.push("  " + t + ": " + cnt + " respondents (" + Math.round((cnt/Math.max(n,1))*100) + "%)");
    });
    lines.push("");
    lines.push("PLATFORM");
    ["Amazon","Flipkart","Myntra","Quick Comm (Blinkit, Zepto, Instamart)","Multiple platforms"].forEach(p => {
      const cnt = responses.filter(r=>r.platform===p).length;
      lines.push("  " + p + ": " + cnt + " (" + Math.round((cnt/Math.max(n,1))*100) + "%)");
    });
    lines.push("");
    lines.push("PRICE DISTRIBUTION OF CHOSEN OPTIONS");
    [300,450,600,800].forEach(price => {
      const cnt = allChoices.filter(c=>c.p===price).length;
      lines.push("  ₹" + price + ": " + Math.round((cnt/Math.max(allChoices.length,1))*100) + "% (" + cnt + ")");
    });
    lines.push("");
    lines.push("NOTE: Part-worth utilities and WTP available in the Pooled MNL & WTP tab.");
    lines.push("=".repeat(50));

    const blob = new Blob([lines.join("\n")], {type:"text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = "Innerwear_CBC_Report_" + now.toISOString().slice(0,16).replace(/[T:]/g,"-") + ".txt";
    a.href=url; a.download=filename; a.click();
  }

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

  function downloadReport() {
    const now = new Date();
    const ts = now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const fileName = "Innerwear_CBC_Dashboard_" + now.toISOString().slice(0,16).replace("T","_").replace(/:/g,"-") + ".html";

    const nccsRows = NCCS.map(nc => {
      const cnt = nccsBreakdown[nc] || 0;
      const pct = n > 0 ? Math.round(cnt/n*100) : 0;
      return `<tr><td>${nc}</td><td>${cnt}</td><td>${pct}%</td></tr>`;
    }).join("");

    const brandRows = BRANDS.map(b => {
      const cnt = brandCounts[b] || 0;
      const pct = Math.round(cnt/totalChoices*100);
      return `<tr><td>${b}</td><td>${cnt}</td><td>${pct}%</td></tr>`;
    }).join("");

    const uspRows = USPS.map(u => {
      const cnt = uspCounts[u] || 0;
      const pct = Math.round(cnt/totalChoices*100);
      return `<tr><td>${u}</td><td>${cnt}</td><td>${pct}%</td></tr>`;
    }).join("");

    const priceRows = [300,450,600,800].map(price => {
      const cnt = allChoices.filter(c => c.p === price).length;
      const pct = Math.round(cnt/totalChoices*100);
      return `<tr><td>₹${price}</td><td>${cnt}</td><td>${pct}%</td></tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Innerwear CBC Dashboard Report</title>
<style>
  body{font-family:helvetica,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#111}
  h1{font-size:22px;margin-bottom:4px}
  .meta{font-size:12px;color:#888;margin-bottom:2rem}
  h2{font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#534AB7;margin:2rem 0 0.5rem}
  table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:1rem}
  th{text-align:left;padding:6px 10px;background:#f0f0f0;font-weight:600}
  td{padding:6px 10px;border-bottom:1px solid #f5f5f5}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:1rem}
  .stat{background:#f8f8f8;padding:12px;border-radius:8px}
  .stat-val{font-size:24px;font-weight:700}
  .stat-label{font-size:11px;color:#888;margin-top:2px}
  .footer{font-size:11px;color:#aaa;margin-top:3rem;border-top:1px solid #f0f0f0;padding-top:1rem}
</style></head><body>
<h1>Innerwear CBC Study — Dashboard Report</h1>
<div class="meta">Generated: ${ts} · ${n} of ${maxResponses} responses collected (${progress}%)</div>

<div class="stats">
  <div class="stat"><div class="stat-val">${n}</div><div class="stat-label">Responses</div></div>
  <div class="stat"><div class="stat-val">₹${avgPrice}</div><div class="stat-label">Avg price chosen</div></div>
  <div class="stat"><div class="stat-val">${noneRate}%</div><div class="stat-label">None rate</div></div>
  <div class="stat"><div class="stat-val">${allChoices.length}</div><div class="stat-label">Total choices</div></div>
</div>

<h2>NCCS Breakdown</h2>
<table><tr><th>Cohort</th><th>Count</th><th>%</th></tr>${nccsRows}</table>

<h2>Brand Preference</h2>
<table><tr><th>Brand</th><th>Times chosen</th><th>% of choices</th></tr>${brandRows}</table>

<h2>USP / Fabric Preference</h2>
<table><tr><th>USP</th><th>Times chosen</th><th>% of choices</th></tr>${uspRows}</table>

<h2>Price Distribution of Chosen Options</h2>
<table><tr><th>Price (pack of 3)</th><th>Times chosen</th><th>% of choices</th></tr>${priceRows}</table>

<div class="footer">Innerwear CBC Study · innerwear-cbc-study.vercel.app · Aggregate MNL analysis · Report generated ${ts}</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName; a.click();
  }

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: 680, margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>Live results</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={downloadReport}
            style={{ padding: "7px 14px", background: "#534AB7", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Download report ↓
          </button>
          <button onClick={downloadReport}
            style={{ padding: "7px 14px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Download Report ↓
          </button>
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
        {[{ id: "overview", label: "Overview" }, { id: "analysis", label: "Pooled MNL & WTP" }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: "7px 14px", border: "none", background: activeTab === t.id ? "#111" : "#f0f0f0", color: activeTab === t.id ? "#fff" : "#666", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "analysis" ? (
        <HBResults />
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
                  {NCCS.map(nc => {
                    const target = { "NCCS A1":100, "NCCS A2":150, "NCCS A3":150, "NCCS B1":100 }[nc] || 100;
                    const cnt = nccsBreakdown[nc] || 0;
                    const pct = Math.round((cnt/n)*100);
                    const targetPct = Math.round((target/500)*100);
                    return (
                      <div key={nc} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:12,color:"#444",fontWeight:500}}>{nc}</span>
                          <span style={{fontSize:11,color:"#888"}}>{cnt} ({pct}%) <span style={{color:"#aaa"}}>· target {targetPct}%</span></span>
                        </div>
                        <div style={{height:6,background:"#f0f0f0",borderRadius:3,position:"relative"}}>
                          <div style={{height:6,width:pct+"%",background:"#534AB7",borderRadius:3,transition:"width 0.6s"}}/>
                          <div style={{position:"absolute",top:0,left:targetPct+"%",width:2,height:6,background:"#c0392b",borderRadius:1}}/>
                        </div>
                        <div style={{fontSize:9,color:"#aaa",marginTop:2}}>Red line = suggestive quota target</div>
                      </div>
                    );
                  })}
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
