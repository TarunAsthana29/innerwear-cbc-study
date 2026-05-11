import { useState } from "react";
import { INCOME_OPTIONS, INCOME_TO_NCCS, PLATFORMS } from "../data";

const CITY_TIERS = [
  "Tier 1 — Metro (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune)",
  "Tier 2 (Jaipur, Lucknow, Indore, Nagpur, Surat, Vadodara)",
];

export default function Screener({ onComplete }) {
  const [form, setForm] = useState({ age: "", gender: "", recency: "", income: "", tier: "", platform: "" });
  const [err, setErr] = useState("");
  const [terminated, setTerminated] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function submit() {
    if (!form.age || !form.gender || !form.recency || !form.income || !form.tier || !form.platform) {
      setErr("Please complete all fields"); return;
    }
    if (+form.age < 18 || +form.age > 55) {
      setErr("Age must be between 18–55"); return;
    }
    // Hard screens
    if (form.gender !== "Male") {
      setTerminated("This study is for male respondents only. Thank you for your interest."); return;
    }
    if (form.recency !== "Yes") {
      setTerminated("This study requires participants who have bought innerwear online in the last 6 months. Thank you for your interest."); return;
    }

    const nccs = INCOME_TO_NCCS[form.income];
    const tierShort = form.tier.startsWith("Tier 1") ? "Tier 1" : "Tier 2";
    const id = "resp_" + Math.random().toString(36).slice(2, 10);
    onComplete({ ...form, nccs, tier: tierShort, id, ts: Date.now() });
  }

  if (terminated) return (
    <div style={{ maxWidth: 480, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>🙏</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 8 }}>Thank you</h2>
      <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{terminated}</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#888", textTransform: "uppercase", marginBottom: 8 }}>Innerwear India Study</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", lineHeight: 1.2, marginBottom: 8 }}>Before we begin</h1>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>Quick screener — takes 30 seconds. Your answers help us understand preferences by shopper profile.</p>
      </div>

      {/* Age */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Your age</label>
        <input type="number" placeholder="e.g. 28" value={form.age} onChange={e => set("age", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
      </div>

      {/* Gender */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Gender</label>
        <select value={form.gender} onChange={e => set("gender", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none", fontFamily: "inherit" }}>
          <option value="">Select…</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other / Prefer not to say</option>
        </select>
      </div>

      {/* Purchase recency */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Have you bought innerwear online in the last 6 months?</label>
        <select value={form.recency} onChange={e => set("recency", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none", fontFamily: "inherit" }}>
          <option value="">Select…</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {/* Income */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Monthly household income</label>
        <select value={form.income} onChange={e => set("income", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none", fontFamily: "inherit" }}>
          <option value="">Select…</option>
          {INCOME_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* City tier — Tier 3 removed */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>City tier</label>
        <select value={form.tier} onChange={e => set("tier", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none", fontFamily: "inherit" }}>
          <option value="">Select…</option>
          {CITY_TIERS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Platform */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Platform you buy innerwear on</label>
        <select value={form.platform} onChange={e => set("platform", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none", fontFamily: "inherit" }}>
          <option value="">Select…</option>
          {["Amazon","Flipkart","Myntra","Quick Comm (Blinkit, Zepto, Instamart)","Multiple platforms"].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

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
