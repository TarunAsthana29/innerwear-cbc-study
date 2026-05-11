import { useState } from "react";
import { PLATFORMS } from "../data";

const CITY_TIERS = [
  "Tier 1 — Metro (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune)",
  "Tier 2 (Jaipur, Lucknow, Indore, Nagpur, Surat, Vadodara)",
];

const EDUCATION_LEVELS = [
  { value: "illiterate",            label: "Illiterate / Just literate" },
  { value: "school_5",              label: "Studied up to 4th standard" },
  { value: "school_9",              label: "Studied 5th–9th standard" },
  { value: "ssc_hsc",               label: "SSC / HSC (10th–12th pass)" },
  { value: "graduate_general",      label: "Graduate / Postgraduate (general)" },
  { value: "graduate_professional", label: "Graduate / Postgraduate (professional, e.g. CA, doctor, engineer, MBA)" },
];

const DURABLES = [
  "AC",
  "Car",
  "Washing machine",
  "Refrigerator",
  "Two-wheeler",
];

// NCCS grid — official MRSI/MRUC mapping (Education × Durables count)
// Rows = education levels (in order above), Columns = number of durables owned (0,1,2,3,4,5)
const NCCS_GRID = {
  illiterate:            ["E3", "E2", "E1", "D2", "D2", "D1"],
  school_5:              ["E2", "E1", "D2", "D1", "D1", "C2"],
  school_9:              ["E1", "D2", "D1", "C2", "C1", "B2"],
  ssc_hsc:               ["D2", "D1", "C2", "C1", "B2", "B1"],
  graduate_general:      ["D1", "C2", "C1", "B2", "B1", "A3"],
  graduate_professional: ["D1", "C2", "B2", "B1", "A3", "A2"],
};

// Special override — owning all 5 durables + professional grad = A1
function classifyNCCS(education, durableCount) {
  if (education === "graduate_professional" && durableCount === 5) return "A1";
  const row = NCCS_GRID[education];
  if (!row) return null;
  return row[Math.min(durableCount, 5)];
}

// Map full NCCS class to study cohort A1/A2/A3/B1 (other classes excluded)
const NCCS_COHORT_MAP = {
  "A1": "NCCS A1",
  "A2": "NCCS A2",
  "A3": "NCCS A3",
  "B1": "NCCS B1",
};

export default function Screener({ onComplete }) {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    recency: "",
    education: "",
    durables: [],
    tier: "",
    platform: "",
  });
  const [err, setErr] = useState("");
  const [terminated, setTerminated] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function toggleDurable(d) {
    setForm(f => ({
      ...f,
      durables: f.durables.includes(d) ? f.durables.filter(x => x !== d) : [...f.durables, d]
    }));
  }

  function submit() {
    if (!form.age || !form.gender || !form.recency || !form.education || !form.tier || !form.platform) {
      setErr("Please complete all fields"); return;
    }
    if (+form.age < 18 || +form.age > 55) {
      setErr("Age must be between 18–55"); return;
    }
    if (form.gender !== "Male") {
      setTerminated("This study is for male respondents only. Thank you for your interest."); return;
    }
    if (form.recency !== "Yes") {
      setTerminated("This study requires participants who have bought innerwear online in the last 6 months. Thank you for your interest."); return;
    }

    const nccsRaw = classifyNCCS(form.education, form.durables.length);
    const nccs = NCCS_COHORT_MAP[nccsRaw];

    // Out-of-scope NCCS (B2, C1, C2, D1, D2, E1, E2, E3)
    if (!nccs) {
      setTerminated("This study targets specific income cohorts. Based on your responses, you don't fall within our current sample. Thank you for your interest!");
      return;
    }

    const tierShort = form.tier.startsWith("Tier 1") ? "Tier 1" : "Tier 2";
    const id = "resp_" + Math.random().toString(36).slice(2, 10);
    onComplete({
      ...form,
      nccs,
      nccs_raw: nccsRaw,
      durables_count: form.durables.length,
      durables_list: form.durables.join("; "),
      tier: tierShort,
      id,
      ts: Date.now()
    });
  }

  if (terminated) return (
    <div style={{ maxWidth: 480, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>🙏</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 8 }}>Thank you</h2>
      <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{terminated}</p>
    </div>
  );

  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 };
  const inputStyle = { width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fff" };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#888", textTransform: "uppercase", marginBottom: 8 }}>Innerwear India Study</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", lineHeight: 1.2, marginBottom: 8 }}>Before we begin</h1>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>Quick screener — takes about a minute. Your answers help us understand preferences by shopper profile.</p>
      </div>

      {/* Age */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Your age</label>
        <input type="number" placeholder="e.g. 28" value={form.age} onChange={e => set("age", e.target.value)} style={inputStyle} />
      </div>

      {/* Gender */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Gender</label>
        <select value={form.gender} onChange={e => set("gender", e.target.value)} style={inputStyle}>
          <option value="">Select…</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other / Prefer not to say</option>
        </select>
      </div>

      {/* Recency */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Have you bought innerwear online in the last 6 months?</label>
        <select value={form.recency} onChange={e => set("recency", e.target.value)} style={inputStyle}>
          <option value="">Select…</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {/* Education of chief wage earner */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Highest education level of the chief wage earner in your household</label>
        <p style={{ fontSize: 11, color: "#999", margin: "0 0 6px", lineHeight: 1.4 }}>
          The chief wage earner is the person who contributes most to household expenses.
        </p>
        <select value={form.education} onChange={e => set("education", e.target.value)} style={inputStyle}>
          <option value="">Select…</option>
          {EDUCATION_LEVELS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Durables checkbox list */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Which of these does your household own?</label>
        <p style={{ fontSize: 11, color: "#999", margin: "0 0 8px", lineHeight: 1.4 }}>Tick all that apply. Skip any you don't own.</p>
        <div style={{ border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "8px 10px", background: "#fff" }}>
          {DURABLES.map(d => (
            <label key={d} style={{ display: "flex", alignItems: "center", padding: "8px 4px", cursor: "pointer", borderBottom: d === DURABLES[DURABLES.length - 1] ? "none" : "0.5px solid #f4f4f4" }}>
              <input type="checkbox" checked={form.durables.includes(d)} onChange={() => toggleDurable(d)}
                style={{ marginRight: 10, width: 16, height: 16, cursor: "pointer" }} />
              <span style={{ fontSize: 14, color: "#333" }}>{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* City tier */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>City tier</label>
        <select value={form.tier} onChange={e => set("tier", e.target.value)} style={inputStyle}>
          <option value="">Select…</option>
          {CITY_TIERS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Platform */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Platform you buy innerwear on</label>
        <select value={form.platform} onChange={e => set("platform", e.target.value)} style={inputStyle}>
          <option value="">Select…</option>
          {PLATFORMS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {err && <div style={{ fontSize: 12, color: "#c0392b", marginBottom: 12 }}>{err}</div>}

      <button onClick={submit}
        style={{ width: "100%", padding: "13px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        Continue →
      </button>

      <div style={{ marginTop: 16, padding: "12px 14px", background: "#f8f8f8", borderRadius: 8, fontSize: 11, color: "#888", lineHeight: 1.6 }}>
        Your answers are anonymous. We do not collect your name, email, or phone number.
      </div>
    </div>
  );
}
