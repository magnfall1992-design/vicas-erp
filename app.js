/* ERP VICAS — version alpha. JavaScript sans dépendance.
   Stockage : base partagée (capacité db de l'artifact claude.ai) si disponible, sinon démo locale (navigateur). */
(function(){
"use strict";
const COLLS=["config","projets","offres","engins","comptes","mouvements","factures","requetes","interventions"];
const LS_DATA="vicas-erp-alpha-data", LS_ROLE="vicas-erp-alpha-role", LS_THEME="vicas-erp-theme";
const M=1e6;

/* ---------- utilitaires ---------- */
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const todayISO=()=>{const x=new Date();x.setMinutes(x.getMinutes()-x.getTimezoneOffset());return x.toISOString().slice(0,10)};
const addDays=(iso,n)=>{const x=new Date(iso+"T12:00:00");x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const daysBetween=(a,b)=>Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const nf=new Intl.NumberFormat("fr-FR");
const fmt=n=>nf.format(Math.round(n||0));
const fcfa=n=>fmt(n)+" FCFA";
function fm(n){ // montant compact
  const a=Math.abs(n||0), s=n<0?"−":"";
  if(a>=1e9) return s+(a/1e9).toLocaleString("fr-FR",{maximumFractionDigits:2})+" Md";
  if(a>=1e6) return s+(a/1e6).toLocaleString("fr-FR",{maximumFractionDigits:a>=1e8?0:1})+" M";
  if(a>=1e3) return s+(a/1e3).toLocaleString("fr-FR",{maximumFractionDigits:0})+" k";
  return s+fmt(a);
}
const pct=v=>(Math.round(v*10)/10).toLocaleString("fr-FR")+" %";
const dfr=iso=>{if(!iso)return"—";const [y,m,d]=iso.slice(0,10).split("-");return d+"/"+m+"/"+y};
const dshort=iso=>{if(!iso)return"—";const x=new Date(iso.slice(0,10)+"T12:00:00");return x.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})};
const icon=n=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||""}</svg>`;
const ICONS={
  cockpit:'<path d="M3 13a9 9 0 1 1 18 0"/><path d="M12 13l4-4"/><circle cx="12" cy="13" r="1.4"/><path d="M5 19h14"/>',
  projets:'<path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/>',
  commercial:'<path d="M4 4h16v12H5.5L4 18z"/><path d="M8 9h8M8 12h5"/>',
  instances:'<path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2"/>',
  factures:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  tresorerie:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="14.5" r="1.3"/>',
  flotte:'<path d="M2 16V7h11v9"/><path d="M13 10h4l3 3v3h-7"/><circle cx="6" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  vidange:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  parametres:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  back:'<path d="M15 18l-6-6 6-6"/>'
};

/* ---------- rôles et organisation ---------- */
const ROLES={
  DG:{lib:"Président / Directeur Général",nom:"Ibra Sow"},
  DAF:{lib:"Directeur administratif et financier (RAF)",nom:"A. Ndiaye"},
  DT:{lib:"Directeur technique / Exploitation",nom:"M. Diop"},
  CP:{lib:"Chef de projet",nom:"S. Gueye"},
  PARC:{lib:"Chef de parc",nom:"O. Sarr"},
  ACH:{lib:"Service Achats",nom:"N. Diagne"},
  COM:{lib:"Commercial",nom:"F. Ba"},
  RH:{lib:"Ressources humaines",nom:"K. Faye"},
  AGENT:{lib:"Agent (demandeur)",nom:"L. Mendy"}
};
const SERVICES={Direction:"DG",Exploitation:"DT",Chantiers:"CP",Parc:"PARC",Achats:"ACH",Commercial:"COM",RH:"RH",Finances:"DAF"};
const REQ_TYPES=["Fournitures","Achat / prestation","Paiement fournisseur","Avance sur salaire","Mission / véhicule","Carburant","Congé","Avenant projet"];

/* ---------- état ---------- */
const S={mode:"loading",data:{},role:ls.get(LS_ROLE)||"DG",db:null,user:null,uidMe:null,canWrite:true,emptyDb:false,route:"cockpit",param:null,filters:{}};
COLLS.forEach(c=>S.data[c]={});
const list=c=>Object.values(S.data[c]||{});
const get=(c,id)=>(S.data[c]||{})[id];
const cfg=()=>get("config","main")||{seuils:{S0:25000,S1:250000,S2:1000000,S3:5000000,SF:2000000},seuilTresorerie:150*M,slaHeures:48};
const me=()=>ROLES[S.role];
const actor=()=>me().nom+" ("+S.role+")";

/* ---------- stockage ---------- */
const Store={
  async put(c,doc){
    doc=JSON.parse(JSON.stringify(doc));
    S.data[c][doc.id]=doc; render();
    if(S.mode==="db"){
      try{await S.db.collection(c).doc(doc.id).set(doc)}
      catch(e){toast(e&&e.code==="quota_exceeded"?"La base est pleine : supprimez des éléments anciens.":"Enregistrement refusé ("+(e&&e.code||"erreur")+"). Vos droits sur cet espace sont peut-être en lecture seule.");}
    } else saveLocal();
  },
  async del(c,id){
    delete S.data[c][id]; render();
    if(S.mode==="db"){try{await S.db.collection(c).doc(id).delete()}catch(e){toast("Suppression refusée.")}}
    else saveLocal();
  }
};
function saveLocal(){ls.set(LS_DATA,JSON.stringify(S.data))}
function loadDemoInto(target){
  const demo=vicasDemo(todayISO());
  COLLS.forEach(c=>{target[c]={};(demo[c]||[]).forEach(d=>target[c][d.id]=d)});
}
async function boot(){
  render();
  let db=null,user=null;
  if(window.claude&&typeof window.claude.use==="function"){
    try{[db,user]=await Promise.all([window.claude.use("db"),window.claude.use("user")])}catch(e){db=null}
  }
  if(db){
    S.db=db;S.user=user;S.mode="db";
    try{S.uidMe=user?await user.id():null;const cw=user?await user.can("data.write"):null;S.canWrite=cw!==false}catch(e){}
    let pending=new Set(COLLS);
    COLLS.forEach(c=>{
      db.collection(c).onSnapshot(snap=>{
        const m={};snap.docs.forEach(d=>{m[d.id]=d.data()});S.data[c]=m;
        if(!snap.metadata.fromCache) pending.delete(c);
        if(pending.size===0) S.emptyDb=Object.keys(S.data.config).length===0;
        render();
      },err=>{toast("Connexion à la base interrompue ("+err.code+"). Rechargez la page.")});
    });
  } else {
    S.mode="local";
    const raw=ls.get(LS_DATA);
    let ok=false;
    if(raw){try{const d=JSON.parse(raw);if(d&&d.config&&d.config.main){COLLS.forEach(c=>S.data[c]=d[c]||{});ok=true}}catch(e){}}
    if(!ok){loadDemoInto(S.data);saveLocal()}
    render();
  }
}
async function seedDb(){
  if(S.mode!=="db")return;
  const demo=vicasDemo(todayISO());
  toast("Chargement des données de démonstration…");
  for(const c of COLLS){for(const d of demo[c]||[]){try{await S.db.collection(c).doc(d.id).set(d)}catch(e){toast("Écriture refusée : seuls les contributeurs peuvent initialiser la base.");return}}}
  toast("Données de démonstration chargées.");
}

/* ---------- moteur de validation gradué ---------- */
function niveau(r){
  const s=cfg().seuils;
  if(r.type==="Avenant projet") return 4;
  if(r.type==="Congé") return 1;
  if(r.type==="Avance sur salaire") return 2;
  const m=r.montant||0;
  if(m<s.S0) return 0; if(m<s.S1) return 1; if(m<s.S2) return 2; if(m<s.S3) return 3; return 4;
}
function circuit(r){
  const n1=SERVICES[r.service]||"DT", lv=niveau(r);
  let c;
  if(r.type==="Avenant projet") c=["DT","DAF","DG"];
  else if(r.type==="Congé") c=[n1,"RH"];
  else if(r.type==="Avance sur salaire") c=["RH","DAF"];
  else if(r.type==="Paiement fournisseur") c=lv<=2?[n1,"DAF"]:[n1,"DAF","DG"];
  else c=[[],[n1],[n1,"DAF"],[n1,"DAF","DG"],[n1,"DT","DAF","DG"]][lv];
  return c.filter((x,i)=>c.indexOf(x)===i);
}
function etapeRole(r){const c=circuit(r);return r.statut==="En attente"&&r.etape<c.length?c[r.etape]:null}
function circuitFacture(f){const s=cfg().seuils;const c=[];if(f.projetId)c.push("CP");c.push("DAF");if(f.montant>s.SF)c.push("DG");return c}
function etapeFacture(f){if(f.sens!=="fournisseur"||f.statut!=="À valider")return null;const c=circuitFacture(f);return c[f.etape]||null}
const fage=h=>h<24?Math.max(0,Math.round(h))+" h":(Math.round(h/24*10)/10).toLocaleString("fr-FR")+" j";
const ageH=r=>r.creeLe?(Date.now()-new Date(r.creeLe).getTime())/36e5:daysBetween(r.date,todayISO())*24;

/* ---------- calculs métier ---------- */
function prjCalc(p){
  const t=todayISO(), total=Math.max(1,daysBetween(p.dateDebut,p.dateFin));
  const temps=clamp(daysBetween(p.dateDebut,t)/total*100,0,100);
  const montant=(p.montant||0)+(p.avenants||0);
  const depPct=montant?p.depenses/montant*100:0, facPct=montant?p.facture/montant*100:0, encPct=montant?p.encaisse/montant*100:0;
  const retard=p.statut==="En cours"?temps-p.avancement:0, ecartDep=depPct-p.avancement;
  let sante="ok";
  if(retard>15||ecartDep>15) sante="bad"; else if(retard>7||ecartDep>8) sante="warn";
  return {temps,montant,depPct,facPct,encPct,retard,ecartDep,sante,reste:montant*(1-p.avancement/100),resteFact:montant-p.facture,creance:p.facture-p.encaisse};
}
const actifs=()=>list("projets").filter(p=>p.statut==="En cours"||p.statut==="Suspendu");
function soldeCompte(c){return c.soldeOuverture+list("mouvements").filter(m=>m.compteId===c.id&&m.statut==="Réalisé").reduce((a,m)=>a+m.montant,0)}
function tresoDispo(){return list("comptes").reduce((a,c)=>a+soldeCompte(c),0)}
function fluxPrevus(debut,fin){ // [debut, fin[ en jours relatifs
  const t=todayISO(), a=addDays(t,debut), b=addDays(t,fin); let tot=0; const items=[];
  list("mouvements").forEach(m=>{if(m.statut==="Prévu"&&m.date>=a&&m.date<b){tot+=m.montant;items.push(m)}});
  list("factures").forEach(f=>{
    const reste=f.montant-(f.paye||0); if(reste<=0||f.statut==="Rejetée")return;
    if(f.sens==="client"){ if(f.echeance>=a&&f.echeance<b&&f.echeance>=t) tot+=reste; }
    else { const e=f.echeance<t?t:f.echeance; if(e>=a&&e<b) tot-=reste; }
  });
  return tot;
}
function projection(weeks){const out=[];let s=tresoDispo();out.push({w:0,d:todayISO(),v:s});for(let i=0;i<weeks;i++){s+=fluxPrevus(i*7,(i+1)*7);out.push({w:i+1,d:addDays(todayISO(),(i+1)*7),v:s})}return out}
function creancesEchues(){const t=todayISO();return list("factures").filter(f=>f.sens==="client"&&f.montant>(f.paye||0)&&f.echeance<t)}
function flotteStats(){
  const e=list("engins"), by=s=>e.filter(x=>x.statut===s).length;
  const r={total:e.length,dispo:by("Disponible"),mission:by("En mission"),panne:by("En panne"),entretien:by("En entretien")};
  r.op=r.dispo+r.mission; r.tauxDispo=r.total?r.op/r.total*100:0; r.tauxUtil=r.op?r.mission/r.op*100:0; return r;
}
const entretienDu=e=>e.compteur>=e.prochainEntretien;
const entretienProche=e=>!entretienDu(e)&&(e.prochainEntretien-e.compteur)<=(e.unite==="h"?150:3000);

function instances(){
  const req=list("requetes").filter(r=>r.statut==="En attente");
  const paiements=req.filter(r=>r.type==="Paiement fournisseur");
  const autres=req.filter(r=>r.type!=="Paiement fournisseur");
  const offres=list("offres").filter(o=>o.statut==="En préparation");
  const offresUrg=offres.filter(o=>daysBetween(todayISO(),o.dateLimite)<=7);
  const soumises=list("offres").filter(o=>o.statut==="Soumise");
  const fClient=list("factures").filter(f=>f.sens==="client"&&f.montant>(f.paye||0));
  const echues=creancesEchues();
  const fFour=list("factures").filter(f=>f.sens==="fournisseur"&&f.statut==="À valider");
  const fFourAPayer=list("factures").filter(f=>f.sens==="fournisseur"&&f.statut==="Validée");
  const moiReq=req.filter(r=>etapeRole(r)===S.role), moiFac=fFour.filter(f=>etapeFacture(f)===S.role);
  const sum=(a,k="montant")=>a.reduce((s,x)=>s+(x[k]||0),0);
  return {req,paiements,autres,offres,offresUrg,soumises,fClient,echues,fFour,fFourAPayer,moiReq,moiFac,sum};
}

function alertes(){
  const A=[], t=todayISO(), c=cfg();
  actifs().forEach(p=>{const k=prjCalc(p);
    if(k.retard>7) A.push({sev:k.retard>15?"bad":"warn",txt:`${p.code} — retard de ${Math.round(k.retard)} pts sur le planning`,sub:`${pct(p.avancement)} réalisé pour ${pct(k.temps)} du délai consommé`,href:"#projet-"+p.id});
    if(k.ecartDep>8) A.push({sev:k.ecartDep>15?"bad":"warn",txt:`${p.code} — dépenses en avance sur l'exécution`,sub:`${pct(k.depPct)} du marché dépensé pour ${pct(p.avancement)} réalisé`,href:"#projet-"+p.id});
  });
  const proj=projection(13); const sous=proj.find(x=>x.v<c.seuilTresorerie);
  if(sous) A.push({sev:sous.v<0?"bad":"warn",txt:`Trésorerie projetée sous le seuil d'alerte (${fm(c.seuilTresorerie)}) semaine du ${dshort(addDays(sous.d,-7))}`,sub:`Solde projeté : ${fm(sous.v)} FCFA`,href:"#tresorerie"});
  const byClient={};creancesEchues().forEach(f=>{byClient[f.tiers]=(byClient[f.tiers]||0)+f.montant-(f.paye||0)});
  Object.entries(byClient).forEach(([cl,v])=>A.push({sev:v>50*M?"bad":"warn",txt:`Créances échues ${cl} : ${fm(v)} FCFA`,sub:"Relance de recouvrement à lancer",href:"#factures"}));
  list("engins").forEach(e=>{
    if(e.statut==="En panne"){const j=daysBetween(e.depuis,t);if(j>=3)A.push({sev:j>=7?"bad":"warn",txt:`${e.code} ${e.type} immobilisé depuis ${j} jours`,sub:e.panne||"",href:"#engin-"+e.id})}
    if(entretienDu(e)&&e.statut!=="En entretien") A.push({sev:"warn",txt:`${e.code} — entretien préventif dépassé`,sub:`Compteur ${fmt(e.compteur)} ${e.unite} / échéance ${fmt(e.prochainEntretien)} ${e.unite}`,href:"#engin-"+e.id});
  });
  list("offres").filter(o=>o.statut==="En préparation").forEach(o=>{const j=daysBetween(t,o.dateLimite);if(j<=7&&j>=0)A.push({sev:j<=3?"bad":"warn",txt:`Offre « ${o.intitule} » à déposer dans ${j} jour${j>1?"s":""}`,sub:`${o.client} — ${fm(o.montant)} FCFA`,href:"#commercial"})});
  list("requetes").filter(r=>r.statut==="En attente"&&ageH(r)>c.slaHeures).forEach(r=>A.push({sev:"info",txt:`${r.num} en attente depuis ${Math.round(ageH(r)/24)} jours chez ${etapeRole(r)||"?"}`,sub:r.objet,href:"#requete-"+r.id}));
  const nr=list("mouvements").filter(m=>m.statut==="Réalisé"&&!m.rapproche&&daysBetween(m.date,t)>7);
  if(nr.length) A.push({sev:"info",txt:`${nr.length} mouvement${nr.length>1?"s":""} bancaire${nr.length>1?"s":""} non rapproché${nr.length>1?"s":""} depuis plus de 7 jours`,sub:"Rapprochement bancaire",href:"#tresorerie"});
  const order={bad:0,warn:1,info:2};return A.sort((a,b)=>order[a.sev]-order[b.sev]);
}

