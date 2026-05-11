export default function Assumptions({ onStart, onBack }) {
  const assumptions = [
    { icon: "⭐", title: "10,000+ verified reviews", body: "All brands shown have the same number of reviews on Amazon / Flipkart — so your choice is not influenced by review volume." },
    { icon: "📦", title: "Pack of 3 — always", body: "Every option is a pack of 3 pieces. Price shown is for the full pack. This is held constant so you can focus on brand, price, rating, fabric, and the functional claim." },
    { icon: "🧵", title: "Same waistband & durability", body: "Waistband quality and overall durability are identical across all options. These are controlled so your preference reflects fabric comfort and brand." },
    { icon: "🚚", title: "2–3 day delivery for all", body: "Delivery time is the same for every option. No same-day or next-day advantage for any brand." },
    { icon: "🏷️", title: "Genuine products only", body: "Assume all options are authentic, sold by the brand directly or via authorised sellers — no counterfeits or grey market products." },
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

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
        {assumptions.map(a => (
          <div key={a.title} style={{ display: "flex", gap: 12, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 22, lineHeight: 1, paddingTop: 2 }}>{a.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 3 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.55 }}>{a.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#f0faf5", border: "1px solid #d0ecdd", borderRadius: 10, padding: "12px 14px", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", marginBottom: 6 }}>What you'll do next</div>
        <div style={{ fontSize: 12, color: "#0F6E56", lineHeight: 1.6 }}>
          You'll see <strong>12 choice tasks</strong>. In each one, pick the option you would actually buy. If none appeals, choose "None of these". There are no right or wrong answers — just your honest preference.
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack}
          style={{ padding: "12px 18px", border: "1.5px solid #e0e0e0", borderRadius: 8, background: "transparent", color: "#444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ← Back
        </button>
        <button onClick={onStart}
          style={{ flex: 1, padding: "13px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          I understand — start the study →
        </button>
      </div>
    </div>
  );
}
