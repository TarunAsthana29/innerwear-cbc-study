import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Screener from "./components/Screener";
import Survey from "./components/Survey";
import Dashboard from "./components/Dashboard";

const MAX_RESPONSES = 150;
const RESEARCHER_PASSWORD = "innerwear2026";
const STORAGE_KEY = "cbc_submitted";
const RESEARCHER_KEY = "cbc_researcher";

export default function App() {
  const [tab, setTab] = useState("survey");
  const [stage, setStage] = useState("screener");
  const [respondent, setRespondent] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [studyClosed, setStudyClosed] = useState(false);
  const [isResearcher, setIsResearcher] = useState(false);
  const [pwdInput, setPwdInput] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    if (window.location.search.includes("dashboard")) setTab("dashboard");
    if (localStorage.getItem(STORAGE_KEY)) setAlreadyDone(true);
    if (localStorage.getItem(RESEARCHER_KEY)) setIsResearcher(true);
  }, []);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("responses").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setResponses(data);
        if (data.length >= MAX_RESPONSES) setStudyClosed(true);
      }
      setLoading(false);
    }
    load();
    const channel = supabase.channel("responses")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "responses" }, payload => {
        setResponses(prev => {
          const updated = [payload.new, ...prev];
          if (updated.length >= MAX_RESPONSES) setStudyClosed(true);
          return updated;
        });
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  function handleResearcherLogin() {
    if (pwdInput === RESEARCHER_PASSWORD) {
      localStorage.setItem(RESEARCHER_KEY, "1");
      setIsResearcher(true);
      setPwdError("");
    } else {
      setPwdError("Incorrect password");
    }
  }

  function handleResearcherLogout() {
    localStorage.removeItem(RESEARCHER_KEY);
    setIsResearcher(false);
  }

  async function handleComplete(choices) {
    if (studyClosed) return;
    setSaving(true);
    const row = {
      respondent_id: respondent.id,
      age: +respondent.age,
      nccs: respondent.nccs,
      tier: respondent.tier,
      platform: respondent.platform,
      education: respondent.education,
      assets: JSON.stringify(respondent.assets || []),
      choices: JSON.stringify(choices),
      completed_at: new Date().toISOString()
    };
    await supabase.from("responses").insert([row]);
    localStorage.setItem(STORAGE_KEY, "1");

    // Fix: use count from metadata header
    const { count: total } = await supabase.from("responses").select("*", { count: "exact", head: true });
    if (total && total % 10 === 0) {
      fetch("/api/run-hb", { method: "POST" }).catch(() => {});
    }
    setSaving(false);
    setStage("done");
  }

  async function handleClearData() {
    const pwd = window.prompt("Enter researcher password to delete all data:");
    if (pwd !== RESEARCHER_PASSWORD) { alert("Incorrect password."); return; }
    const ok = window.confirm("Permanently delete all " + responses.length + " responses and analysis results? This cannot be undone.");
    if (!ok) return;
    const { error: e1 } = await supabase.from("responses").delete().gte("created_at", "2000-01-01");
    const { error: e2 } = await supabase.from("hb_results").delete().eq("id", "latest");
    if (e1) { alert("Delete failed: " + e1.message); console.error(e1); return; }
    if (e2) console.error("hb_results:", e2);
    localStorage.removeItem(STORAGE_KEY);
    setResponses([]);
    setStudyClosed(false);
    setStage("screener");
    setAlreadyDone(false);
    alert("All data cleared.");
  }

  // Researcher login gate for dashboard
  const researcherGate = (
    <div style={{ maxWidth: 360, margin: "4rem auto", padding: "2rem", background: "#fff", borderRadius: 12, border: "1px solid #e0e0e0" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>Researcher access</div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Enter password to view the dashboard</div>
      <input type="password" placeholder="Password" value={pwdInput}
        onChange={e => setPwdInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleResearcherLogin()}
        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 8 }} />
      {pwdError && <div style={{ fontSize: 12, color: "#c0392b", marginBottom: 8 }}>{pwdError}</div>}
      <button onClick={handleResearcherLogin}
        style={{ width: "100%", padding: "11px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        Access dashboard →
      </button>
    </div>
  );

  const surveyContent = () => {
    if (studyClosed) return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Study closed</h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>We have reached our target of {MAX_RESPONSES} responses. Thank you!</p>
      </div>
    );
    if (alreadyDone) return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Already submitted</h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>You have already completed this study from this device. Thank you!</p>
      </div>
    );
    if (stage === "screener") return <Screener onComplete={r => { setRespondent(r); setStage("survey"); }} />;
    if (stage === "survey") return <Survey onComplete={handleComplete} />;
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
        <div style={{ width: 56, height: 56, background: "#f0faf5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: 24 }}>✓</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Thank you!</h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{saving ? "Saving..." : "Your responses have been recorded."}</p>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", minHeight: "100vh", background: "#fafafa" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ borderBottom: "1px solid #ebebeb", background: "#fff", padding: "0 1rem" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ padding: "14px 0", fontSize: 13, fontWeight: 700, color: "#111" }}>
            Innerwear CBC Study
            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 500, background: studyClosed ? "#fff3f3" : "#f0faf5", color: studyClosed ? "#c0392b" : "#0F6E56", padding: "2px 8px", borderRadius: 20 }}>
              {studyClosed ? "CLOSED" : "LIVE"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[{ id: "survey", label: "Survey" }, { id: "dashboard", label: "Dashboard" + (responses.length > 0 ? " (" + responses.length + ")" : "") }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "8px 14px", border: "none", background: tab === t.id ? "#111" : "transparent", color: tab === t.id ? "#fff" : "#888", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {t.label}
              </button>
            ))}
            {isResearcher && (
              <button onClick={handleResearcherLogout}
                style={{ padding: "8px 12px", border: "1px solid #e0e0e0", background: "transparent", color: "#888", borderRadius: 7, fontSize: 11, cursor: "pointer" }}>
                🔒 Lock
              </button>
            )}
          </div>
        </div>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#aaa", fontSize: 13 }}>Loading...</div>
      ) : tab === "dashboard" ? (
        isResearcher
          ? <Dashboard
              responses={responses.map(r => ({ ...r, choices: JSON.parse(r.choices) }))}
              onClearData={handleClearData}
              maxResponses={MAX_RESPONSES}
            />
          : researcherGate
      ) : (
        surveyContent()
      )}
    </div>
  );
}