/* ---------- graphiques SVG ---------- */
function chartTreso(proj,seuil,W=640,H=220){
  const pl=56,pr=14,pt=14,pb=28, vals=proj.map(p=>p.v);
  let mn=Math.min(0,...vals,seuil), mx=Math.max(...vals,seuil);
  const span=mx-mn||1; mx+=span*.08; mn=Math.min(0,mn-span*.04);
  const step=niceStep((mx-mn)/4); mn=Math.floor(mn/step)*step; mx=Math.ceil(mx/step)*step;
  const x=i=>pl+i*(W-pl-pr)/(proj.length-1), y=v=>pt+(mx-v)*(H-pt-pb)/(mx-mn);
  let g='<g class="grid">'; for(let v=mn;v<=mx+1;v+=step){g+=`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl-6}" y="${y(v)+3.5}" text-anchor="end">${fm(v)}</text>`} g+="</g>";
  const pts=proj.map((p,i)=>`${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const area=`M${x(0)},${y(Math.max(mn,0))} L${pts.split(" ").join(" L")} L${x(proj.length-1)},${y(Math.max(mn,0))} Z`;
  let xl="";proj.forEach((p,i)=>{if(i%2===0)xl+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${i===0?"auj.":"S+"+i}</text>`});
  const last=proj[proj.length-1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Projection de trésorerie sur 13 semaines">${g}
    <path d="${area}" fill="var(--blue)" fill-opacity=".12"/>
    <line x1="${pl}" x2="${W-pr}" y1="${y(seuil)}" y2="${y(seuil)}" stroke="var(--orange)" stroke-dasharray="5 4" stroke-width="1.5"/>
    <text x="${pl+6}" y="${y(seuil)-5}" text-anchor="start" style="fill:var(--orange)">seuil d'alerte ${fm(seuil)}</text>
    ${mn<0?`<line class="zero" x1="${pl}" x2="${W-pr}" y1="${y(0)}" y2="${y(0)}"/>`:""}
    <polyline points="${pts}" fill="none" stroke="var(--blue)" stroke-width="2.2" stroke-linejoin="round"/>
    ${proj.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.v)}" r="${i===0||i===proj.length-1?4:2.2}" fill="${p.v<seuil?"var(--bad)":"var(--blue)"}"><title>${i===0?"Aujourd'hui":"Semaine "+i+" ("+dfr(p.d)+")"} : ${fcfa(p.v)}</title></circle>`).join("")}
    <text x="${x(proj.length-1)-8}" y="${y(last.v)+(last.v<seuil+(mx-mn)*.12?16:-9)}" text-anchor="end" style="fill:var(--fg);font-weight:600">${fm(last.v)}</text>
    ${xl}</svg>`;
}
function niceStep(raw){const p=Math.pow(10,Math.floor(Math.log10(raw||1)));const n=raw/p;return (n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p}
function spark(vals,color){
  if(!vals||vals.length<2)return"";const W=120,H=34,mn=Math.min(...vals),mx=Math.max(...vals),sp=mx-mn||1;
  const pts=vals.map((v,i)=>`${(i*(W-4)/(vals.length-1)+2).toFixed(1)},${(H-3-(v-mn)/sp*(H-6)).toFixed(1)}`);
  const lp=pts[pts.length-1].split(",");
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="1.8"/><circle cx="${lp[0]}" cy="${lp[1]}" r="2.8" fill="${color}"/></svg>`;
}

/* ---------- rendu général ---------- */
const NAV=[
  ["cockpit","Cockpit Président"],["sep","Pilotage"],["projets","Marchés et projets"],["commercial","Offres et appels d'offres"],
  ["sep","Instances"],["instances","Requêtes et validations"],["factures","Factures"],["tresorerie","Trésorerie"],
  ["sep","Opérations"],["flotte","Parc et flotte"],["vidange","Vidange à la demande"],["sep","Système"],["parametres","Paramètres"]
];
const TITLES={cockpit:"Cockpit Président",projets:"Marchés et projets",projet:"Fiche projet",commercial:"Offres et appels d'offres",instances:"Requêtes et validations",requete:"Requête",factures:"Factures",tresorerie:"Trésorerie",flotte:"Parc et flotte",engin:"Fiche engin",vidange:"Vidange à la demande",parametres:"Paramètres"};

function navCounts(){const I=instances();return{instances:I.moiReq.length+I.moiFac.length,factures:I.echues.length,vidange:list("interventions").filter(v=>v.statut==="Nouvelle").length,flotte:list("engins").filter(e=>e.statut==="En panne").length}}

function render(){
  const root=$("#app"); if(!root)return;
  if(S.mode==="loading"){root.innerHTML=shell(`<div class="loading">Connexion à la base VICAS…</div>`);return}
  let body;
  try{body=VIEWS[S.route]?VIEWS[S.route](S.param):VIEWS.cockpit()}catch(e){console.error(e);body=`<div class="banner warn">Erreur d'affichage : ${esc(e.message)}</div>`}
  const st=window.scrollY; root.innerHTML=shell(body); window.scrollTo(0,st);
}
function shell(body){
  const nc=S.mode==="loading"?{}:navCounts();
  const nav=NAV.map(([k,l])=>k==="sep"?`<div class="sep">${l}</div>`:`<a href="#${k}" class="${(S.route===k||(S.route==="projet"&&k==="projets")||(S.route==="engin"&&k==="flotte")||(S.route==="requete"&&k==="instances"))?"on":""}">${icon(k)}<span>${l}</span>${nc[k]?`<span class="ct">${nc[k]}</span>`:""}</a>`).join("");
  const banner=S.mode==="db"&&S.emptyDb?`<div class="banner info"><b>La base partagée est vide.</b><span>Chargez le jeu de données de démonstration pour commencer les tests.</span><span class="grow"></span>${S.canWrite?`<button class="btn pri" data-act="seed">Charger les données de démonstration</button>`:`<span class="muted">Demandez au propriétaire de l'initialiser.</span>`}</div>`:"";
  return `<div class="app">
  <aside class="rail" id="rail">
    <div class="brand">${LOGO}<div><b>VICAS ERP</b><small>Version alpha</small></div></div>
    <nav class="nav" aria-label="Modules">${nav}</nav>
    <div class="rail-foot">Données de démonstration fictives.<br>Cahier des charges VICAS-DSI-CDC-ERP-001 v1.2</div>
  </aside>
  <div class="main">
    <div class="topbar">
      <button class="btn sm menu-btn" data-act="menu" aria-label="Ouvrir le menu">${icon("menu")}</button>
      <div><h1>${esc(TITLES[S.route]||"")}</h1><div class="sub">${new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div></div>
      <span class="grow"></span>
      <span class="mode ${S.mode}" title="${S.mode==="db"?"Les données sont partagées entre tous les testeurs de ce lien.":"Les données restent dans ce navigateur uniquement."}">${S.mode==="db"?"Base partagée":S.mode==="local"?"Démo locale":"…"}</span>
      <label class="who" for="role"><span class="lbl-long">Profil de test</span>
        <select id="role" data-change="role">${Object.entries(ROLES).map(([k,r])=>`<option value="${k}" ${k===S.role?"selected":""}>${esc(r.lib)}</option>`).join("")}</select></label>
    </div>
    <main class="content" id="content">${banner}${body}</main>
  </div></div>`;
}
const LOGO=`<svg viewBox="0 0 832 507" aria-label="VICAS"><rect width="832" height="507" fill="#fff"/><path d="M 85 300 C 70 160, 150 52, 300 45 C 460 38, 520 90, 800 185" fill="none" stroke="#2b4ec5" stroke-width="36" stroke-linecap="round"/><rect x="30" y="255" width="100" height="185" fill="#2b4ec5"/><rect x="62" y="440" width="36" height="42" fill="#2b4ec5"/><rect x="128" y="88" width="452" height="352" fill="#ee7130"/><text x="354" y="235" font-family="Arial,Helvetica,sans-serif" font-size="118" font-weight="900" font-style="italic" fill="#2b4ec5" text-anchor="middle">VICAS</text><text x="354" y="392" font-family="Arial,Helvetica,sans-serif" font-size="72" font-weight="600" fill="#2b4ec5" text-anchor="middle" letter-spacing="6">S.A.R.L.</text></svg>`;

const statutPill=s=>{const m={"En cours":"info","Suspendu":"warn","Réception provisoire":"ok","Clôturé":"","Disponible":"ok","En mission":"info","En panne":"bad","En entretien":"warn","En attente":"or","Validée":"ok","Exécutée":"ok","Rejetée":"bad","Complément demandé":"warn","À valider":"or","Payée":"ok","Partiellement payée":"warn","Émise":"info","En préparation":"or","Soumise":"info","Gagnée":"ok","Perdue":"bad","Nouvelle":"or","Planifiée":"info","Terminée":"ok","Annulée":"","Prévu":"info","Réalisé":"ok"};return `<span class="pill ${m[s]||""}">${esc(s)}</span>`};
const santePill=s=>s==="bad"?'<span class="pill bad">Critique</span>':s==="warn"?'<span class="pill warn">À surveiller</span>':'<span class="pill ok">Conforme</span>';
const projetNom=id=>{const p=get("projets",id);return p?p.code:(id==="vidange"?"Vidange à la demande":"—")};

/* ---------- vues ---------- */
const VIEWS={};

