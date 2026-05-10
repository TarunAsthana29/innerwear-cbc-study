import { useState, useMemo } from "react";
import { TASKS, BRANDS, USPS, FABRICS, BRAND_COLORS } from "../data";

const N_TASKS = 12;
const RATINGS_LIST = ["3.9★","4.2★","4.5★"];
const PRICE_MIN = 300, PRICE_RANGE = 500;

// Pooled MNL via gradient descent — NOT true HB
function estimateMNL(responses) {
  // Parameters: brand(2) + price(1) + rating(2) + fabric(2) + usp(2) = 9
  function encode(opt) {
    const v = new Array(9).fill(0);
    const bi = BRANDS.indexOf(opt.b); if (bi > 0) v[bi-1] = 1;
    v[2] = (opt.p - PRICE_MIN) / PRICE_RANGE;
    const ri = RATINGS_LIST.indexOf(opt.r); if (ri > 0) v[2+ri] = 1;
    const fi = FABRICS.indexOf(opt.f); if (fi > 0) v[4+fi] = 1;
    const ui = USPS.indexOf(opt.u); if (ui > 0) v[6+ui] = 1;
    return v;
  }

  const obs = [];
  responses.forEach(r => {
    r.choices.forEach((choice, ti) => {
      if (choice === null || choice === "none" || ti >= N_TASKS) return;
      obs.push({ vecs: TASKS[ti].map(encode), chosen: choice });
    });
  });
  if (obs.length < 10) return null;

  let beta = new Array(9).fill(0);
  for (let e = 0; e < 400; e++) {
    const grad = new Array(9).fill(0);
    obs.forEach(({ vecs, chosen }) => {
      const utils = vecs.map(v => v.reduce((s,x,i)=>s+x*beta[i],0));
      const maxU = Math.max(...utils);
      const exps = utils.map(u=>Math.exp(u-maxU));
      const sumE = exps.reduce((a,b)=>a+b,0);
      const probs = exps.map(e=>e/sumE);
      vecs.forEach((v,j) => v.forEach((xi,i) => { grad[i] += ((j===chosen?1:0)-probs[j])*xi; }));
    });
    beta = beta.map((b,i)=>b+0.05*grad[i]/obs.length);
  }

  const priceCoef = beta[2];
  const wtp = u => (!priceCoef||priceCoef>=0) ? null : Math.round((u/Math.abs(priceCoef))*PRICE_RANGE);

  const brandUtils = {"XYXX":0,"Dixcy Scott Alpha":beta[0],"Jockey":beta[1]};
  const ratingUtils = {"3.9★":0,"4.2★":beta[3],"4.5★":beta[4]};
  const fabricUtils = {"100% Cotton":0,"Blended Cotton":beta[5],"Modal":beta[6]};
  const uspUtils = {"Sweat Absorbent":0,"Ultra Breathable":beta[7],"Highly Stretchable":beta[8]};

  const ranges = [brandUtils,ratingUtils,fabricUtils,uspUtils].map(u=>Math.max(...Object.values(u))-Math.min(...Object.values(u)));
  const priceImp = Math.abs(priceCoef)*0.5;
  const total = ranges.reduce((a,b)=>a+b,0)+priceImp||1;

  return {
    brandUtils, ratingUtils, fabricUtils, uspUtils, priceCoef, wtp,
    importance:{
      Brand:Math.round(ranges[0]/total*100),
      Rating:Math.round(ranges[1]/total*100),
      Fabric:Math.round(ranges[2]/total*100),
      USP:Math.round(ranges[3]/total*100),
      Price:Math.round(priceImp/total*100)
    },
    nObs:obs.length
  };
}

function simShare(scenarios, model) {
  if (!model) return scenarios.map(()=>0);
  const utils = scenarios.map(s =>
    (model.brandUtils[s.brand]||0)+(model.uspUtils[s.usp]||0)+
    (model.fabricUtils[s.fabric]||0)+
    model.priceCoef*((s.price-PRICE_MIN)/PRICE_RANGE)+(model.ratingUtils[s.rating]||0)
  );
  const maxU = Math.max(...utils);
  const exps = utils.map(u=>Math.exp(u-maxU));
  const sum = exps.reduce((a,b)=>a+b,0);
  return exps.map(e=>Math.round(e/sum*100));
}

const DEFAULT_SCENARIOS = [
  {brand:"Jockey",          price:600, rating:"4.5★", fabric:"100% Cotton",  usp:"Sweat Absorbent"},
  {brand:"XYXX",            price:450, rating:"4.2★", fabric:"Blended Cotton",usp:"Ultra Breathable"},
  {brand:"Dixcy Scott Alpha",price:300, rating:"4.2★", fabric:"Modal",         usp:"Highly Stretchable"},
];

function Section({title,children}){
  return(
    <div style={{background:"#fff",border:"1px solid #f0f0f0",borderRadius:10,padding:"1rem",marginBottom:"1rem"}}>
      <div style={{fontSize:12,fontWeight:700,color:"#111",marginBottom:12,textTransform:"uppercase",letterSpacing:0.5}}>{title}</div>
      {children}
    </div>
  );
}

function UtilBar({label,wtp,pct,color}){
  return(
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:12,color:"#444",fontWeight:500}}>{label}</span>
        <span style={{fontSize:11,fontWeight:600,color:wtp===null?"#888":wtp>=0?"#0F6E56":"#c0392b"}}>
          {wtp===null?"ref":(wtp>=0?"+":"")+"₹"+Math.abs(wtp)}
        </span>
      </div>
      <div style={{height:5,background:"#f0f0f0",borderRadius:3}}>
        <div style={{height:5,width:pct+"%",background:color||"#111",borderRadius:3}}/>
      </div>
    </div>
  );
}

