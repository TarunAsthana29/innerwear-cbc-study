import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Screener from "./components/Screener";
import Assumptions from "./components/Assumptions";
import Survey from "./components/Survey";
import Dashboard from "./components/Dashboard";

const MAX_RESPONSES = 150;
const RESEARCHER_PASSWORD = "innerwear2026";
const STORAGE_KEY = "cbc_submitted";
const DASH_AUTH_KEY = "cbc_dashboard_auth";

export default function App() {
  const [tab, setTab] = useState("survey");
  const [stage, setStage] = useState("screener");
  const [respondent, setRespondent] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [studyClosed, setStudyClosed] = useState(false);
  const [dashAuth, setDashAuth] = useState(false);
  const [dashPwd, setDashPwd] = useState("");
  const [dashErr, setDashErr] = useState("");

  useEffect(() => {
    if (window.location.search.includes("dashboard")) setTab("dashboard");
    if (localStorage.getItem(STORAGE_KEY)) setAlreadyDone(true);
    if (sessionStorage.getItem(DASH_AUTH_KEY) === "1") setDashAuth(true);
  }, []);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("responses")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setResponses(data);
        if (data.length >= MAX_RESPONSES) setStudyClosed(true);
      }
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("responses")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "responses" }, payload => {
        setResponses(prev => {
          const updated = [payload.new, ...prev];
          if (updated.length >= MAX_RESPONSES) setStudyClosed(true);
          return updated;
        });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function handleComplete(choices) {
    if (studyClosed) return;
    setSaving(true);
    const row = {
      respondent_id: respondent.id,
      age: +respondent.age,
      nccs: respondent.nccs,
      nccs_raw: respondent.nccs_raw,
      tier: respondent.tier,
      platform: respondent.platform,
      gender: respondent.gender,
      recency: respondent.recency,
      education: respondent.education,
      durables_count: respondent.durables_count,
      durables_list: respondent.durables_list,
      choices: JSON.stringify(choices),
      completed_at: new Date().toISOString()
    };
    await supabase.from("responses").insert([row]);
    localStorage.setItem(STORAGE_KEY, "1");

    const { data: countData } = await supabase.from("responses").select("id", { count: "exact", head: true });
    const total = countData?.length || 0;
    if (total % 10 === 0) fetch("/api/run-hb", { method: "POST" }).catch(() => {});

    setSaving(false);
    setStage("done");
  }

  async function handleClearData() {
    const pwd = window.prompt("Enter researcher password to delete all data:");
    if (pwd !== RESEARCHER_PASSWORD) { alert("Incorrect password."); return; }
    const confirm = window.confirm("This will permanently delete all " + responses.length + " responses. Are you sure?");
    if (!confirm) return;
    await supabase.from("responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setResponses([]);
    setStudyClosed(false);
    alert("All data cleared.");
  }

  function tryDashAuth(e) {
    e.preventDefault();
    if (dashPwd === RESEARCHER_PASSWORD) {
      setDashAuth(true);
      sessionStorage.setItem(DASH_AUTH_KEY, "1");
      setDashErr("");
    } else {
      setDashErr("Incorrect password. Try again.");
    }
  }

  function lockDash() {
    setDashAuth(false);
    sessionStorage.removeItem(DASH_AUTH_KEY);
    setDashPwd("");
  }

  const surveyContent = () => {
    if (studyClosed) return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Study closed</h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>We have reached our target of {MAX_RESPONSES} responses. Thank you for your interest!</p>
      </div>
    );
    if (alreadyDone) return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Already submitted</h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>You have already completed this study from this device. Thank you for participating!</p>
      </div>
    );
    if (stage === "screener") return <Screener onComplete={r => { setRespondent(r); setStage("assumptions"); }} />;
    if (stage === "assumptions") return <Assumptions onStart={() => setStage("survey")} onBack={() => setStage("screener")} />;
    if (stage === "survey") return <Survey onComplete={handleComplete} />;
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center", padding: "0 1rem" }}>
        <div style={{ width: 56, height: 56, background: "#f0faf5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: 24 }}>✓</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Thank you!</h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{saving ? "Saving your responses..." : "Your responses have been recorded. Thank you for participating!"}</p>
      </div>
    );
  };

  const dashLogin = () => (
    <div style={{ maxWidth: 380, margin: "4rem auto", padding: "0 1rem" }}>
      <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12, padding: "1.75rem 1.5rem" }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 6, textAlign: "center" }}>Researcher access</h2>
        <p style={{ fontSize: 13, color: "#666", textAlign: "center", marginBottom: "1.25rem", lineHeight: 1.5 }}>This dashboard contains live study data and is restricted to the research team.</p>
        <form onSubmit={tryDashAuth}>
          <input
            type="password"
            value={dashPwd}
            onChange={e => setDashPwd(e.target.value)}
            placeholder="Enter password"
            autoFocus
            style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10 }}
          />
          {dashErr && <div style={{ fontSize: 12, color: "#c0392b", marginBottom: 10 }}>{dashErr}</div>}
          <button type="submit"
            style={{ width: "100%", padding: "12px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Unlock dashboard →
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", minHeight: "100vh", background: "#fafafa" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ borderBottom: "1px solid #ebebeb", background: "#fff", padding: "0 1rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ padding: "14px 0", fontSize: 13, fontWeight: 700, color: "#111" }}>
            Innerwear CBC Study
            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 500, background: studyClosed ? "#fff3f3" : "#f0faf5", color: studyClosed ? "#c0392b" : "#0F6E56", padding: "2px 8px", borderRadius: 20 }}>
              {studyClosed ? "CLOSED" : "LIVE"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[{ id: "survey", label: "Survey" }, { id: "dashboard", label: dashAuth ? ("Dashboard" + (responses.length > 0 ? " (" + responses.length + ")" : "")) : "🔒 Dashboard" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "8px 14px", border: "none", background: tab === t.id ? "#111" : "transparent", color: tab === t.id ? "#fff" : "#888", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {t.label}
              </button>
            ))}
            {tab === "dashboard" && dashAuth && (
              <button onClick={lockDash} title="Lock dashboard"
                style={{ marginLeft: 6, padding: "6px 10px", border: "1px solid #e0e0e0", background: "transparent", color: "#666", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                Lock
              </button>
            )}
          </div>
        </div>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#aaa", fontSize: 13 }}>Loading...</div>
      ) : tab === "dashboard" ? (
        dashAuth ? (
          <Dashboard
            responses={responses.map(r => ({ ...r, choices: JSON.parse(r.choices) }))}
            onClearData={handleClearData}
            maxResponses={MAX_RESPONSES}
          />
        ) : dashLogin()
      ) : (
        surveyContent()
      )}
    </div>
  );
}