VIEWS.cockpit=function(){
  const prj=actifs(), I=instances(), F=flotteStats(), c=cfg();
  const carnet=prj.reduce((a,p)=>a+prjCalc(p).reste,0), valeur=prj.reduce((a,p)=>a+prjCalc(p).montant,0);
  const avgPhys=valeur?prj.reduce((a,p)=>a+p.avancement*prjCalc(p).montant,0)/valeur:0;
  const avgTemps=valeur?prj.reduce((a,p)=>a+prjCalc(p).temps*prjCalc(p).montant,0)/valeur:0;
  const dispo=tresoDispo(), net30=dispo+fluxPrevus(0,30), proj=projection(13);
  const moi=I.moiReq.length+I.moiFac.length, moiMt=I.sum(I.moiReq)+I.sum(I.moiFac);
  const crit=prj.filter(p=>prjCalc(p).sante!=="ok").length;
  const al=alertes();
  const comptes=list("comptes").map(cp=>({cp,s:soldeCompte(cp)})).sort((a,b)=>b.s-a.s);
  const types=["Banque","Mobile money","Caisse"].map(t=>({t,v:comptes.filter(x=>x.cp.type===t).reduce((a,x)=>a+x.s,0)}));
  const immob=list("engins").filter(e=>e.statut==="En panne"||e.statut==="En entretien");
  const fam={};list("engins").forEach(e=>{const k=famille(e.type);fam[k]=fam[k]||{t:0,op:0};fam[k].t++;if(e.statut==="Disponible"||e.statut==="En mission")fam[k].op++});
  return `
  <section class="grid g4" aria-label="Indicateurs clés">
    <a class="tile accent" href="#projets"><span class="lbl">Carnet de commandes</span><span class="val">${fm(carnet)}<small>FCFA</small></span>
      <span class="meta">${prj.length} marchés en cours · ${fm(valeur)} contractés</span>
      <span class="meta">Avancement pondéré <b>${pct(avgPhys)}</b> pour ${pct(avgTemps)} du délai · ${crit?`<span class="warn-t">${crit} à surveiller</span>`:"tous conformes"}</span></a>
    <a class="tile" href="#tresorerie"><span class="lbl">Trésorerie disponible</span><span class="val">${fm(dispo)}<small>FCFA</small></span>
      <span class="meta">Position nette à 30 jours : <b class="${net30<c.seuilTresorerie?"bad-t":""}">${fm(net30)}</b></span>
      ${spark(proj.map(p=>p.v),"var(--blue)")}</a>
    <a class="tile" href="#flotte"><span class="lbl">Flotte opérationnelle</span><span class="val">${F.op}<small>/ ${F.total} engins</small></span>
      <span class="meta">Disponibilité <b>${pct(F.tauxDispo)}</b> · utilisation ${pct(F.tauxUtil)}</span>
      <span class="meta"><span class="bad-t">${F.panne} en panne</span> · ${F.entretien} en entretien · ${F.dispo} libres</span></a>
    <a class="tile" href="#instances"><span class="lbl">Instances à votre niveau</span><span class="val">${moi}<small>dossier${moi>1?"s":""}</small></span>
      <span class="meta">${fm(moiMt)} FCFA à décider (${esc(ROLES[S.role].lib)})</span>
      <span class="meta">${I.req.length} requêtes ouvertes dans l'entreprise</span></a>
  </section>

  <section class="grid g-7-5">
    <div class="panel"><header><h2>Marchés et projets en exécution</h2><span class="hint">physique / financier / délai</span>
      <span class="right legend"><span><i class="sw" style="background:var(--blue)"></i>Réalisé</span><span><i class="sw" style="background:var(--orange)"></i>Dépensé</span><span><i class="sw" style="background:var(--fg);width:2px;height:12px"></i>Délai écoulé</span></span></header>
      <div class="body flush">${prj.length?prj.sort((a,b)=>prjCalc(b).montant-prjCalc(a).montant).map(prjRow).join(""):`<div class="empty">Aucun marché en cours. Les marchés gagnés apparaissent ici dès leur création.</div>`}</div></div>
    <div class="panel"><header><h2>Trésorerie — 13 semaines</h2><span class="hint">solde + prévisions + échéances factures</span></header>
      <div class="body">${chartTreso(proj,c.seuilTresorerie,460,250)}
        <div class="grid g3" style="gap:8px;margin-top:6px">${types.map(x=>`<div><div class="muted" style="font-size:12px">${x.t}</div><div class="num" style="font-weight:600">${fm(x.v)}</div></div>`).join("")}</div>
        <p class="muted" style="font-size:12.5px;margin:10px 0 0">Créances échues non intégrées à la projection : <b>${fm(I.sum(I.echues)-I.sum(I.echues,"paye"))} FCFA</b> (${I.echues.length} factures).</p>
      </div></div>
  </section>

  <section class="grid g-7-5">
    <div class="panel"><header><h2>Instances en cours</h2><span class="hint">paiements, requêtes, offres, factures</span></header>
      <div class="body"><div class="inst">
        <a href="#instances" class="${I.paiements.length?"hot":""}"><span class="n">${I.paiements.length}</span><span class="l">Paiements à valider</span><span class="m">${fm(I.sum(I.paiements))} FCFA</span></a>
        <a href="#instances"><span class="n">${I.autres.length}</span><span class="l">Requêtes internes</span><span class="m">${I.autres.filter(r=>ageH(r)>c.slaHeures).length} hors délai (${c.slaHeures} h)</span></a>
        <a href="#factures" class="${I.fFour.length?"hot":""}"><span class="n">${I.fFour.length}</span><span class="l">Factures fournisseurs à valider</span><span class="m">${fm(I.sum(I.fFour))} FCFA</span></a>
        <a href="#factures"><span class="n">${I.fFourAPayer.length}</span><span class="l">Factures validées à payer</span><span class="m">${fm(I.sum(I.fFourAPayer))} FCFA</span></a>
        <a href="#factures" class="${I.echues.length?"hot":""}"><span class="n">${I.echues.length}</span><span class="l">Factures clients échues</span><span class="m">${fm(I.sum(I.echues)-I.sum(I.echues,"paye"))} FCFA à recouvrer</span></a>
        <a href="#factures"><span class="n">${I.fClient.length}</span><span class="l">Factures clients ouvertes</span><span class="m">${fm(I.sum(I.fClient)-I.sum(I.fClient,"paye"))} FCFA</span></a>
        <a href="#commercial" class="${I.offresUrg.length?"hot":""}"><span class="n">${I.offres.length}</span><span class="l">Offres en préparation</span><span class="m">${I.offresUrg.length} à déposer sous 7 j</span></a>
        <a href="#commercial"><span class="n">${I.soumises.length}</span><span class="l">Offres soumises</span><span class="m">${fm(I.sum(I.soumises))} FCFA en attente</span></a>
      </div></div></div>
    <div class="panel"><header><h2>Disponibilité de la flotte</h2><span class="hint">${F.total} engins</span></header>
      <div class="body stack">
        <div class="fleetbar" role="img" aria-label="Répartition de la flotte par statut">${[["mission","var(--blue)"],["dispo","var(--ok)"],["entretien","var(--warn)"],["panne","var(--bad)"]].map(([k,col])=>`<i style="width:${F.total?F[k]/F.total*100:0}%;background:${col}" title="${k}: ${F[k]}"></i>`).join("")}</div>
        <div class="legend"><span><i class="sw" style="background:var(--blue)"></i>En mission ${F.mission}</span><span><i class="sw" style="background:var(--ok)"></i>Disponibles ${F.dispo}</span><span><i class="sw" style="background:var(--warn)"></i>Entretien ${F.entretien}</span><span><i class="sw" style="background:var(--bad)"></i>Panne ${F.panne}</span></div>
        <table class="tbl"><thead><tr><th>Famille</th><th class="r">Opérationnels</th><th style="width:40%"></th></tr></thead><tbody>
        ${Object.entries(fam).map(([k,v])=>`<tr><td>${esc(k)}</td><td class="r num">${v.op}/${v.t}</td><td><div class="bar"><i style="width:${v.op/v.t*100}%;background:${v.op/v.t<.7?"var(--warn)":"var(--ok)"}"></i></div></td></tr>`).join("")}</tbody></table>
        ${immob.length?`<div><h3 class="sec" style="margin-bottom:6px">Immobilisés</h3>${immob.map(e=>`<div class="row" style="font-size:13.5px;padding:3px 0"><a href="#engin-${e.id}">${esc(e.code)}</a>${statutPill(e.statut)}<span class="muted">${esc(e.panne||"")} · ${daysBetween(e.depuis,todayISO())} j</span></div>`).join("")}</div>`:""}
      </div></div>
  </section>

  <section class="panel"><header><h2>Alertes</h2><span class="hint">${al.length} point${al.length>1?"s":""} d'attention générés automatiquement</span></header>
    <div class="body flush">${al.length?`<ul class="alerts">${al.slice(0,12).map(a=>`<li><span class="sev ${a.sev}"></span><div class="tx"><a href="${a.href}">${esc(a.txt)}</a><small>${esc(a.sub)}</small></div></li>`).join("")}</ul>`:`<div class="empty">Aucune alerte. Tout est dans les clous.</div>`}</div></section>`;
};
function famille(t){t=t.toLowerCase();if(t.includes("hydrocureur"))return"Hydrocureurs";if(t.includes("vidange"))return"Camions de vidange";if(t.includes("pelle")||t.includes("chargeuse"))return"Engins de terrassement";if(t.includes("benne"))return"Camions bennes";if(t.includes("pick-up")||t.includes("véhicule"))return"Véhicules de liaison";if(t.includes("huiles"))return"Citernes huiles usagées";return"Pompes et groupes"}
function prjRow(p){const k=prjCalc(p);return `<div class="prj" data-href="#projet-${p.id}" tabindex="0" role="link">
  <div class="nm">${esc(p.intitule)}<small>${esc(p.code)} · ${esc(p.client)} · ${esc(p.localite)} · ${fm(k.montant)}</small></div>
  <div class="bars"><div class="bar" title="Avancement physique ${pct(p.avancement)} — délai écoulé ${pct(k.temps)}"><i style="width:${p.avancement}%"></i><b style="left:${k.temps}%"></b></div>
    <div class="bar fin" title="Dépensé ${pct(k.depPct)} du marché"><i style="width:${clamp(k.depPct,0,100)}%"></i></div></div>
  <div class="row" style="justify-content:flex-end;gap:6px"><span class="num" style="font-size:13px">${Math.round(p.avancement)} %</span>${santePill(k.sante)}</div></div>`}

VIEWS.projets=function(){
  const f=S.filters.prj||"En cours", q=(S.filters.prjq||"").toLowerCase();
  let ps=list("projets").filter(p=>f==="Tous"||p.statut===f||(f==="Terminés"&&(p.statut==="Réception provisoire"||p.statut==="Clôturé")));
  if(q) ps=ps.filter(p=>(p.intitule+p.code+p.client+p.localite).toLowerCase().includes(q));
  ps.sort((a,b)=>a.code<b.code?1:-1);
  const tot=ps.reduce((a,p)=>{const k=prjCalc(p);a.m+=k.montant;a.f+=p.facture;a.e+=p.encaisse;a.d+=p.depenses;return a},{m:0,f:0,e:0,d:0});
  return `<div class="toolbar"><div class="seg">${["En cours","Terminés","Suspendu","Tous"].map(x=>`<button data-act="filt" data-k="prj" data-v="${x}" class="${f===x?"on":""}">${x}</button>`).join("")}</div>
    <input class="search" id="prjq" placeholder="Rechercher un marché, un client…" value="${esc(S.filters.prjq||"")}" data-input="prjq"><span class="grow"></span>
    <button class="btn pri" data-act="newProjet">${icon("plus")}Nouveau marché</button></div>
  <section class="grid g4">
    <div class="tile"><span class="lbl">Montant des marchés</span><span class="val">${fm(tot.m)}</span></div>
    <div class="tile"><span class="lbl">Facturé</span><span class="val">${fm(tot.f)}</span><span class="meta">${tot.m?pct(tot.f/tot.m*100):"—"} du montant</span></div>
    <div class="tile"><span class="lbl">Encaissé</span><span class="val">${fm(tot.e)}</span><span class="meta">${fm(tot.f-tot.e)} de créances</span></div>
    <div class="tile"><span class="lbl">Dépensé</span><span class="val">${fm(tot.d)}</span><span class="meta">${tot.m?pct(tot.d/tot.m*100):"—"} du montant</span></div>
  </section>
  <div class="panel"><div class="body flush tbl-wrap"><table class="tbl"><thead><tr><th>Marché</th><th>Client</th><th>Chef de projet</th><th class="r">Montant</th><th style="min-width:150px">Physique / délai</th><th class="r">Dépensé</th><th class="r">Facturé</th><th class="r">Encaissé</th><th>Fin</th><th>État</th></tr></thead><tbody>
  ${ps.map(p=>{const k=prjCalc(p);return `<tr class="click" data-href="#projet-${p.id}"><td><div class="t1">${esc(p.code)}</div><div class="t2">${esc(p.intitule)}</div></td><td>${esc(p.client)}</td><td>${esc(p.chef)}</td><td class="r num">${fm(k.montant)}</td>
   <td><div class="row" style="gap:8px;flex-wrap:nowrap"><div class="bar" style="flex:1;min-width:80px"><i style="width:${p.avancement}%"></i><b style="left:${k.temps}%"></b></div><span class="num" style="font-size:12.5px">${Math.round(p.avancement)}%</span></div></td>
   <td class="r num">${pct(k.depPct)}</td><td class="r num">${pct(k.facPct)}</td><td class="r num">${pct(k.encPct)}</td><td class="num">${dfr(p.dateFin)}</td><td>${p.statut==="En cours"?santePill(k.sante):statutPill(p.statut)}</td></tr>`}).join("")||`<tr><td colspan="10" class="empty">Aucun marché pour ce filtre.</td></tr>`}
  </tbody></table></div></div>`;
};

