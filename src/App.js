import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Screener from "./components/Screener";
import Survey from "./components/Survey";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [tab, setTab] = useState("survey");
  const [stage, setStage] = useState("screener");
  const [respondent, setRespondent] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check URL for ?dashboard param
  useEffect(() => {
    if (window.location.search.includes("dashboard")) setTab("dashboard");
  }, []);

  // Load responses from Supabase
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("responses")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setResponses(data);
      setLoading(false);
    }
    load();

    // Realtime subscription
    const channel = supabase
      .channel("responses")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "responses" }, payload => {
        setResponses(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function handleComplete(choices) {
    setSaving(true);
    const row = {
      respondent_id: respondent.id,
      age: +respondent.age,
      nccs: respondent.nccs,
      tier: respondent.tier,
      platform: respondent.platform,
      income: respondent.income,
      choices: JSON.stringify(choices),
      completed_at: new Date().toISOString()
    };
    await supabase.from("responses").insert([row]);
    setSaving(false);
    setStage("done");
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", minHeight: "100vh", background: "#fafafa" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ borderBottom: "1px solid #ebebeb", background: "#fff", padding: "0 1rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ padding: "14px 0", fontSize: 13, fontWeight: 700, color: "#111" }}>
            Innerwear CBC Study
            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 500, background: "#f0faf5", color: "#0F6E56", padding: "2px 8px", borderRadius: 20 }}>LIVE</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[{ id: "survey", label: "Survey" }, { id: "dashboard", label: `Dashboard${responses.length > 0 ? ` (${responses.length})` : ""}` }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "8px 14px", border: "none", background: tab === t.id ? "#111" : "transparent", color: tab === t.id ? "#fff" : "#888", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#aaa", fontSize: 13 }}>Loading…</div>
      ) : tab === "dashboard" ? (
        <Dashboard responses={responses.map(r => ({ ...r, choices: JSON.parse(r.choices) }))} />
      ) : stage === "screener" ? (
        <Screener onComplete={r => { setRespondent(r); setStage("survey"); }} />
      ) : stage === "survey" ? (
        <Survey onComplete={handleComplete} />
      ) : (
        <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
          <div style={{ width: 56, height: 56, background: "#f0faf5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: 24 }}>✓</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Thank you!</h2>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{saving ? "Saving your responses…" : "Your responses have been recorded. Thank you for participating!"}</p>
        </div>
      )}
    </div>
  );
}