export default function Analysis({ responses }) {
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const model = useMemo(()=>responses.length>=5?estimateMNL(responses):null,[responses]);
  const shares = useMemo(()=>simShare(scenarios,model),[scenarios,model]);

  function updateScenario(i,key,val){
    setScenarios(prev=>prev.map((s,idx)=>idx===i?{...s,[key]:key==="price"?+val:val}:s));
  }

  function span(utils){ return Math.max(...Object.values(utils))-Math.min(...Object.values(utils))||1; }
  function pct(u,utils){ return Math.round(((u-Math.min(...Object.values(utils)))/span(utils))*100); }

  if (responses.length<5) return(
    <div style={{textAlign:"center",padding:"3rem 1rem",color:"#aaa"}}>
      <div style={{fontSize:32,marginBottom:12}}>⚗️</div>
      <div style={{fontSize:14}}>Need at least 5 responses. Currently {responses.length}.</div>
    </div>
  );
  if (!model) return <div style={{textAlign:"center",padding:"3rem",color:"#aaa"}}>Running...</div>;

  return(
    <div style={{padding:"1.5rem 1rem",maxWidth:680,margin:"0 auto"}}>
      <div style={{background:"#fff8e1",border:"1px solid #ffe082",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#7a5800",marginBottom:"1rem"}}>
        ⚠️ <strong>Pooled MNL (not true HB)</strong> — All respondents aggregated. Directional only.
      </div>

      <Section title="Attribute importance (%)">
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {Object.entries(model.importance).map(([k,v])=>(
            <div key={k} style={{textAlign:"center",background:"#f8f8f8",borderRadius:8,padding:"12px 6px"}}>
              <div style={{fontSize:20,fontWeight:700,color:"#111"}}>{v}%</div>
              <div style={{fontSize:10,color:"#888",marginTop:2}}>{k}</div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
        <Section title="Brand WTP vs XYXX">
          {BRANDS.map(b=>(<UtilBar key={b} label={b} wtp={model.wtp(model.brandUtils[b])} pct={pct(model.brandUtils[b],model.brandUtils)} color={BRAND_COLORS[b]}/>))}
        </Section>
        <Section title="Rating WTP vs 3.9★">
          {RATINGS_LIST.map((r,i)=>(<UtilBar key={r} label={r} wtp={model.wtp(model.ratingUtils[r])} pct={pct(model.ratingUtils[r],model.ratingUtils)} color={["#888","#BA7517","#185FA5"][i]}/>))}
        </Section>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
        <Section title="Fabric WTP vs 100% Cotton">
          {FABRICS.map((f,i)=>(<UtilBar key={f} label={f} wtp={model.wtp(model.fabricUtils[f])} pct={pct(model.fabricUtils[f],model.fabricUtils)} color={["#888","#1D9E75","#534AB7"][i]}/>))}
        </Section>
        <Section title="USP WTP vs Sweat Absorbent">
          {USPS.map((u,i)=>(<UtilBar key={u} label={u} wtp={model.wtp(model.uspUtils[u])} pct={pct(model.uspUtils[u],model.uspUtils)} color={["#888","#185FA5","#D85A30"][i]}/>))}
        </Section>
      </div>

      <Section title="Preference share simulator (Pooled MNL)">
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{borderBottom:"1px solid #f0f0f0"}}>
                {["Brand","Price","Rating","Fabric","USP","Share"].map(h=>(
                  <th key={h} style={{padding:"6px 8px",textAlign:"left",color:"#888",fontWeight:600,fontSize:11}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s,i)=>(
                <tr key={i} style={{borderBottom:"0.5px solid #f8f8f8"}}>
                  <td style={{padding:"6px 4px"}}>
                    <select value={s.brand} onChange={e=>updateScenario(i,"brand",e.target.value)} style={{fontSize:11,border:"1px solid #e0e0e0",borderRadius:4,padding:"3px",background:"#fff"}}>
                      {BRANDS.map(b=><option key={b}>{b}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"6px 4px"}}>
                    <select value={s.price} onChange={e=>updateScenario(i,"price",e.target.value)} style={{fontSize:11,border:"1px solid #e0e0e0",borderRadius:4,padding:"3px",background:"#fff"}}>
                      {[300,450,600,800].map(p=><option key={p} value={p}>₹{p}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"6px 4px"}}>
                    <select value={s.rating} onChange={e=>updateScenario(i,"rating",e.target.value)} style={{fontSize:11,border:"1px solid #e0e0e0",borderRadius:4,padding:"3px",background:"#fff"}}>
                      {RATINGS_LIST.map(r=><option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"6px 4px"}}>
                    <select value={s.fabric} onChange={e=>updateScenario(i,"fabric",e.target.value)} style={{fontSize:11,border:"1px solid #e0e0e0",borderRadius:4,padding:"3px",background:"#fff"}}>
                      {FABRICS.map(f=><option key={f}>{f}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"6px 4px"}}>
                    <select value={s.usp} onChange={e=>updateScenario(i,"usp",e.target.value)} style={{fontSize:11,border:"1px solid #e0e0e0",borderRadius:4,padding:"3px",background:"#fff"}}>
                      {USPS.map(u=><option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"6px 8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{flex:1,height:6,background:"#f0f0f0",borderRadius:3}}>
                        <div style={{height:6,width:shares[i]+"%",background:BRAND_COLORS[s.brand]||"#111",borderRadius:3,transition:"width 0.4s"}}/>
                      </div>
                      <span style={{fontWeight:700,color:"#111",minWidth:32,fontSize:13}}>{shares[i]}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{fontSize:11,color:"#aaa",marginTop:10}}>Edit any dropdown to update shares instantly</div>
      </Section>
    </div>
  );
}
