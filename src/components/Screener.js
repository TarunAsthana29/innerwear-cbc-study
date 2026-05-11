import { useState } from "react";
import { INCOME_OPTIONS, INCOME_TO_NCCS, CITY_TIERS, PLATFORMS } from "../data";

export default function Screener({ onComplete }) {
  const [form, setForm] = useState({ age: "", income: "", tier: "", platform: "" });
  const [err, setErr] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function submit() {
    if (!form.age || !form.income || !form.tier || !form.platform) {
      setErr("Please complete all fields"); return;
    }
    if (+form.age < 18 || +form.age > 55) {
      setErr("Age must be between 18–55"); return;
    }
    const tierShort = form.tier.startsWith("Tier 1") ? "Tier 1" : form.tier.startsWith("Tier 2") ? "Tier 2" : "Tier 3";
    const nccs = INCOME_TO_NCCS[form.income];
    const id = "resp_" + Math.random().toString(36).slice(2, 10);
    onComplete({ ...form, nccs, tier: tierShort, id, ts: Date.now() });
  }

  const fields = [
    { label: "Monthly household income", key: "income", options: INCOME_OPTIONS },
    { label: "City tier", key: "tier", options: CITY_TIERS },
    { label: "Platform you buy innerwear on", key: "platform", options: PLATFORMS },
  ];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#888", textTransform: "uppercase", marginBottom: 8 }}>Innerwear India Study</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", lineHeight: 1.2, marginBottom: 8 }}>Before we begin</h1>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>Quick screener — takes 30 seconds. Your answers help us understand preferences by shopper profile.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Your age</label>
        <input type="number" placeholder="e.g. 28" value={form.age}
          onChange={e => set("age", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
      </div>

      {fields.map(f => (
        <div key={f.key} style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</label>
          <select value={form[f.key]} onChange={e => set(f.key, e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none", fontFamily: "inherit" }}>
            <option value="">Select…</option>
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ))}

      {err && <div style={{ fontSize: 12, color: "#c0392b", marginBottom: 12 }}>{err}</div>}

      <button onClick={submit}
        style={{ width: "100%", padding: "13px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        Start the study →
      </button>

      <div style={{ marginTop: 16, padding: "12px 14px", background: "#f8f8f8", borderRadius: 8, fontSize: 12, color: "#888", lineHeight: 1.6 }}>
        All options have: <strong style={{ color: "#555" }}>10,000+ verified reviews</strong> · <strong style={{ color: "#555" }}>Same waistband &amp; durability</strong> · <strong style={{ color: "#555" }}>2–3 day delivery</strong>
      </div>
    </div>
  );
}