VIEWS.projet=function(id){
  const p=get("projets",id); if(!p) return `<div class="empty">Projet introuvable. <a href="#projets">Retour à la liste</a></div>`;
  const k=prjCalc(p);
  const fac=list("factures").filter(f=>f.projetId===p.id).sort((a,b)=>a.dateEmission<b.dateEmission?1:-1);
  const req=list("requetes").filter(r=>r.projetId===p.id);
  const eng=list("engins").filter(e=>e.affectation===p.id);
  const hv=(p.histAv||[]).map(x=>x[1]);
  const canEdit=["DG","DT","CP","DAF"].includes(S.role);
  return `<div class="toolbar"><a class="btn sm" href="#projets">${icon("back")}Marchés</a><span class="grow"></span>
    ${canEdit?`<button class="btn" data-act="avancement" data-id="${p.id}">Mettre à jour l'avancement</button><button class="btn" data-act="avenant" data-id="${p.id}">Demander un avenant</button><button class="btn" data-act="editProjet" data-id="${p.id}">Modifier</button>`:`<span class="muted" style="font-size:13px">Lecture seule pour votre profil</span>`}</div>
  <section class="panel"><header><h2>${esc(p.intitule)}</h2><span class="right">${statutPill(p.statut)} ${p.statut==="En cours"?santePill(k.sante):""}</span></header>
    <div class="body grid g2">
      <dl class="kv"><dt>Référence</dt><dd>${esc(p.code)}</dd><dt>Client</dt><dd>${esc(p.client)}</dd><dt>Activité</dt><dd>${esc(p.type)}</dd><dt>Localité</dt><dd>${esc(p.localite)}</dd><dt>Chef de projet</dt><dd>${esc(p.chef)}</dd><dt>Période</dt><dd>${dfr(p.dateDebut)} → ${dfr(p.dateFin)}</dd><dt>Montant initial</dt><dd class="num">${fcfa(p.montant)}</dd><dt>Avenants</dt><dd class="num">${fcfa(p.avenants||0)}</dd></dl>
      <div class="stack">
        ${[["Avancement physique",p.avancement,"var(--blue)"],["Délai consommé",k.temps,"var(--fg-3)"],["Dépensé / marché",k.depPct,"var(--orange)"],["Facturé / marché",k.facPct,"var(--info)"],["Encaissé / marché",k.encPct,"var(--ok)"]].map(([l,v,c])=>`<div><div class="row" style="justify-content:space-between;font-size:13.5px"><span>${l}</span><b class="num">${pct(v)}</b></div><div class="bar"><i style="width:${clamp(v,0,100)}%;background:${c}"></i></div></div>`).join("")}
        <div class="row" style="font-size:13px;gap:16px"><span>Retard planning : <b class="${k.retard>7?"bad-t":""}">${k.retard>0?Math.round(k.retard)+" pts":"aucun"}</b></span><span>Écart dépenses : <b class="${k.ecartDep>8?"warn-t":""}">${k.ecartDep>0?"+":""}${Math.round(k.ecartDep)} pts</b></span><span>Créance client : <b>${fm(k.creance)}</b></span></div>
        ${hv.length>1?`<div class="row" style="font-size:12.5px;color:var(--fg-3)">Évolution de l'avancement ${spark(hv,"var(--blue)")}</div>`:""}
      </div></div></section>
  <section class="grid g2">
    <div class="panel"><header><h2>Jalons</h2></header><div class="body flush"><table class="tbl"><tbody>${(p.jalons||[]).map((j,i)=>`<tr><td>${esc(j.n)}</td><td class="num">${dfr(j.d)}</td><td>${j.f?'<span class="pill ok">Atteint</span>':(j.d<todayISO()?'<span class="pill bad">En retard</span>':'<span class="pill">À venir</span>')}</td><td class="r">${canEdit&&!j.f?`<button class="btn sm" data-act="jalon" data-id="${p.id}" data-i="${i}">Marquer atteint</button>`:""}</td></tr>`).join("")||`<tr><td class="empty">Aucun jalon.</td></tr>`}</tbody></table></div></div>
    <div class="panel"><header><h2>Engins affectés</h2><span class="hint">${eng.length}</span></header><div class="body flush"><table class="tbl"><tbody>${eng.map(e=>`<tr class="click" data-href="#engin-${e.id}"><td><b>${esc(e.code)}</b> <span class="muted">${esc(e.type)}</span></td><td>${esc(e.chauffeur)}</td><td>${statutPill(e.statut)}</td></tr>`).join("")||`<tr><td class="empty">Aucun engin affecté.</td></tr>`}</tbody></table></div></div>
  </section>
  <section class="grid g2">
    <div class="panel"><header><h2>Factures du marché</h2></header><div class="body flush tbl-wrap"><table class="tbl"><tbody>${fac.map(f=>`<tr><td><b>${esc(f.numero)}</b><div class="t2">${f.sens==="client"?"Client":"Fournisseur"} · ${esc(f.libelle)}</div></td><td class="r num">${fm(f.montant)}</td><td>${statutPill(f.statut)}</td></tr>`).join("")||`<tr><td class="empty">Aucune facture.</td></tr>`}</tbody></table></div></div>
    <div class="panel"><header><h2>Journal du projet</h2></header><div class="body"><ul class="hist">${[...(p.hist||[])].reverse().map(h=>`<li><span class="d">${dfr(h.d)}</span><span>${esc(h.quoi)} <span class="muted">— ${esc(h.qui)}</span></span></li>`).join("")}${req.map(r=>`<li><span class="d">${dfr(r.date)}</span><span><a href="#requete-${r.id}">${esc(r.num)}</a> ${esc(r.objet)} ${statutPill(r.statut)}</span></li>`).join("")}</ul></div></div>
  </section>`;
};

VIEWS.commercial=function(){
  const os=list("offres").sort((a,b)=>a.dateLimite<b.dateLimite?-1:1), t=todayISO();
  const cols=["En préparation","Soumise","Gagnée","Perdue"];
  const pond=os.filter(o=>o.statut==="En préparation"||o.statut==="Soumise").reduce((a,o)=>a+o.montant*o.probabilite/100,0);
  const gag=os.filter(o=>o.statut==="Gagnée").length, perd=os.filter(o=>o.statut==="Perdue").length;
  return `<div class="toolbar"><span class="muted">Pipeline pondéré : <b class="num">${fm(pond)} FCFA</b> · taux de succès ${gag+perd?pct(gag/(gag+perd)*100):"—"}</span><span class="grow"></span><button class="btn pri" data-act="newOffre">${icon("plus")}Nouvelle offre</button></div>
  <div class="grid g4">${cols.map(c=>{const it=os.filter(o=>o.statut===c);return `<div class="panel"><header><h2>${c}</h2><span class="hint">${it.length} · ${fm(it.reduce((a,o)=>a+o.montant,0))}</span></header><div class="body stack">${it.map(o=>{const j=daysBetween(t,o.dateLimite);return `<div style="border:1px solid var(--line);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:5px">
     <div style="font-weight:600;font-size:14px;line-height:1.3">${esc(o.intitule)}</div><div class="t2 muted" style="font-size:12.5px">${esc(o.ref)} · ${esc(o.client)}</div>
     <div class="row" style="justify-content:space-between"><b class="num">${fm(o.montant)}</b>${c==="En préparation"?`<span class="pill ${j<=3?"bad":j<=7?"warn":""}">${j>=0?"J−"+j:"échue"}</span>`:`<span class="muted" style="font-size:12px">${dfr(o.dateLimite)}</span>`}</div>
     <div class="row" style="gap:6px">${c==="En préparation"?`<button class="btn sm" data-act="offreStatut" data-id="${o.id}" data-v="Soumise">Marquer soumise</button>`:""}${c==="Soumise"?`<button class="btn sm ok" data-act="offreStatut" data-id="${o.id}" data-v="Gagnée">Gagnée</button><button class="btn sm bad" data-act="offreStatut" data-id="${o.id}" data-v="Perdue">Perdue</button>`:""}${c==="Gagnée"&&!o.projetId?`<button class="btn sm pri" data-act="offreProjet" data-id="${o.id}">Créer le marché</button>`:""}${o.projetId?`<a class="btn sm" href="#projet-${o.projetId}">Voir le marché</a>`:""}</div></div>`}).join("")||`<div class="empty">Aucune offre.</div>`}</div></div>`}).join("")}</div>`;
};

VIEWS.instances=function(){
  const f=S.filters.req||"moi";
  let rs=list("requetes").sort((a,b)=>a.creeLe<b.creeLe?1:-1);
  if(f==="moi") rs=rs.filter(r=>etapeRole(r)===S.role);
  else if(f==="attente") rs=rs.filter(r=>r.statut==="En attente");
  else if(f==="miennes") rs=rs.filter(r=>r.demandeur===me().nom);
  const s=cfg().seuils;
  return `<div class="toolbar"><div class="seg">${[["moi","À valider par moi"],["attente","Toutes en attente"],["miennes","Mes demandes"],["toutes","Historique"]].map(([k,l])=>`<button data-act="filt" data-k="req" data-v="${k}" class="${f===k?"on":""}">${l}</button>`).join("")}</div><span class="grow"></span><button class="btn pri" data-act="newReq">${icon("plus")}Nouvelle requête</button></div>
  <div class="banner"><b>Circuit gradué :</b><span class="muted">N0 &lt; ${fm(s.S0)} (exécution directe) · N1 &lt; ${fm(s.S1)} (N+1) · N2 &lt; ${fm(s.S2)} (N+1 + DAF) · N3 &lt; ${fm(s.S3)} (+ DG) · N4 au-delà ou avenant (DT + DAF + DG)</span></div>
  <div class="panel"><div class="body flush tbl-wrap"><table class="tbl"><thead><tr><th>N°</th><th>Objet</th><th>Demandeur</th><th class="r">Montant</th><th>Niveau</th><th>Circuit</th><th>Âge</th><th>Statut</th><th></th></tr></thead><tbody>
  ${rs.map(r=>{const er=etapeRole(r);return `<tr class="click" data-href="#requete-${r.id}"><td class="num">${esc(r.num)}</td><td><div class="t1">${esc(r.objet)}</div><div class="t2">${esc(r.type)}${r.projetId?" · "+esc(projetNom(r.projetId)):""}</div></td><td>${esc(r.demandeur)}<div class="t2">${esc(r.service)}</div></td><td class="r num">${r.montant?fm(r.montant):"—"}</td><td><span class="pill ${niveau(r)>=3?"or":""}">N${niveau(r)}</span></td><td>${stepsHtml(r)}</td><td class="num ${r.statut==="En attente"&&ageH(r)>cfg().slaHeures?"bad-t":""}">${r.statut==="En attente"?fage(ageH(r)):"—"}</td><td>${statutPill(r.statut)}</td><td class="r">${er===S.role?`<span class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm ok" data-act="valider" data-id="${r.id}">Valider</button><button class="btn sm bad" data-act="rejeter" data-id="${r.id}">Rejeter</button></span>`:""}</td></tr>`}).join("")||`<tr><td colspan="9" class="empty">${f==="moi"?"Rien à valider pour le profil « "+esc(me().lib)+" ». Changez de profil de test en haut à droite pour voir les autres files.":"Aucune requête."}</td></tr>`}
  </tbody></table></div></div>`;
};
function stepsHtml(r){const c=circuit(r);if(!c.length)return`<span class="step done">Exécution directe</span>`;return `<span class="steps">${c.map((x,i)=>{let cl="";if(r.statut==="Rejetée"&&i===r.etape)cl="rej";else if(i<r.etape||r.statut==="Validée"||r.statut==="Exécutée")cl="done";else if(i===r.etape&&r.statut==="En attente")cl="cur";return `<span class="step ${cl}" title="${esc(ROLES[x].lib)}">${x}</span>`}).join('<span class="arrow">›</span>')}</span>`}

VIEWS.requete=function(id){
  const r=get("requetes",id); if(!r) return `<div class="empty">Requête introuvable. <a href="#instances">Retour</a></div>`;
  const er=etapeRole(r);
  return `<div class="toolbar"><a class="btn sm" href="#instances">${icon("back")}Requêtes</a></div>
  <section class="panel"><header><h2>${esc(r.num)} — ${esc(r.objet)}</h2><span class="right">${statutPill(r.statut)}</span></header>
  <div class="body grid g2"><dl class="kv"><dt>Type</dt><dd>${esc(r.type)}</dd><dt>Demandeur</dt><dd>${esc(r.demandeur)} (${esc(r.service)})</dd><dt>Date</dt><dd>${dfr(r.date)}</dd><dt>Montant</dt><dd class="num">${r.montant?fcfa(r.montant):"—"}</dd><dt>Projet</dt><dd>${r.projetId?`<a href="#projet-${r.projetId}">${esc(projetNom(r.projetId))}</a>`:"—"}</dd><dt>Niveau</dt><dd>N${niveau(r)}</dd>${r.motif?`<dt>Motif</dt><dd>${esc(r.motif)}</dd>`:""}</dl>
  <div class="stack"><h3 class="sec">Circuit de validation</h3>${stepsHtml(r)}
   ${er?`<p style="margin:0">En attente de : <b>${esc(ROLES[er].lib)}</b> (${esc(ROLES[er].nom)})</p>`:""}
   ${er===S.role?`<div class="row"><button class="btn ok" data-act="valider" data-id="${r.id}">Valider</button><button class="btn" data-act="complement" data-id="${r.id}">Demander un complément</button><button class="btn bad" data-act="rejeter" data-id="${r.id}">Rejeter</button></div>`:er?`<p class="muted" style="margin:0;font-size:13px">Passez au profil « ${esc(ROLES[er].lib)} » pour tester la validation.</p>`:""}
   ${r.statut==="Validée"&&["ACH","DAF","PARC","RH","DG"].includes(S.role)&&r.type!=="Congé"?`<div><button class="btn pri" data-act="executer" data-id="${r.id}">Marquer exécutée</button></div>`:""}
   ${r.statut==="Complément demandé"&&r.demandeur===me().nom?`<div><button class="btn pri" data-act="relancer" data-id="${r.id}">Renvoyer après complément</button></div>`:""}
  </div></div></section>
  <section class="panel"><header><h2>Traçabilité</h2></header><div class="body"><ul class="hist">${[...(r.hist||[])].reverse().map(h=>`<li><span class="d">${dfr(h.d)}</span><span>${esc(h.quoi)} <span class="muted">— ${esc(h.qui)}</span></span></li>`).join("")}</ul></div></section>`;
};

VIEWS.factures=function(){
  const f=S.filters.fac||"fournisseur", t=todayISO();
  let fs=list("factures").filter(x=>x.sens===f).sort((a,b)=>a.echeance<b.echeance?-1:1);
  const ouvertes=fs.filter(x=>x.montant>(x.paye||0)&&x.statut!=="Rejetée"), echues=ouvertes.filter(x=>x.echeance<t);
  const sum=a=>a.reduce((s,x)=>s+x.montant-(x.paye||0),0);
  return `<div class="toolbar"><div class="seg"><button data-act="filt" data-k="fac" data-v="fournisseur" class="${f==="fournisseur"?"on":""}">Fournisseurs</button><button data-act="filt" data-k="fac" data-v="client" class="${f==="client"?"on":""}">Clients</button></div><span class="grow"></span>
   <button class="btn pri" data-act="newFacture" data-sens="${f}">${icon("plus")}${f==="client"?"Émettre une facture":"Enregistrer une facture"}</button></div>
  <section class="grid g3"><div class="tile"><span class="lbl">${f==="client"?"Reste à encaisser":"Reste à payer"}</span><span class="val">${fm(sum(ouvertes))}</span><span class="meta">${ouvertes.length} factures ouvertes</span></div>
   <div class="tile"><span class="lbl">Échues</span><span class="val ${echues.length?"bad-t":""}">${fm(sum(echues))}</span><span class="meta">${echues.length} factures</span></div>
   <div class="tile"><span class="lbl">${f==="client"?"Délai moyen de paiement accordé":"Seuil de validation DG"}</span><span class="val">${f==="client"?Math.round(fs.reduce((a,x)=>a+daysBetween(x.dateEmission,x.echeance),0)/(fs.length||1))+" j":fm(cfg().seuils.SF)}</span><span class="meta">${f==="client"?"entre émission et échéance":"circuit : chef de projet (service fait) → RAF → DG"}</span></div></section>
  <div class="panel"><div class="body flush tbl-wrap"><table class="tbl"><thead><tr><th>N°</th><th>${f==="client"?"Client":"Fournisseur"}</th><th>Libellé</th><th>Projet</th><th class="r">Montant</th><th class="r">Payé</th><th>Échéance</th><th>${f==="client"?"Statut":"Circuit"}</th><th></th></tr></thead><tbody>
  ${fs.map(x=>{const late=x.montant>(x.paye||0)&&x.echeance<t&&x.statut!=="Rejetée";const er=etapeFacture(x);
   return `<tr><td class="num">${esc(x.numero)}</td><td>${esc(x.tiers)}</td><td>${esc(x.libelle)}</td><td>${x.projetId?`<a href="#projet-${x.projetId}">${esc(projetNom(x.projetId))}</a>`:"—"}</td><td class="r num">${fmt(x.montant)}</td><td class="r num">${fmt(x.paye||0)}</td><td class="num ${late?"bad-t":""}">${dfr(x.echeance)}${late?" · "+daysBetween(x.echeance,t)+" j":""}</td>
   <td>${f==="fournisseur"&&x.statut==="À valider"?`<span class="steps">${circuitFacture(x).map((c,i)=>`<span class="step ${i<x.etape?"done":i===x.etape?"cur":""}">${c}</span>`).join('<span class="arrow">›</span>')}</span>`:statutPill(x.statut)}</td>
   <td class="r"><span class="row" style="gap:4px;flex-wrap:nowrap;justify-content:flex-end">${er===S.role?`<button class="btn sm ok" data-act="validerFacture" data-id="${x.id}">${x.etape===0&&x.projetId?"Service fait":"Valider"}</button><button class="btn sm bad" data-act="rejeterFacture" data-id="${x.id}">Rejeter</button>`:""}
   ${f==="fournisseur"&&x.statut==="Validée"&&["DAF","DG"].includes(S.role)?`<button class="btn sm pri" data-act="payerFacture" data-id="${x.id}">Payer</button>`:""}
   ${f==="client"&&x.montant>(x.paye||0)&&["DAF","DG"].includes(S.role)?`<button class="btn sm pri" data-act="encaisser" data-id="${x.id}">Encaisser</button>`:""}</span></td></tr>`}).join("")||`<tr><td colspan="9" class="empty">Aucune facture.</td></tr>`}
  </tbody></table></div></div>`;
};

VIEWS.tresorerie=function(){
  const c=cfg(), cs=list("comptes"), dispo=tresoDispo(), proj=projection(13), t=todayISO();
  const mv=list("mouvements").sort((a,b)=>a.date<b.date?1:-1);
  const f=S.filters.mv||"Réalisé";
  const shown=mv.filter(m=>f==="Tous"||m.statut===f||(f==="Non rapprochés"&&m.statut==="Réalisé"&&!m.rapproche));
  const nr=mv.filter(m=>m.statut==="Réalisé"&&!m.rapproche);
  const enc30=fluxPrevus(0,30);
  return `<div class="toolbar"><span class="grow"></span><button class="btn" data-act="newMouvement" data-statut="Prévu">${icon("plus")}Prévision</button><button class="btn pri" data-act="newMouvement" data-statut="Réalisé">${icon("plus")}Mouvement réalisé</button></div>
  <section class="grid g4"><div class="tile accent"><span class="lbl">Disponible aujourd'hui</span><span class="val">${fm(dispo)}<small>FCFA</small></span><span class="meta">${cs.length} comptes</span></div>
   <div class="tile"><span class="lbl">Flux nets à 30 jours</span><span class="val ${enc30<0?"bad-t":"ok-t"}">${enc30>0?"+":""}${fm(enc30)}</span><span class="meta">prévisions + échéances factures</span></div>
   <div class="tile"><span class="lbl">Point bas sur 13 semaines</span><span class="val ${Math.min(...proj.map(p=>p.v))<c.seuilTresorerie?"bad-t":""}">${fm(Math.min(...proj.map(p=>p.v)))}</span><span class="meta">seuil d'alerte ${fm(c.seuilTresorerie)}</span></div>
   <div class="tile"><span class="lbl">À rapprocher</span><span class="val">${nr.length}</span><span class="meta">${fm(nr.reduce((a,m)=>a+Math.abs(m.montant),0))} FCFA de mouvements</span></div></section>
  <section class="grid g-7-5"><div class="panel"><header><h2>Projection sur 13 semaines</h2></header><div class="body">${chartTreso(proj,c.seuilTresorerie)}</div></div>
   <div class="panel"><header><h2>Soldes par compte</h2></header><div class="body flush"><table class="tbl"><tbody>${cs.map(cp=>`<tr><td><div class="t1">${esc(cp.nom)}</div><div class="t2">${esc(cp.type)}</div></td><td class="r num">${fmt(soldeCompte(cp))}</td></tr>`).join("")}<tr><td><b>Total</b></td><td class="r num"><b>${fmt(dispo)}</b></td></tr></tbody></table></div></div></section>
  <div class="panel"><header><h2>Mouvements</h2><span class="right"><span class="seg">${["Réalisé","Prévu","Non rapprochés","Tous"].map(x=>`<button data-act="filt" data-k="mv" data-v="${x}" class="${f===x?"on":""}">${x}</button>`).join("")}</span></span></header>
  <div class="body flush tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>Libellé</th><th>Compte</th><th>Catégorie</th><th class="r">Montant</th><th>Rapprochement</th></tr></thead><tbody>
  ${shown.map(m=>{const cp=get("comptes",m.compteId);return `<tr><td class="num">${dfr(m.date)}</td><td>${esc(m.libelle)}</td><td>${esc(cp?cp.nom:"—")}</td><td><span class="pill">${esc(m.categorie)}</span></td><td class="r num ${m.montant<0?"bad-t":"ok-t"}">${m.montant>0?"+":""}${fmt(m.montant)}</td>
   <td>${m.statut==="Prévu"?statutPill("Prévu")+(m.date<=t?` <button class="btn sm" data-act="realiser" data-id="${m.id}">Constater</button>`:""):m.rapproche?'<span class="pill ok">Rapproché</span>':(["DAF","DG"].includes(S.role)?`<button class="btn sm" data-act="rapprocher" data-id="${m.id}">Rapprocher</button>`:'<span class="pill warn">À rapprocher</span>')}</td></tr>`}).join("")||`<tr><td colspan="6" class="empty">Aucun mouvement.</td></tr>`}
  </tbody></table></div></div>`;
};

VIEWS.flotte=function(){
  const F=flotteStats(), f=S.filters.fl||"Tous", q=(S.filters.flq||"").toLowerCase();
  let es=list("engins").filter(e=>f==="Tous"||e.statut===f).sort((a,b)=>a.code<b.code?-1:1);
  if(q) es=es.filter(e=>(e.code+e.type+e.marque+e.immat+e.chauffeur+e.localisation).toLowerCase().includes(q));
  const cout=list("engins").reduce((a,e)=>a+(e.coutMois||0),0);
  return `<section class="grid g4"><div class="tile accent"><span class="lbl">Disponibilité</span><span class="val">${pct(F.tauxDispo)}</span><span class="meta">${F.op} opérationnels / ${F.total}</span></div>
   <div class="tile"><span class="lbl">Utilisation</span><span class="val">${pct(F.tauxUtil)}</span><span class="meta">${F.mission} en mission</span></div>
   <div class="tile"><span class="lbl">Immobilisés</span><span class="val ${F.panne?"bad-t":""}">${F.panne+F.entretien}</span><span class="meta">${F.panne} pannes · ${F.entretien} entretiens</span></div>
   <div class="tile"><span class="lbl">Coût d'exploitation mensuel</span><span class="val">${fm(cout)}</span><span class="meta">carburant, pièces, entretien</span></div></section>
  <div class="toolbar"><div class="seg">${["Tous","Disponible","En mission","En entretien","En panne"].map(x=>`<button data-act="filt" data-k="fl" data-v="${x}" class="${f===x?"on":""}">${x}</button>`).join("")}</div><input class="search" id="flq" placeholder="Code, type, chauffeur…" value="${esc(S.filters.flq||"")}" data-input="flq"><span class="grow"></span>${["PARC","DT","DG"].includes(S.role)?`<button class="btn pri" data-act="newEngin">${icon("plus")}Ajouter un engin</button>`:""}</div>
  <div class="panel"><div class="body flush tbl-wrap"><table class="tbl"><thead><tr><th>Code</th><th>Type</th><th>Immatriculation</th><th>Statut</th><th>Affectation</th><th>Chauffeur</th><th>Localisation</th><th class="r">Compteur</th><th>Entretien</th></tr></thead><tbody>
  ${es.map(e=>`<tr class="click" data-href="#engin-${e.id}"><td><b>${esc(e.code)}</b></td><td>${esc(e.type)}<div class="t2">${esc(e.marque)}</div></td><td class="num">${esc(e.immat)}</td><td>${statutPill(e.statut)}</td><td>${e.affectation?esc(projetNom(e.affectation)):"—"}</td><td>${esc(e.chauffeur)}</td><td>${esc(e.localisation)}</td><td class="r num">${fmt(e.compteur)} ${e.unite}</td><td>${entretienDu(e)?'<span class="pill bad">Dépassé</span>':entretienProche(e)?'<span class="pill warn">Proche</span>':'<span class="pill ok">OK</span>'}</td></tr>`).join("")||`<tr><td colspan="9" class="empty">Aucun engin.</td></tr>`}
  </tbody></table></div></div>`;
};

VIEWS.engin=function(id){
  const e=get("engins",id); if(!e) return `<div class="empty">Engin introuvable. <a href="#flotte">Retour</a></div>`;
  const can=["PARC","DT","DG"].includes(S.role);
  const missions=list("interventions").filter(v=>v.enginId===e.id).sort((a,b)=>a.date<b.date?1:-1).slice(0,8);
  return `<div class="toolbar"><a class="btn sm" href="#flotte">${icon("back")}Flotte</a><span class="grow"></span>${can?`<button class="btn pri" data-act="enginStatut" data-id="${e.id}">Changer statut / affectation</button><button class="btn" data-act="compteur" data-id="${e.id}">Relever le compteur</button>`:""}</div>
  <section class="panel"><header><h2>${esc(e.code)} — ${esc(e.type)}</h2><span class="right">${statutPill(e.statut)}</span></header>
  <div class="body grid g2"><dl class="kv"><dt>Marque / modèle</dt><dd>${esc(e.marque)}</dd><dt>Immatriculation</dt><dd>${esc(e.immat)}</dd><dt>Affectation</dt><dd>${e.affectation?(get("projets",e.affectation)?`<a href="#projet-${e.affectation}">${esc(projetNom(e.affectation))}</a>`:esc(projetNom(e.affectation))):"—"}</dd><dt>Chauffeur / opérateur</dt><dd>${esc(e.chauffeur)}</dd><dt>Localisation</dt><dd>${esc(e.localisation)}</dd><dt>Statut depuis</dt><dd>${dfr(e.depuis)} (${daysBetween(e.depuis,todayISO())} j)</dd>${e.panne&&(e.statut==="En panne"||e.statut==="En entretien")?`<dt>Motif</dt><dd>${esc(e.panne)}</dd>`:""}</dl>
   <dl class="kv"><dt>Compteur</dt><dd class="num">${fmt(e.compteur)} ${e.unite}</dd><dt>Prochain entretien</dt><dd class="num">${fmt(e.prochainEntretien)} ${e.unite} ${entretienDu(e)?'<span class="pill bad">Dépassé</span>':entretienProche(e)?'<span class="pill warn">Proche</span>':""}</dd><dt>Coût mensuel</dt><dd class="num">${fcfa(e.coutMois||0)}</dd></dl></div></section>
  <section class="grid g2"><div class="panel"><header><h2>Historique</h2></header><div class="body"><ul class="hist">${[...(e.hist||[])].reverse().map(h=>`<li><span class="d">${dfr(h.d)}</span><span>${esc(h.quoi)} <span class="muted">— ${esc(h.qui)}</span></span></li>`).join("")||'<li class="muted">Aucun événement enregistré.</li>'}</ul></div></div>
   <div class="panel"><header><h2>Dernières vidanges</h2></header><div class="body flush"><table class="tbl"><tbody>${missions.map(v=>`<tr><td class="num">${dfr(v.date)}</td><td>${esc(v.client)}</td><td>${statutPill(v.statut)}</td></tr>`).join("")||`<tr><td class="empty">Aucune intervention de vidange.</td></tr>`}</tbody></table></div></div></section>`;
};

VIEWS.vidange=function(){
  const vs=list("interventions").sort((a,b)=>a.date===b.date?(a.num<b.num?1:-1):(a.date<b.date?1:-1)), t=todayISO();
  const jour=vs.filter(v=>v.date===t), ca=vs.filter(v=>v.statut==="Terminée").reduce((a,v)=>a+v.prix,0);
  const camions=list("engins").filter(e=>/vidange/i.test(e.type));
  return `<section class="grid g4"><div class="tile accent"><span class="lbl">Interventions du jour</span><span class="val">${jour.length}</span><span class="meta">${jour.filter(v=>v.statut==="Terminée").length} terminées</span></div>
   <div class="tile"><span class="lbl">Nouvelles demandes</span><span class="val ${vs.filter(v=>v.statut==="Nouvelle").length?"warn-t":""}">${vs.filter(v=>v.statut==="Nouvelle").length}</span><span class="meta">à planifier</span></div>
   <div class="tile"><span class="lbl">Camions de vidange</span><span class="val">${camions.filter(e=>e.statut==="Disponible").length}<small>libres / ${camions.length}</small></span><span class="meta">${camions.filter(e=>e.statut==="En mission").length} en intervention</span></div>
   <div class="tile"><span class="lbl">Chiffre d'affaires réalisé</span><span class="val">${fm(ca)}</span><span class="meta">${vs.filter(v=>v.statut==="Terminée"&&!v.paye).length} non encaissées</span></div></section>
  <div class="toolbar"><span class="muted" style="font-size:13px">Tarif : forfait domicile 2 000 + attente 5 000 + 1 500 FCFA/m³ + 500 FCFA/km jusqu'à la station</span><span class="grow"></span><button class="btn pri" data-act="newVidange">${icon("plus")}Nouvelle demande</button></div>
  <div class="panel"><div class="body flush tbl-wrap"><table class="tbl"><thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Adresse</th><th class="r">Volume</th><th class="r">Prix</th><th>Camion</th><th>Paiement</th><th>Statut</th><th></th></tr></thead><tbody>
  ${vs.map(v=>{const e=get("engins",v.enginId);return `<tr><td class="num">${esc(v.num)}</td><td class="num">${dfr(v.date)}</td><td>${esc(v.client)}<div class="t2">${esc(v.tel)}</div></td><td>${esc(v.quartier)}<div class="t2">${esc(v.ville)}</div></td><td class="r num">${v.volume} m³</td><td class="r num">${fmt(v.prix)}</td><td>${e?esc(e.code):"—"}</td><td>${esc(v.paiement)} ${v.paye?'<span class="pill ok">payé</span>':""}</td><td>${statutPill(v.statut)}</td>
   <td class="r"><span class="row" style="gap:4px;flex-wrap:nowrap;justify-content:flex-end">${v.statut==="Nouvelle"?`<button class="btn sm pri" data-act="planifier" data-id="${v.id}">Planifier</button>`:""}${v.statut==="Planifiée"?`<button class="btn sm" data-act="vidStatut" data-id="${v.id}" data-v="En cours">Démarrer</button>`:""}${v.statut==="En cours"?`<button class="btn sm ok" data-act="vidStatut" data-id="${v.id}" data-v="Terminée">Terminer</button>`:""}${v.statut==="Terminée"&&!v.paye?`<button class="btn sm" data-act="vidPaye" data-id="${v.id}">Encaisser</button>`:""}</span></td></tr>`}).join("")||`<tr><td colspan="10" class="empty">Aucune demande.</td></tr>`}
  </tbody></table></div></div>`;
};

VIEWS.parametres=function(){
  const c=cfg(), s=c.seuils, isDG=["DG","DAF"].includes(S.role);
  return `<section class="grid g2"><div class="panel"><header><h2>Seuils du circuit de validation</h2><span class="hint">FCFA</span></header><div class="body">
   <form id="fSeuils" class="stack" data-form="seuils"><div class="fg">
   ${[["S0","S0 — exécution directe en dessous de"],["S1","S1 — N+1 seul en dessous de"],["S2","S2 — N+1 + DAF en dessous de"],["S3","S3 — + DG en dessous de (au-delà : N4)"],["SF","SF — factures fournisseurs : DG au-delà de"]].map(([k,l])=>`<div class="fld"><label for="s_${k}">${l}</label><input id="s_${k}" name="${k}" type="number" min="0" step="1000" value="${s[k]}" ${isDG?"":"disabled"}></div>`).join("")}
   <div class="fld"><label for="s_tr">Seuil d'alerte trésorerie</label><input id="s_tr" name="seuilTresorerie" type="number" min="0" step="1000000" value="${c.seuilTresorerie}" ${isDG?"":"disabled"}></div>
   <div class="fld"><label for="s_sla">Délai de traitement cible (heures)</label><input id="s_sla" name="slaHeures" type="number" min="1" value="${c.slaHeures}" ${isDG?"":"disabled"}></div></div>
   ${isDG?`<div><button class="btn pri" type="submit">Enregistrer les seuils</button></div>`:`<p class="muted" style="margin:0">Seuls le DG et le DAF modifient les seuils.</p>`}</form></div></div>
   <div class="panel"><header><h2>Espace de test</h2></header><div class="body stack">
    <p style="margin:0">Mode de stockage : <b>${S.mode==="db"?"base partagée entre les testeurs":"démo locale (ce navigateur uniquement)"}</b>.</p>
    <p class="muted" style="margin:0;font-size:13.5px">Le sélecteur « Profil de test » en haut simule chaque rôle de l'organigramme VICAS pour éprouver les circuits de validation. Dans la version de production, le profil sera lié au compte unique de chaque agent (SSO).</p>
    <div class="row"><button class="btn" data-act="exportJson">Copier les données (JSON)</button>
    ${S.mode==="local"?`<button class="btn bad" data-act="resetLocal">Réinitialiser la démo locale</button>`:(S.canWrite?`<button class="btn bad" data-act="resetDb">Recharger les données de démonstration</button>`:"")}</div>
    <h3 class="sec">Thème</h3><div class="seg">${[["","Système"],["light","Clair"],["dark","Sombre"]].map(([k,l])=>`<button data-act="theme" data-v="${k}" class="${(ls.get(LS_THEME)||"")===k?"on":""}">${l}</button>`).join("")}</div>
   </div></div></section>
   <div class="panel"><header><h2>Rôles et circuits</h2></header><div class="body flush tbl-wrap"><table class="tbl"><thead><tr><th>Code</th><th>Rôle</th><th>Titulaire (test)</th><th>Valide</th></tr></thead><tbody>
   ${Object.entries(ROLES).map(([k,r])=>`<tr><td><b>${k}</b></td><td>${esc(r.lib)}</td><td>${esc(r.nom)}</td><td class="muted" style="font-size:13px">${{DG:"N3, N4, factures > SF, avenants",DAF:"N2 à N4, avances, factures, paiements, rapprochement",DT:"N+1 Exploitation, N4 avenants",CP:"N+1 Chantiers, service fait",PARC:"N+1 Parc, statut engins",ACH:"N+1 Achats, exécution des achats",COM:"N+1 Commercial, offres",RH:"N+1 RH, congés, avances",AGENT:"Crée des requêtes"}[k]}</td></tr>`).join("")}</tbody></table></div></div>`;
};

/* ---------- modales ---------- */
let modalSubmit=null;
function openModal(title,body,onSubmit,okLabel){
  closeModal();
  const ov=document.createElement("div");ov.className="ov";ov.id="ov";
  ov.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><header><h3 id="mt">${esc(title)}</h3><button class="btn sm" type="button" data-act="close" aria-label="Fermer">${icon("x")}</button></header>
  <form id="mform" novalidate><div class="mb">${body}</div><footer><button class="btn" type="button" data-act="close">Annuler</button><button class="btn pri" type="submit">${esc(okLabel||"Enregistrer")}</button></footer></form></div>`;
  document.body.appendChild(ov); modalSubmit=onSubmit;
  const first=ov.querySelector("input:not([type=hidden]),select,textarea"); if(first) first.focus();
  ov.addEventListener("mousedown",e=>{if(e.target===ov)closeModal()});
}
function closeModal(){const o=$("#ov");if(o)o.remove();modalSubmit=null}
function confirmBox(title,msg,ok,fn){openModal(title,`<p style="margin:0">${msg}</p>`,()=>{fn();return true},ok)}
const fld=(id,label,input,full,help)=>`<div class="fld ${full?"full":""}"><label for="${id}">${label}</label>${input}${help?`<span class="help">${help}</span>`:""}</div>`;
const inp=(id,type,val,extra)=>`<input id="${id}" name="${id}" type="${type}" value="${esc(val==null?"":val)}" ${extra||""}>`;
const sel=(id,opts,val)=>`<select id="${id}" name="${id}">${opts.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${String(v)===String(val)?"selected":""}>${esc(l)}</option>`}).join("")}</select>`;
const projOpts=(withNone)=>[...(withNone?[["","— Aucun —"]]:[]),...list("projets").filter(p=>p.statut!=="Clôturé").map(p=>[p.id,p.code+" — "+p.intitule.slice(0,50)])];
function formData(f){const o={};new FormData(f).forEach((v,k)=>o[k]=v);return o}
const num=v=>{const n=parseFloat(String(v).replace(/\s/g,"").replace(",","."));return isNaN(n)?0:n};
const H=txt=>({d:todayISO(),qui:actor(),quoi:txt,...(S.uidMe?{uid:S.uidMe}:{})});
const pushH=(doc,txt)=>{doc.hist=[...(doc.hist||[]),H(txt)].slice(-60);return doc};
const clone=o=>JSON.parse(JSON.stringify(o));

/* ---------- actions ---------- */
const ACT={};
ACT.menu=()=>{const r=$("#rail");r.classList.toggle("open");if(r.classList.contains("open")){const s=document.createElement("div");s.className="scrim";s.id="scrim";s.onclick=()=>{r.classList.remove("open");s.remove()};document.body.appendChild(s)}};
ACT.close=closeModal;
ACT.seed=seedDb;
ACT.filt=d=>{S.filters[d.k]=d.v;render()};
ACT.theme=d=>{if(d.v)ls.set(LS_THEME,d.v);else ls.del(LS_THEME);applyTheme();render()};
ACT.exportJson=()=>{const txt=JSON.stringify(S.data,null,1);if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(()=>toast("Données copiées dans le presse-papiers."),()=>showText(txt))}else showText(txt)};
function showText(txt){openModal("Données JSON",`<textarea id="jsonout" style="width:100%;min-height:260px;font-family:var(--f-mono);font-size:12px" readonly>${esc(txt)}</textarea>`,()=>true,"Fermer");setTimeout(()=>{const t=$("#jsonout");if(t){t.focus();t.select()}},50)}
ACT.resetLocal=()=>confirmBox("Réinitialiser la démo","Toutes les modifications faites dans ce navigateur seront remplacées par le jeu de démonstration.","Réinitialiser",()=>{loadDemoInto(S.data);saveLocal();render();toast("Démo réinitialisée.")});
ACT.resetDb=()=>confirmBox("Recharger la démonstration","Les données de démonstration seront réécrites dans la base partagée pour tous les testeurs. Les éléments créés pendant les tests sont conservés.","Recharger",seedDb);

ACT.newProjet=()=>projetForm();
ACT.editProjet=d=>projetForm(get("projets",d.id));
function projetForm(p){
  const n=!p; p=p||{code:"P-"+todayISO().slice(0,4)+"-0"+(list("projets").length+20),statut:"En cours",type:"Assainissement",dateDebut:todayISO(),dateFin:addDays(todayISO(),365),avancement:0,depenses:0,facture:0,encaisse:0,montant:0,avenants:0};
  openModal(n?"Nouveau marché":"Modifier "+p.code,`<div class="fg">
   ${fld("code","Référence",inp("code","text",p.code,"required"))}${fld("client","Client / maître d'ouvrage",inp("client","text",p.client,"required"))}
   ${fld("intitule","Intitulé du marché",inp("intitule","text",p.intitule,"required"),true)}
   ${fld("type","Activité",sel("type",["Assainissement","BTP","Exploitation","Huiles usagées","Valorisation des boues"],p.type))}${fld("localite","Localité",inp("localite","text",p.localite))}
   ${fld("chef","Chef de projet",inp("chef","text",p.chef))}${fld("statut","Statut",sel("statut",["En cours","Suspendu","Réception provisoire","Clôturé"],p.statut))}
   ${fld("montant","Montant du marché (FCFA HT)",inp("montant","number",p.montant,"min=0 step=1000 required"))}${fld("depenses","Dépenses engagées (FCFA)",inp("depenses","number",p.depenses,"min=0 step=1000"))}
   ${fld("dateDebut","Date de démarrage",inp("dateDebut","date",p.dateDebut))}${fld("dateFin","Date de fin contractuelle",inp("dateFin","date",p.dateFin))}</div>`,
  f=>{if(!f.intitule||!f.client||!num(f.montant))return"Renseignez l'intitulé, le client et le montant.";
    const doc=Object.assign(clone(p),{code:f.code,client:f.client,intitule:f.intitule,type:f.type,localite:f.localite,chef:f.chef,statut:f.statut,montant:num(f.montant),depenses:num(f.depenses),dateDebut:f.dateDebut,dateFin:f.dateFin});
    if(n){doc.id=uid("p");doc.jalons=[];doc.histAv=[[todayISO(),0]];doc.hist=[];pushH(doc,"Marché créé")}else pushH(doc,"Fiche modifiée");
    Store.put("projets",doc);if(n)location.hash="#projet-"+doc.id;toast(n?"Marché créé.":"Marché mis à jour.");return true});
}
ACT.avancement=d=>{const p=get("projets",d.id);openModal("Avancement — "+p.code,`<div class="fg">
  ${fld("av","Avancement physique (%)",inp("av","number",p.avancement,"min=0 max=100 step=1"))}${fld("dep","Dépenses engagées cumulées (FCFA)",inp("dep","number",p.depenses,"min=0 step=1000"))}
  ${fld("com","Commentaire de situation",`<textarea id="com" name="com" placeholder="Ex. : coulage du radier du bassin 2 terminé"></textarea>`,true)}</div>`,
  f=>{const doc=clone(p),av=clamp(num(f.av),0,100);doc.avancement=av;doc.depenses=num(f.dep);doc.histAv=[...(doc.histAv||[]).filter(x=>x[0]!==todayISO()),[todayISO(),av]].slice(-24);pushH(doc,`Avancement porté à ${av} %`+(f.com?" — "+f.com:""));Store.put("projets",doc);toast("Avancement enregistré.");return true})};
ACT.jalon=d=>{const p=clone(get("projets",d.id));p.jalons[+d.i].f=true;pushH(p,"Jalon atteint : "+p.jalons[+d.i].n);Store.put("projets",p);toast("Jalon marqué atteint.")};
ACT.avenant=d=>{const p=get("projets",d.id);openModal("Demande d'avenant — "+p.code,`<div class="fg">
  ${fld("obj","Objet de l'avenant",inp("obj","text","","required"),true)}${fld("mt","Incidence financière (FCFA)",inp("mt","number",0,"min=0 step=1000"))}${fld("jours","Prolongation de délai (jours)",inp("jours","number",0,"min=0"))}</div>
  <div class="calc">Un avenant suit toujours le circuit N4 : Directeur technique → DAF → Président/DG.</div>`,
  f=>{if(!f.obj)return"Précisez l'objet de l'avenant.";const r=newReq({type:"Avenant projet",objet:f.obj+(num(f.jours)?` (+${num(f.jours)} j)`:""),montant:num(f.mt),projetId:p.id,service:"Chantiers",avenantJours:num(f.jours)});Store.put("requetes",r);toast("Avenant soumis au circuit N4.");return true})};

ACT.newOffre=()=>openModal("Nouvelle offre",`<div class="fg">${fld("ref","Référence de l'avis",inp("ref","text","","required"))}${fld("client","Client",inp("client","text","","required"))}
  ${fld("intitule","Intitulé",inp("intitule","text","","required"),true)}${fld("montant","Montant de l'offre (FCFA)",inp("montant","number","","min=0 step=1000"))}${fld("dateLimite","Date limite de dépôt",inp("dateLimite","date",addDays(todayISO(),14)))}
  ${fld("responsable","Responsable",inp("responsable","text",me().nom))}${fld("probabilite","Probabilité de gain (%)",inp("probabilite","number",40,"min=0 max=100"))}</div>`,
  f=>{if(!f.intitule||!f.client)return"Renseignez l'intitulé et le client.";const o={id:uid("o"),ref:f.ref,client:f.client,intitule:f.intitule,montant:num(f.montant),dateLimite:f.dateLimite,statut:"En préparation",responsable:f.responsable,probabilite:num(f.probabilite),hist:[]};pushH(o,"Offre créée");Store.put("offres",o);toast("Offre enregistrée.");return true});
ACT.offreStatut=d=>{const o=clone(get("offres",d.id));o.statut=d.v;if(d.v==="Gagnée")o.probabilite=100;if(d.v==="Perdue")o.probabilite=0;pushH(o,"Statut : "+d.v);Store.put("offres",o);toast("Offre : "+d.v.toLowerCase()+".")};
ACT.offreProjet=d=>{const o=get("offres",d.id);const p={id:uid("p"),code:"P-"+todayISO().slice(0,4)+"-"+String(30+list("projets").length),intitule:o.intitule,client:o.client,type:"Exploitation",localite:"",chef:"",montant:o.montant,avenants:0,dateDebut:addDays(todayISO(),15),dateFin:addDays(todayISO(),380),avancement:0,depenses:0,facture:0,encaisse:0,statut:"En cours",risque:"Faible",jalons:[],histAv:[[todayISO(),0]],hist:[]};pushH(p,"Marché créé depuis l'offre "+o.ref);Store.put("projets",p);const oo=clone(o);oo.projetId=p.id;Store.put("offres",oo);location.hash="#projet-"+p.id;toast("Marché créé : complétez la fiche.")};

function newReq(x){const r=Object.assign({id:uid("r"),num:"RQ-"+String(1100+list("requetes").length),demandeur:me().nom,service:x.service||"Exploitation",date:todayISO(),creeLe:new Date().toISOString(),etape:0,statut:"En attente",motif:"",hist:[]},x);pushH(r,"Demande créée");
  if(!circuit(r).length){r.statut="Validée";pushH(r,"Niveau N0 : exécution directe sans validation")} return r}
ACT.newReq=()=>{const svcDef={DG:"Direction",DAF:"Finances",DT:"Exploitation",CP:"Chantiers",PARC:"Parc",ACH:"Achats",COM:"Commercial",RH:"RH",AGENT:"Exploitation"}[S.role];
  openModal("Nouvelle requête",`<div class="fg">${fld("type","Type de demande",sel("type",REQ_TYPES,"Fournitures"))}${fld("service","Service du demandeur",sel("service",Object.keys(SERVICES),svcDef))}
   ${fld("objet","Objet",inp("objet","text","","required"),true)}${fld("montant","Montant estimé (FCFA)",inp("montant","number",0,"min=0 step=500"))}${fld("projetId","Imputation projet",sel("projetId",projOpts(true),""))}</div>
   <div class="calc" id="circ">—</div>`,
   f=>{if(!f.objet)return"Décrivez l'objet de la demande.";const r=newReq({type:f.type,service:f.service,objet:f.objet,montant:num(f.montant),projetId:f.projetId});Store.put("requetes",r);toast(r.statut==="Validée"?"Demande N0 : transmise directement pour exécution.":"Demande transmise à "+ROLES[etapeRole(r)].lib+".");return true},"Soumettre");
  const upd=()=>{const f=formData($("#mform"));const r={type:f.type,service:f.service,montant:num(f.montant)};const c=circuit(r);$("#circ").innerHTML=`Niveau <b>N${niveau(r)}</b> — circuit : ${c.length?c.map(x=>"<b>"+x+"</b> ("+esc(ROLES[x].lib)+")").join(" → "):"<b>exécution directe</b>, aucune validation"}`};
  $("#mform").addEventListener("input",upd);upd()};
ACT.valider=d=>{const r=clone(get("requetes",d.id)),c=circuit(r);pushH(r,"Validé par "+ROLES[S.role].lib);r.etape++;
  if(r.etape>=c.length){r.statut="Validée";pushH(r,"Circuit complet : demande validée");onReqValidee(r)}
  Store.put("requetes",r);toast(r.statut==="Validée"?"Demande validée.":"Validé : transmis à "+ROLES[c[r.etape]].lib+".")};
function onReqValidee(r){
  if(r.type==="Avenant projet"&&r.projetId){const p=clone(get("projets",r.projetId));if(p){p.avenants=(p.avenants||0)+(r.montant||0);if(r.avenantJours)p.dateFin=addDays(p.dateFin,r.avenantJours);pushH(p,"Avenant approuvé : "+r.objet);Store.put("projets",p)}}
  if(r.type==="Paiement fournisseur"){const m={id:uid("m"),compteId:"c1",date:addDays(todayISO(),3),libelle:r.objet+" ("+r.num+")",montant:-(r.montant||0),categorie:"Fournisseur",statut:"Prévu",rapproche:false};Store.put("mouvements",m)}
}
ACT.rejeter=d=>{const r=get("requetes",d.id);openModal("Rejeter "+r.num,fld("motif","Motif du rejet (communiqué au demandeur)",`<textarea id="motif" name="motif" required></textarea>`,true),f=>{if(!f.motif)return"Le motif est obligatoire.";const x=clone(r);x.statut="Rejetée";x.motif=f.motif;pushH(x,"Rejeté par "+ROLES[S.role].lib+" : "+f.motif);Store.put("requetes",x);toast("Demande rejetée.");return true},"Rejeter")};
ACT.complement=d=>{const r=get("requetes",d.id);openModal("Demander un complément",fld("motif","Précisions attendues",`<textarea id="motif" name="motif" required></textarea>`,true),f=>{if(!f.motif)return"Précisez le complément attendu.";const x=clone(r);x.statut="Complément demandé";x.motif=f.motif;pushH(x,"Complément demandé par "+ROLES[S.role].lib+" : "+f.motif);Store.put("requetes",x);toast("Complément demandé au demandeur.");return true},"Envoyer")};
ACT.relancer=d=>{const x=clone(get("requetes",d.id));x.statut="En attente";pushH(x,"Complément fourni, demande renvoyée");Store.put("requetes",x);toast("Demande renvoyée dans le circuit.")};
ACT.executer=d=>{const x=clone(get("requetes",d.id));x.statut="Exécutée";pushH(x,"Exécution constatée");Store.put("requetes",x);toast("Demande exécutée et clôturée.")};

ACT.newFacture=d=>{const cl=d.sens==="client";openModal(cl?"Émettre une facture client":"Enregistrer une facture fournisseur",`<div class="fg">
  ${fld("numero","N° de facture",inp("numero","text",cl?"FV-"+todayISO().slice(0,4)+"-"+(140+list("factures").length):"","required"))}${fld("tiers",cl?"Client":"Fournisseur",inp("tiers","text","","required"))}
  ${fld("libelle","Libellé",inp("libelle","text",""),true)}${fld("projetId","Projet",sel("projetId",projOpts(!cl),""))}${fld("montant","Montant TTC (FCFA)",inp("montant","number","","min=0 step=1"))}
  ${fld("dateEmission","Date d'émission",inp("dateEmission","date",todayISO()))}${fld("echeance","Échéance",inp("echeance","date",addDays(todayISO(),cl?60:30)))}</div>
  ${cl?"":`<div class="calc">Circuit : chef de projet (service fait, si imputée à un projet) → RAF → DG au-delà de ${fm(cfg().seuils.SF)} FCFA. Contrôle 3 voies : bon de commande, réception, facture.</div>`}`,
  f=>{if(!f.tiers||!num(f.montant))return"Renseignez le tiers et le montant.";const x={id:uid("f"),sens:d.sens,numero:f.numero,tiers:f.tiers,libelle:f.libelle,projetId:f.projetId,montant:num(f.montant),dateEmission:f.dateEmission,echeance:f.echeance,paye:0,statut:cl?"Émise":"À valider",etape:0,hist:[]};pushH(x,cl?"Facture émise":"Facture enregistrée");Store.put("factures",x);
   if(cl&&f.projetId){const p=clone(get("projets",f.projetId));p.facture+=x.montant;pushH(p,"Facture "+x.numero+" émise : "+fm(x.montant));Store.put("projets",p)}
   toast(cl?"Facture émise.":"Facture enregistrée et transmise au circuit.");return true})};
ACT.validerFacture=d=>{const x=clone(get("factures",d.id)),c=circuitFacture(x);pushH(x,(x.etape===0&&x.projetId?"Service fait attesté par ":"Validée par ")+ROLES[S.role].lib);x.etape++;if(x.etape>=c.length){x.statut="Validée";pushH(x,"Bon à payer")}Store.put("factures",x);toast(x.statut==="Validée"?"Facture bonne à payer.":"Transmise à "+ROLES[c[x.etape]].lib+".")};
ACT.rejeterFacture=d=>{const f0=get("factures",d.id);openModal("Rejeter la facture "+f0.numero,fld("motif","Motif",`<textarea id="motif" name="motif" required></textarea>`,true),f=>{if(!f.motif)return"Le motif est obligatoire.";const x=clone(f0);x.statut="Rejetée";pushH(x,"Rejetée : "+f.motif);Store.put("factures",x);toast("Facture rejetée.");return true},"Rejeter")};
ACT.payerFacture=d=>{const f0=get("factures",d.id);openModal("Payer "+f0.numero,`<div class="fg">${fld("compte","Compte de paiement",sel("compte",list("comptes").map(c=>[c.id,c.nom]),"c1"))}${fld("date","Date de paiement",inp("date","date",todayISO()))}</div><div class="calc">Montant : <b>${fcfa(f0.montant-(f0.paye||0))}</b> à ${esc(f0.tiers)}</div>`,
  f=>{const reste=f0.montant-(f0.paye||0);const x=clone(f0);x.paye=x.montant;x.statut="Payée";pushH(x,"Payée");Store.put("factures",x);Store.put("mouvements",{id:uid("m"),compteId:f.compte,date:f.date,libelle:"Paiement "+x.numero+" — "+x.tiers,montant:-reste,categorie:"Fournisseur",statut:"Réalisé",rapproche:false});
   if(x.projetId){const p=get("projets",x.projetId);if(p){const pp=clone(p);pushH(pp,"Facture fournisseur "+x.numero+" payée");Store.put("projets",pp)}}toast("Paiement enregistré.");return true},"Payer")};
ACT.encaisser=d=>{const f0=get("factures",d.id),reste=f0.montant-(f0.paye||0);openModal("Encaissement — "+f0.numero,`<div class="fg">${fld("mt","Montant encaissé (FCFA)",inp("mt","number",reste,"min=1 step=1"))}${fld("compte","Compte crédité",sel("compte",list("comptes").map(c=>[c.id,c.nom]),"c1"))}${fld("date","Date",inp("date","date",todayISO()))}</div>`,
  f=>{const mt=Math.min(num(f.mt),reste);if(mt<=0)return"Montant invalide.";const x=clone(f0);x.paye=(x.paye||0)+mt;x.statut=x.paye>=x.montant?"Payée":"Partiellement payée";pushH(x,"Encaissement de "+fm(mt));Store.put("factures",x);
   Store.put("mouvements",{id:uid("m"),compteId:f.compte,date:f.date,libelle:"Encaissement "+x.numero+" — "+x.tiers,montant:mt,categorie:"Encaissement client",statut:"Réalisé",rapproche:false});
   if(x.projetId){const p=clone(get("projets",x.projetId));p.encaisse+=mt;pushH(p,"Encaissement "+x.numero+" : "+fm(mt));Store.put("projets",p)}toast("Encaissement enregistré.");return true},"Encaisser")};

ACT.newMouvement=d=>{const pr=d.statut==="Prévu";openModal(pr?"Nouvelle prévision":"Nouveau mouvement réalisé",`<div class="fg">
  ${fld("compte","Compte",sel("compte",list("comptes").map(c=>[c.id,c.nom]),"c1"))}${fld("date","Date",inp("date","date",pr?addDays(todayISO(),7):todayISO()))}
  ${fld("libelle","Libellé",inp("libelle","text","","required"),true)}${fld("sens","Sens",sel("sens",[["-1","Décaissement"],["1","Encaissement"]],"-1"))}${fld("montant","Montant (FCFA)",inp("montant","number","","min=1 step=1"))}
  ${fld("categorie","Catégorie",sel("categorie",["Fournisseur","Salaires","Charges sociales","Carburant","Impôts et taxes","Financement","Sous-traitance","Maintenance flotte","Encaissement client","Vidange","Frais généraux","Assurances","Virement interne"],"Fournisseur"))}</div>`,
  f=>{if(!f.libelle||!num(f.montant))return"Renseignez le libellé et le montant.";Store.put("mouvements",{id:uid("m"),compteId:f.compte,date:f.date,libelle:f.libelle,montant:num(f.montant)*num(f.sens),categorie:f.categorie,statut:d.statut,rapproche:false});toast(pr?"Prévision ajoutée.":"Mouvement enregistré.");return true})};
ACT.rapprocher=d=>{const m=clone(get("mouvements",d.id));m.rapproche=true;m.rapprochePar=actor();m.rapprocheLe=todayISO();Store.put("mouvements",m);toast("Mouvement rapproché avec le relevé.")};
ACT.realiser=d=>{const m=clone(get("mouvements",d.id));m.statut="Réalisé";Store.put("mouvements",m);toast("Prévision constatée en réalisé.")};

ACT.newEngin=()=>openModal("Ajouter un engin",`<div class="fg">${fld("code","Code parc",inp("code","text","","required"))}${fld("type","Type",inp("type","text","Hydrocureur"))}${fld("marque","Marque / modèle",inp("marque","text",""))}${fld("immat","Immatriculation",inp("immat","text",""))}
  ${fld("unite","Unité de compteur",sel("unite",[["km","Kilomètres"],["h","Heures moteur"]],"km"))}${fld("compteur","Compteur actuel",inp("compteur","number",0,"min=0"))}${fld("prochain","Prochain entretien à",inp("prochain","number",10000,"min=0"))}${fld("loc","Localisation",inp("loc","text","Dépôt Rufisque"))}</div>`,
  f=>{if(!f.code)return"Le code parc est obligatoire.";const e={id:uid("e"),code:f.code,type:f.type,marque:f.marque,immat:f.immat,statut:"Disponible",affectation:"",chauffeur:"—",compteur:num(f.compteur),unite:f.unite,prochainEntretien:num(f.prochain),localisation:f.loc,depuis:todayISO(),coutMois:0,hist:[]};pushH(e,"Engin ajouté au parc");Store.put("engins",e);toast("Engin ajouté.");return true});
ACT.enginStatut=d=>{const e=get("engins",d.id);openModal("Statut — "+e.code,`<div class="fg">${fld("statut","Statut",sel("statut",["Disponible","En mission","En entretien","En panne"],e.statut))}${fld("aff","Affectation",sel("aff",[["","— Aucune —"],["vidange","Vidange à la demande"],...projOpts(false)],e.affectation))}
  ${fld("chauffeur","Chauffeur / opérateur",inp("chauffeur","text",e.chauffeur))}${fld("loc","Localisation",inp("loc","text",e.localisation))}${fld("motif","Motif (panne ou entretien)",inp("motif","text",e.panne||""),true)}</div>`,
  f=>{const x=clone(e);const chg=x.statut!==f.statut;x.statut=f.statut;x.affectation=f.statut==="En mission"?f.aff:(f.statut==="Disponible"?"":x.affectation);x.chauffeur=f.chauffeur;x.localisation=f.loc;x.panne=f.motif;if(chg)x.depuis=todayISO();pushH(x,"Statut : "+f.statut+(x.affectation?" — "+projetNom(x.affectation):"")+(f.motif&&(f.statut==="En panne"||f.statut==="En entretien")?" ("+f.motif+")":""));
   if(f.statut==="En entretien"&&entretienDu(x)){}Store.put("engins",x);toast("Statut mis à jour.");return true})};
ACT.compteur=d=>{const e=get("engins",d.id);openModal("Relevé compteur — "+e.code,`<div class="fg">${fld("c","Compteur ("+e.unite+")",inp("c","number",e.compteur,"min="+e.compteur))}${fld("p","Prochain entretien à",inp("p","number",e.prochainEntretien,"min=0"))}</div>`,
  f=>{const x=clone(e);x.compteur=Math.max(num(f.c),e.compteur);x.prochainEntretien=num(f.p);pushH(x,"Relevé compteur : "+fmt(x.compteur)+" "+x.unite);Store.put("engins",x);toast("Compteur relevé.");return true})};

ACT.newVidange=()=>{openModal("Nouvelle demande de vidange",`<div class="fg">${fld("client","Nom du client",inp("client","text","","required"))}${fld("tel","Téléphone",inp("tel","tel",""))}
  ${fld("quartier","Quartier / adresse",inp("quartier","text",""))}${fld("ville","Ville",sel("ville",["Dakar","Pikine","Guédiawaye","Rufisque","Thiès","Mbour","Kaolack"],"Dakar"))}
  ${fld("volume","Volume de la fosse (m³)",inp("volume","number",10,"min=1 step=1"))}${fld("distance","Distance jusqu'à la station (km)",inp("distance","number",10,"min=0 step=1"))}
  ${fld("date","Date souhaitée",inp("date","date",addDays(todayISO(),1)))}${fld("paiement","Mode de paiement",sel("paiement",["Wave","Orange Money","Espèces","Facture"],"Wave"))}</div><div class="calc" id="prix">—</div>`,
  f=>{if(!f.client)return"Le nom du client est obligatoire.";const v=num(f.volume),dk=num(f.distance);const x={id:uid("v"),num:"VD-"+String(3300+list("interventions").length),client:f.client,tel:f.tel,quartier:f.quartier,ville:f.ville,volume:v,distance:dk,prix:7000+v*1500+dk*500,date:f.date,statut:"Nouvelle",enginId:"",paiement:f.paiement,paye:false};Store.put("interventions",x);toast("Demande enregistrée.");return true});
  const upd=()=>{const f=formData($("#mform"));const v=num(f.volume),dk=num(f.distance);$("#prix").innerHTML=`Prix : 2 000 + 5 000 + ${v} × 1 500 + ${dk} × 500 = <b>${fcfa(7000+v*1500+dk*500)}</b>`};$("#mform").addEventListener("input",upd);upd()};
ACT.planifier=d=>{const v=get("interventions",d.id);const cam=list("engins").filter(e=>/vidange/i.test(e.type)&&(e.statut==="Disponible"||e.statut==="En mission"));
  openModal("Planifier "+v.num,`<div class="fg">${fld("eng","Camion de vidange",sel("eng",cam.map(e=>[e.id,e.code+" — "+e.type+" ("+e.statut.toLowerCase()+")"]),(cam.find(e=>e.statut==="Disponible")||cam[0]||{}).id))}${fld("date","Date",inp("date","date",v.date))}</div>`,
  f=>{if(!f.eng)return"Aucun camion disponible.";const x=clone(v);x.enginId=f.eng;x.date=f.date;x.statut="Planifiée";Store.put("interventions",x);toast("Intervention planifiée.");return true},"Planifier")};
ACT.vidStatut=d=>{const x=clone(get("interventions",d.id));x.statut=d.v;Store.put("interventions",x);
  const e=get("engins",x.enginId);if(e){const ee=clone(e);if(d.v==="En cours"){ee.statut="En mission";ee.affectation="vidange";ee.localisation=x.quartier}if(d.v==="Terminée"){ee.compteur+=x.distance*2;if(!list("interventions").some(o=>o.id!==x.id&&o.enginId===e.id&&o.statut==="En cours")){ee.statut="Disponible";ee.affectation=""}}pushH(ee,(d.v==="En cours"?"Départ intervention ":"Fin intervention ")+x.num);Store.put("engins",ee)}
  toast("Intervention : "+d.v.toLowerCase()+".")};
ACT.vidPaye=d=>{const x=clone(get("interventions",d.id));x.paye=true;Store.put("interventions",x);const cp={Wave:"c5","Orange Money":"c6","Espèces":"c4",Facture:"c1"}[x.paiement]||"c1";Store.put("mouvements",{id:uid("m"),compteId:cp,date:todayISO(),libelle:"Vidange "+x.num+" — "+x.client,montant:x.prix,categorie:"Vidange",statut:"Réalisé",rapproche:false});toast("Encaissement de la vidange enregistré.")};

/* ---------- événements ---------- */
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-act]");
  if(a){e.preventDefault();e.stopPropagation();const fn=ACT[a.dataset.act];if(fn)fn(a.dataset,a);return}
  const r=e.target.closest("[data-href]");
  if(r&&!e.target.closest("a,button")){location.hash=r.dataset.href}
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape")closeModal();
  if(e.key==="Enter"){const r=e.target.closest&&e.target.closest("[data-href]");if(r&&r===e.target)location.hash=r.dataset.href}
});
document.addEventListener("change",e=>{
  if(e.target.dataset&&e.target.dataset.change==="role"){S.role=e.target.value;ls.set(LS_ROLE,S.role);render();toast("Profil de test : "+ROLES[S.role].lib)}
});
let inputTimer=null;
document.addEventListener("input",e=>{
  const k=e.target.dataset&&e.target.dataset.input;if(!k)return;S.filters[k]=e.target.value;clearTimeout(inputTimer);
  inputTimer=setTimeout(()=>{const pos=e.target.selectionStart;render();const el=document.getElementById(k);if(el){el.focus();try{el.setSelectionRange(pos,pos)}catch(_){}}},220);
});
document.addEventListener("submit",e=>{
  e.preventDefault();
  if(e.target.id==="mform"&&modalSubmit){const res=modalSubmit(formData(e.target));if(res===true)closeModal();else if(typeof res==="string")toast(res);return}
  if(e.target.dataset.form==="seuils"){const f=formData(e.target);const c=clone(cfg());c.id="main";c.seuils={S0:num(f.S0),S1:num(f.S1),S2:num(f.S2),S3:num(f.S3),SF:num(f.SF)};c.seuilTresorerie=num(f.seuilTresorerie);c.slaHeures=num(f.slaHeures)||48;
    if(!(c.seuils.S0<c.seuils.S1&&c.seuils.S1<c.seuils.S2&&c.seuils.S2<c.seuils.S3)){toast("Les seuils doivent être croissants : S0 < S1 < S2 < S3.");return}Store.put("config",c);toast("Seuils enregistrés.")}
});
function route(){
  const h=(location.hash||"#cockpit").slice(1);const m=h.match(/^(projet|engin|requete)-(.+)$/);
  if(m){S.route=m[1];S.param=m[2]}else{S.route=VIEWS[h]?h:"cockpit";S.param=null}
  const r=$("#rail");if(r)r.classList.remove("open");const sc=$("#scrim");if(sc)sc.remove();
  render();window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
let toastT=null;
function toast(msg){let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";t.setAttribute("role","status");document.body.appendChild(t)}t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},3200)}
function applyTheme(){const v=ls.get(LS_THEME);if(v)document.documentElement.setAttribute("data-theme",v);else document.documentElement.removeAttribute("data-theme")}

applyTheme();
const h0=(location.hash||"#cockpit").slice(1);const m0=h0.match(/^(projet|engin|requete)-(.+)$/);if(m0){S.route=m0[1];S.param=m0[2]}else if(VIEWS[h0])S.route=h0;
boot();
window.__VICAS={S,Store,projection,alertes,circuit,niveau};
})();
