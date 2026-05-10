import { useState } from "react";
import { EDUCATION_OPTIONS, ASSET_OPTIONS, mapToNCCS, CITY_TIERS, PLATFORMS } from "../data";

const inp = { width:"100%", padding:"10px 14px", border:"1.5px solid #e0e0e0", borderRadius:8, fontSize:14, background:"#fff", outline:"none", fontFamily:"inherit" };
const lbl = { display:"block", fontSize:12, fontWeight:600, color:"#444", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 };

export default function Screener({ onComplete }) {
  const [step, setStep] = useState(1); // 1=hard screeners, 2=NCCS, 3=profile
  const [form, setForm] = useState({
    age:"", gender:"", boughtOnline:"",       // hard screeners
    education:"", assets:[],                   // NCCS
    tier:"", platform:""                       // profile
  });
  const [err, setErr] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  function toggleAsset(asset) {
    set("assets", form.assets.includes(asset)
      ? form.assets.filter(a=>a!==asset)
      : [...form.assets, asset]
    );
  }

  function submitStep1() {
    if (!form.age || !form.gender || !form.boughtOnline) { setErr("Please answer all questions"); return; }
    if (+form.age < 18 || +form.age > 55) { setErr("You must be between 18–55 years old to participate"); return; }
    if (form.gender !== "Male") { setErr("This study is for male shoppers only. Thank you for your interest."); return; }
    if (form.boughtOnline !== "Yes") { setErr("This study is for people who have bought innerwear online in the last 6 months."); return; }
    setErr(""); setStep(2);
  }

  function submitStep2() {
    if (!form.education) { setErr("Please select an education level"); return; }
    setErr(""); setStep(3);
  }

  function submitStep3() {
    if (!form.tier || !form.platform) { setErr("Please complete all fields"); return; }
    const tierShort = form.tier.startsWith("Tier 1") ? "Tier 1" : form.tier.startsWith("Tier 2") ? "Tier 2" : "Tier 3";
    const educationIdx = EDUCATION_OPTIONS.indexOf(form.education);
    const assetCount = form.assets.length;
    const nccs = mapToNCCS(educationIdx, assetCount);
    const id = "resp_" + Math.random().toString(36).slice(2,10);
    onComplete({ ...form, nccs, tier: tierShort, id, ts: Date.now() });
  }

  const progress = (step/3)*100;

  return (
    <div style={{maxWidth:480, margin:"0 auto", padding:"2rem 1rem"}}>
      <div style={{marginBottom:"1.5rem"}}>
        <div style={{fontSize:11, letterSpacing:2, color:"#888", textTransform:"uppercase", marginBottom:8}}>Innerwear India Study</div>
        <div style={{height:4, background:"#f0f0f0", borderRadius:2, marginBottom:12}}>
          <div style={{height:4, width:`${progress}%`, background:"#111", borderRadius:2, transition:"width 0.3s"}}/>
        </div>
        <div style={{fontSize:11, color:"#aaa"}}>Step {step} of 3</div>
      </div>

      {/* ── STEP 1: Hard screeners ── */}
      {step === 1 && <>
        <h1 style={{fontSize:20, fontWeight:700, color:"#111", marginBottom:6}}>Quick eligibility check</h1>
        <p style={{fontSize:13, color:"#666", lineHeight:1.6, marginBottom:"1.5rem"}}>3 questions — takes 30 seconds.</p>

        <div style={{marginBottom:16}}>
          <label style={lbl}>Your age</label>
          <input type="number" placeholder="e.g. 28" value={form.age} onChange={e=>set("age",e.target.value)} style={inp}/>
        </div>

        <div style={{marginBottom:16}}>
          <label style={lbl}>Gender</label>
          <select value={form.gender} onChange={e=>set("gender",e.target.value)} style={inp}>
            <option value="">Select…</option>
            {["Male","Female","Prefer not to say"].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>

        <div style={{marginBottom:16}}>
          <label style={lbl}>Have you bought innerwear online (Amazon, Flipkart, Myntra etc.) in the last 6 months?</label>
          <select value={form.boughtOnline} onChange={e=>set("boughtOnline",e.target.value)} style={inp}>
            <option value="">Select…</option>
            {["Yes","No"].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>

        {err && <div style={{fontSize:12, color:"#c0392b", marginBottom:12, padding:"8px 12px", background:"#fff5f5", borderRadius:6}}>{err}</div>}
        <button onClick={submitStep1} style={{width:"100%", padding:"13px", background:"#111", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer"}}>
          Continue →
        </button>
      </>}

      {/* ── STEP 2: NCCS screener ── */}
      {step === 2 && <>
        <h1 style={{fontSize:20, fontWeight:700, color:"#111", marginBottom:6}}>About your household</h1>
        <p style={{fontSize:13, color:"#666", lineHeight:1.6, marginBottom:"1.5rem"}}>These questions help us understand preferences across different shopper groups. Your answers are confidential.</p>

        <div style={{marginBottom:20}}>
          <label style={lbl}>Highest education level of the chief wage earner in your household</label>
          <div style={{fontSize:11, color:"#aaa", marginBottom:8}}>Chief wage earner = the person who earns the most in the household</div>
          <select value={form.education} onChange={e=>set("education",e.target.value)} style={inp}>
            <option value="">Select…</option>
            {EDUCATION_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div style={{marginBottom:20}}>
          <label style={lbl}>Which of these does your household currently own? <span style={{fontWeight:400, textTransform:"none", letterSpacing:0}}>(Select all that apply)</span></label>
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            {ASSET_OPTIONS.map(asset=>{
              const checked = form.assets.includes(asset);
              return (
                <div key={asset} onClick={()=>toggleAsset(asset)}
                  style={{display:"flex", alignItems:"center", gap:10, padding:"10px 14px", border:`1.5px solid ${checked?"#111":"#e0e0e0"}`, borderRadius:8, cursor:"pointer", background:checked?"#f8f8f8":"#fff"}}>
                  <div style={{width:18, height:18, border:`2px solid ${checked?"#111":"#ccc"}`, borderRadius:4, background:checked?"#111":"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                    {checked && <span style={{color:"#fff", fontSize:11, lineHeight:1}}>✓</span>}
                  </div>
                  <span style={{fontSize:13, color:"#333"}}>{asset}</span>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:11, color:"#aaa", marginTop:8}}>Select none if your household doesn't own any of these</div>
        </div>

        {err && <div style={{fontSize:12, color:"#c0392b", marginBottom:12, padding:"8px 12px", background:"#fff5f5", borderRadius:6}}>{err}</div>}
        <div style={{display:"flex", gap:8}}>
          <button onClick={()=>setStep(1)} style={{padding:"13px 20px", background:"transparent", color:"#666", border:"1.5px solid #e0e0e0", borderRadius:8, fontSize:14, cursor:"pointer"}}>← Back</button>
          <button onClick={submitStep2} style={{flex:1, padding:"13px", background:"#111", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer"}}>Continue →</button>
        </div>
      </>}

      {/* ── STEP 3: Profile ── */}
      {step === 3 && <>
        <h1 style={{fontSize:20, fontWeight:700, color:"#111", marginBottom:6}}>Almost there</h1>
        <p style={{fontSize:13, color:"#666", lineHeight:1.6, marginBottom:"1.5rem"}}>Two last questions about your shopping context.</p>

        {[
          {label:"City tier you live in", key:"tier", options:CITY_TIERS},
          {label:"Platform you primarily buy innerwear on", key:"platform", options:PLATFORMS},
        ].map(f=>(
          <div key={f.key} style={{marginBottom:16}}>
            <label style={lbl}>{f.label}</label>
            <select value={form[f.key]} onChange={e=>set(f.key,e.target.value)} style={inp}>
              <option value="">Select…</option>
              {f.options.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div style={{marginTop:16, padding:"12px 14px", background:"#f8f8f8", borderRadius:8, fontSize:12, color:"#888", lineHeight:1.6, marginBottom:16}}>
          All options shown have: <strong style={{color:"#555"}}>10,000+ verified reviews</strong> · <strong style={{color:"#555"}}>Same waistband &amp; durability</strong> · <strong style={{color:"#555"}}>Pack of 3 · 2–3 day delivery</strong>
        </div>

        {err && <div style={{fontSize:12, color:"#c0392b", marginBottom:12, padding:"8px 12px", background:"#fff5f5", borderRadius:6}}>{err}</div>}
        <div style={{display:"flex", gap:8}}>
          <button onClick={()=>setStep(2)} style={{padding:"13px 20px", background:"transparent", color:"#666", border:"1.5px solid #e0e0e0", borderRadius:8, fontSize:14, cursor:"pointer"}}>← Back</button>
          <button onClick={submitStep3} style={{flex:1, padding:"13px", background:"#111", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer"}}>Start the study →</button>
        </div>
      </>}
    </div>
  );
}
