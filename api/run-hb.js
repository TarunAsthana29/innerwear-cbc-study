// api/run-hb.js — Pooled MNL via MCMC (NOT true HB)
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

const TASKS = [
  [{b:"Jockey",p:450,k:"3 pcs",r:"4.5★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:600,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:300,k:"3 pcs",r:"3.9★",f:"Modal",u:"Highly Stretchable"}],
  [{b:"XYXX",p:800,k:"3 pcs",r:"4.2★",f:"Blended Cotton",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:600,k:"3 pcs",r:"4.2★",f:"Modal",u:"Highly Stretchable"},{b:"Jockey",p:300,k:"3 pcs",r:"4.5★",f:"100% Cotton",u:"Highly Stretchable"}],
  [{b:"XYXX",p:300,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Ultra Breathable"},{b:"Jockey",p:800,k:"3 pcs",r:"4.2★",f:"100% Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"4.2★",f:"100% Cotton",u:"Sweat Absorbent"}],
  [{b:"XYXX",p:300,k:"3 pcs",r:"4.2★",f:"Modal",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:600,k:"3 pcs",r:"4.2★",f:"Modal",u:"Ultra Breathable"},{b:"Jockey",p:800,k:"3 pcs",r:"4.5★",f:"Modal",u:"Sweat Absorbent"}],
  [{b:"Jockey",p:800,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Ultra Breathable"},{b:"Dixcy Scott Alpha",p:600,k:"3 pcs",r:"4.5★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:450,k:"3 pcs",r:"4.2★",f:"100% Cotton",u:"Highly Stretchable"}],
  [{b:"Jockey",p:600,k:"3 pcs",r:"4.5★",f:"Modal",u:"Sweat Absorbent"},{b:"XYXX",p:300,k:"3 pcs",r:"4.5★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"3.9★",f:"100% Cotton",u:"Ultra Breathable"}],
  [{b:"Dixcy Scott Alpha",p:300,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Jockey",p:450,k:"3 pcs",r:"4.5★",f:"Modal",u:"Highly Stretchable"},{b:"XYXX",p:800,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"}],
  [{b:"XYXX",p:600,k:"3 pcs",r:"3.9★",f:"100% Cotton",u:"Highly Stretchable"},{b:"Jockey",p:300,k:"3 pcs",r:"3.9★",f:"Blended Cotton",u:"Sweat Absorbent"},{b:"Dixcy Scott Alpha",p:800,k:"3 pcs",r:"4.2★",f:"100% Cotton",u:"Sweat Absorbent"}],
  [{b:"Jockey",p:600,k:"3 pcs",r:"3.9★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:300,k:"3 pcs",r:"4.2★",f:"Blended Cotton",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:800,k:"3 pcs",r:"3.9★",f:"Modal",u:"Ultra Breathable"}],
  [{b:"XYXX",p:300,k:"3 pcs",r:"4.5★",f:"100% Cotton",u:"Highly Stretchable"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"4.2★",f:"100% Cotton",u:"Highly Stretchable"},{b:"Jockey",p:800,k:"3 pcs",r:"3.9★",f:"Modal",u:"Sweat Absorbent"}],
  [{b:"Jockey",p:600,k:"3 pcs",r:"4.2★",f:"Blended Cotton",u:"Ultra Breathable"},{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"3.9★",f:"Modal",u:"Sweat Absorbent"},{b:"XYXX",p:800,k:"3 pcs",r:"4.5★",f:"Blended Cotton",u:"Sweat Absorbent"}],
  [{b:"Dixcy Scott Alpha",p:450,k:"3 pcs",r:"3.9★",f:"Modal",u:"Ultra Breathable"},{b:"Jockey",p:800,k:"3 pcs",r:"4.5★",f:"100% Cotton",u:"Ultra Breathable"},{b:"XYXX",p:600,k:"3 pcs",r:"4.5★",f:"Modal",u:"Highly Stretchable"}],
];

const BRANDS=["XYXX","Dixcy Scott Alpha","Jockey"];
const USPS=["Sweat Absorbent","Ultra Breathable","Highly Stretchable"];
const FABRICS=["100% Cotton","Blended Cotton","Modal"];
const RATINGS=["3.9★","4.2★","4.5★"];
const NCCS_LIST=["NCCS A1","NCCS A2","NCCS A3","NCCS B1"];
const PRICE_MIN=300, PRICE_RANGE=500;

function encode(opt){
  const v=new Array(9).fill(0);
  const bi=BRANDS.indexOf(opt.b); if(bi>0)v[bi-1]=1;
  v[2]=(opt.p-PRICE_MIN)/PRICE_RANGE;
  const ri=RATINGS.indexOf(opt.r); if(ri>0)v[2+ri]=1;
  const fi=FABRICS.indexOf(opt.f); if(fi>0)v[4+fi]=1;
  const ui=USPS.indexOf(opt.u); if(ui>0)v[6+ui]=1;
  return v;
}

function logLik(beta,obs){
  let ll=0;
  for(const{vecs,chosen}of obs){
    const utils=vecs.map(v=>v.reduce((s,x,i)=>s+x*beta[i],0));
    const maxU=Math.max(...utils);
    const exps=utils.map(u=>Math.exp(u-maxU));
    ll+=Math.log(exps[chosen]/exps.reduce((a,b)=>a+b,0));
  }
  return ll;
}

function runMCMC(responses,iterations=2000,burnin=500){
  const obs=[];
  responses.forEach(r=>{
    const choices=typeof r.choices==="string"?JSON.parse(r.choices):r.choices;
    choices.forEach((c,ti)=>{if(c===null||c==="none"||ti>=12)return;obs.push({vecs:TASKS[ti].map(encode),chosen:c});});
  });
  if(obs.length<6)return null;

  let beta=new Array(9).fill(0),curLL=logLik(beta,obs);
  const samples=[];
  for(let i=0;i<iterations;i++){
    const prop=beta.map(b=>b+(Math.random()-0.5)*0.3);
    const propLL=logLik(prop,obs);
    if(Math.log(Math.random())<propLL-curLL){beta=prop;curLL=propLL;}
    if(i>=burnin)samples.push([...beta]);
  }
  const mean=new Array(9).fill(0);
  samples.forEach(s=>s.forEach((v,i)=>mean[i]+=v));
  const p=mean.map(v=>v/samples.length);
  const pc=p[2];
  const wtp=u=>(!pc||pc>=0)?0:Math.round((u/Math.abs(pc))*PRICE_RANGE);

  const bU={"XYXX":0,"Dixcy Scott Alpha":p[0],"Jockey":p[1]};
  const rU={"3.9★":0,"4.2★":p[3],"4.5★":p[4]};
  const fU={"100% Cotton":0,"Blended Cotton":p[5],"Modal":p[6]};
  const uU={"Sweat Absorbent":0,"Ultra Breathable":p[7],"Highly Stretchable":p[8]};

  const rng=o=>Math.max(...Object.values(o))-Math.min(...Object.values(o));
  const tot=rng(bU)+rng(rU)+rng(fU)+rng(uU)+Math.abs(pc)*0.5||1;

  return{
    method:"Pooled MNL via MCMC",
    brandUtils:bU,ratingUtils:rU,fabricUtils:fU,uspUtils:uU,priceCoef:pc,
    brandWTP:Object.fromEntries(Object.entries(bU).map(([k,v])=>[k,wtp(v)])),
    ratingWTP:Object.fromEntries(Object.entries(rU).map(([k,v])=>[k,wtp(v)])),
    fabricWTP:Object.fromEntries(Object.entries(fU).map(([k,v])=>[k,wtp(v)])),
    uspWTP:Object.fromEntries(Object.entries(uU).map(([k,v])=>[k,wtp(v)])),
    importance:{
      Brand:Math.round(rng(bU)/tot*100),Rating:Math.round(rng(rU)/tot*100),
      Fabric:Math.round(rng(fU)/tot*100),USP:Math.round(rng(uU)/tot*100),
      Price:Math.round(Math.abs(pc)*0.5/tot*100)
    },
    nRespondents:responses.length,nChoices:obs.length
  };
}

module.exports=async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  try{
    const{data:responses,error}=await supabase.from("responses").select("*");
    if(error)throw error;
    const n=responses.length;
    if(n%10!==0&&!req.query.force)return res.status(200).json({skipped:true,n});
    if(n<10)return res.status(200).json({skipped:true,message:"Need 10+"});
    const results={overall:runMCMC(responses)};
    for(const nc of NCCS_LIST){
      const seg=responses.filter(r=>r.nccs===nc);
      results[nc]=seg.length>=8?runMCMC(seg):null;
    }
    const{error:e}=await supabase.from("hb_results").upsert([{id:"latest",n_responses:n,results:JSON.stringify(results),computed_at:new Date().toISOString()}]);
    if(e)throw e;
    return res.status(200).json({success:true,n});
  }catch(err){
    console.error(err);
    return res.status(500).json({error:err.message});
  }
};
