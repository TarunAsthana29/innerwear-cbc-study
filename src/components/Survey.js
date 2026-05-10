import { useState } from "react";
import { TASKS, BRAND_COLORS } from "../data";

const N_TASKS = 12;

function TaskCard({ opt, label, selected, onSelect }) {
  const color = BRAND_COLORS[opt.b] || "#534AB7";
  return (
    <div onClick={onSelect} style={{
      border: selected ? `2.5px solid ${color}` : "1.5px solid #e8e8e8",
      borderRadius: 12, padding: "1rem", cursor: "pointer",
      background: selected ? `${color}10` : "#fff",
      transition: "all 0.15s", transform: selected ? "scale(1.01)" : "scale(1)",
      position: "relative"
    }}>
      {selected && <div style={{ position: "absolute", top: -10, right: 10, background: color, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>Selected</div>}
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Option {label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 10 }}>{opt.b}</div>
      {[["Price (pack of 3)", `₹${opt.p}`], ["Rating", opt.r], ["Fabric", opt.f], ["USP", opt.u]].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #f0f0f0", fontSize: 12 }}>
          <span style={{ color: "#888" }}>{k}</span>
          <span style={{ fontWeight: 600, color: "#111", textAlign: "right", maxWidth: "60%" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function AssumptionsScreen({ onStart }) {
  const assumptions = [
    { icon: "⭐", title: "10,000+ verified reviews", body: "All brands shown have the same number of reviews on Amazon / Flipkart — so your choice is not influenced by review volume." },
    { icon: "📦", title: "Pack of 3 — always", body: "Every option is a pack of 3 pieces. Price shown is for the full pack. This is held constant so you can focus on brand, price per pack, rating, and fabric." },
    { icon: "🧵", title: "Same waistband & durability", body: "Waistband quality and overall durability are identical across all options. These are controlled out so your preference reflects fabric comfort and brand." },
    { icon: "🚚", title: "2–3 day delivery for all", body: "Delivery time is the same for every option. No same-day or next-day advantage for any brand." },
    { icon: "🏷️", title: "Genuine products", body: "Assume all options are authentic, sold by the brand directly or authorised sellers — no counterfeits or grey market products." },
  ];

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#888", textTransform: "uppercase", marginBottom: 8 }}>Before you choose</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", lineHeight: 1.3, marginBottom: 8 }}>All options share these assumptions</h1>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
          To isolate what truly drives your purchase decision, we've held several variables constant. Please read these before starting.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "2rem" }}>
        {assumptions.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "14px 16px", background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 12 }}>
            <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{a.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{a.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#f0faf5", border: "1.5px solid #1D9E75", borderRadius: 10, padding: "12px 16px", marginBottom: "1.5rem", fontSize: 12, color: "#0F6E56", lineHeight: 1.6 }}>
        <strong>Your task:</strong> In each of the 12 screens ahead, you'll see 3 products side by side. Pick the one you would most likely buy — or choose "None" if you wouldn't buy any.
      </div>

      <button onClick={onStart}
        style={{ width: "100%", padding: "14px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3 }}>
        I understand — start the study →
      </button>
    </div>
  );
}

export default function Survey({ onComplete }) {
  const [stage, setStage] = useState("assumptions"); // "assumptions" | "tasks"
  const [current, setCurrent] = useState(0);
  const [choices, setChoices] = useState(new Array(N_TASKS).fill(null));

  if (stage === "assumptions") {
    return <AssumptionsScreen onStart={() => setStage("tasks")} />;
  }

  function select(idx) {
    const next = [...choices]; next[current] = idx; setChoices(next);
  }

  function next() {
    if (current < N_TASKS - 1) setCurrent(c => c + 1);
    else onComplete(choices);
  }

  const task = TASKS[current];
  const pct = Math.round(((current + 1) / N_TASKS) * 100);
  const done = choices.filter(x => x !== null).length;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Task {current + 1} of {N_TASKS}</span>
        <span style={{ fontSize: 12, color: "#888" }}>{done} of {N_TASKS} recorded</span>
      </div>
      <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2, marginBottom: "1.25rem" }}>
        <div style={{ height: 4, width: `${pct}%`, background: "#111", borderRadius: 2, transition: "width 0.3s" }} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 4 }}>Which pack would you buy?</p>
        <div style={{ fontSize: 11, color: "#aaa", background: "#f9f9f9", borderRadius: 6, padding: "6px 10px" }}>
          Pack of 3 · 10,000+ reviews · Same waistband &amp; durability · 2–3 day delivery
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: "1rem" }}>
        {task.map((opt, i) => (
          <TaskCard key={i} opt={opt} label={String.fromCharCode(65 + i)} selected={choices[current] === i} onSelect={() => select(i)} />
        ))}
      </div>

      <button onClick={() => select("none")}
        style={{ width: "100%", padding: "9px", border: `1.5px dashed ${choices[current] === "none" ? "#111" : "#ddd"}`, borderRadius: 8, background: choices[current] === "none" ? "#f5f5f5" : "transparent", color: "#888", fontSize: 12, cursor: "pointer", marginBottom: "1rem" }}>
        None of these — I wouldn't buy any
      </button>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => { if (current === 0) setStage("assumptions"); else setCurrent(c => c - 1); }}
          style={{ padding: "10px 20px", border: "1.5px solid #e0e0e0", borderRadius: 8, background: "transparent", color: "#444", fontSize: 13, cursor: "pointer" }}>
          ← Back
        </button>
        <button onClick={next} disabled={choices[current] === null}
          style={{ padding: "10px 24px", background: choices[current] === null ? "#e0e0e0" : "#111", color: choices[current] === null ? "#aaa" : "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: choices[current] === null ? "default" : "pointer" }}>
          {current < N_TASKS - 1 ? "Next →" : "Submit →"}
        </button>
      </div>
    </div>
  );
}
