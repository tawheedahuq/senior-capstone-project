/*
 * The Prototype Machine: interface.
 * Act 1 (you screen), Act 2 (it learns), Act 3 (it runs). Depends on src/sim.js.
 */
/* ---------- content ---------- */
const NAMES={f:["Amara Okafor","Priya Raman","Sofia Delgado","Hannah Weiss","Mei Lin","Fatima Rahman","Grace Kim","Leila Haddad","Nadia Chowdhury","Emily Carter","Zoe Martin","Ana Souza","Aisha Bello","Clara Novak"],
  m:["Daniel Park","Marcus Reed","Arjun Mehta","Ethan Brooks","Omar Siddiqui","Lucas Rivera","Kwame Mensah","Ryan Walsh","David Cohen","Hiro Tanaka","Mateo Ruiz","Sam Patel","Jonah Fischer","Tariq Hussain"]};
const SCHOOLS={e:["Stanford","MIT","Harvard","Princeton"],o:["Lehigh","Temple","Georgia State","Ohio State","UT El Paso","Rutgers","Arizona State"]};
const CITIES={h:["San Francisco","New York","Boston"],o:["Pittsburgh","Atlanta","Columbus","Bethlehem, PA","Detroit","Phoenix","Raleigh"]};
const PITCHES=["Payroll for restaurant staff paid in tips","AI bookkeeping for one-person businesses","Shared-ownership marketplace for farm equipment","Compliance software for community banks","Remote patient monitoring for rural clinics","Rent reporting that builds tenants' credit","Inventory forecasting for corner stores","Hiring platform for skilled trades","Halal-compliant savings app for students","Carbon accounting for mid-size manufacturers","Claims automation for small insurers","Language tutoring matched to job goals","Freight brokerage for independent truckers","Childcare scheduling for shift workers","Fraud detection for credit unions","Procurement software for school districts"];

let picks=[], deck=[], R=null, seed=0, train=[], cycles=[], cur=0, lens="female", running=false;
const $=id=>document.getElementById(id);
const pickFrom=(r,a)=>a[Math.floor(r()*a.length)];
const growth=f=>Math.max(1,Math.min(38,Math.round(11+6*f.traction)));

function newBatch(){
  seed=(Date.now()^Math.floor(Math.random()*1e9))>>>0; R=rng(seed);
  let d;do{d=[];for(let i=0;i<12;i++)d.push(makeFounder(R,WORLD.applicants));}
  while(d.filter(f=>f.female).length<4||d.filter(f=>f.female).length>8||d.filter(f=>f.elite).length<2||d.filter(f=>f.hub).length<3);
  const used=new Set();const pit=[...PITCHES].sort(()=>R()-.5);
  d.forEach((f,i)=>{const pool=f.female?NAMES.f:NAMES.m;let n;do{n=pickFrom(R,pool);}while(used.has(n));used.add(n);
    f.name=n;f.school=pickFrom(R,f.elite?SCHOOLS.e:SCHOOLS.o);f.city=pickFrom(R,f.hub?CITIES.h:CITIES.o);f.pitch=pit[i];f.g=growth(f);});
  deck=d; picks=[]; renderDeck();
}
function renderDeck(){
  const el=$("deck");el.innerHTML="";
  deck.forEach((f,i)=>{const b=document.createElement("button");b.className="fcard";b.type="button";b.setAttribute("aria-pressed",picks.includes(i));
    b.innerHTML=`<span class="chk"></span><span class="nm"></span><span class="pitch"></span><dl><dt>School</dt><dd class="sc"></dd><dt>Based in</dt><dd class="ci"></dd><dt>Growth</dt><dd class="tr"></dd></dl>`;
    b.querySelector(".nm").textContent=f.name;b.querySelector(".pitch").textContent=f.pitch;b.querySelector(".sc").textContent=f.school;
    b.querySelector(".ci").textContent=f.city;b.querySelector(".tr").textContent=f.g+"% revenue / month";
    b.querySelector(".chk").textContent=picks.includes(i)?"FUNDED":"";
    b.onclick=()=>{const k=picks.indexOf(i);if(k>=0)picks.splice(k,1);else if(picks.length<4)picks.push(i);renderDeck();};
    el.appendChild(b);});
  $("count").textContent=picks.length+" of 4 picked";$("fundBtn").disabled=picks.length!==4;
}
function setAct(n){[1,2,3].forEach(i=>{$("act"+i).hidden=i!==n;$("n"+i).classList.toggle("on",i===n);});window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}

$("fundBtn").onclick=()=>{
  train=[];for(let i=0;i<WORLD.history.n;i++){const f=makeFounder(R,WORLD.history);f.exit=outcome(R,f);train.push(f);}
  picks.forEach(i=>{const f=deck[i];f.exit=outcome(R,f);train.push(f);});
  $("results").innerHTML="";picks.forEach(i=>{const f=deck[i];const d=document.createElement("div");d.className="res";
    d.innerHTML=`<span><strong></strong><br><span class="muted" style="font-size:13px"></span></span><b class="${f.exit?"y":"n"}">${f.exit?"EXITED":"NO EXIT"}</b>`;
    d.querySelector("strong").textContent=f.name;d.querySelector(".muted").textContent=f.school+" · "+f.city;$("results").appendChild(d);});
  $("ghosts").innerHTML="";deck.forEach((f,i)=>{if(picks.includes(i))return;const g=document.createElement("span");g.className="ghost";g.textContent=f.name+" · ?";$("ghosts").appendChild(g);});
  drawProto(prototypeOf(train));setAct(2);
};
function drawProto(p){const el=$("protoBars");el.innerHTML="";
  [["female","Women",WORLD.applicants.female],["elite","Elite school",WORLD.applicants.elite],["hub","Big-3 hub",WORLD.applicants.hub]].forEach(([k,l,base])=>{
    el.insertAdjacentHTML("beforeend",`<span>${l}</span><div class="track"><i style="width:${(p[k]*100).toFixed(0)}%"></i><u style="left:calc(${(base*100).toFixed(0)}% - 1px)"></u></div><span class="num">${Math.round(p[k]*100)}%</span>`);});}

/* ---------- act 3 ---------- */
$("handoff").onclick=()=>{cycles=[];cur=0;setAct(3);$("reveal").hidden=true;$("stepBtn").disabled=false;$("allBtn").disabled=false;
  $("stepBtn").textContent="Run cycle 1";$("cycLabel").textContent="Cycle 0 of 5";$("narr").textContent="Each square below will be one applicant. Filled = funded.";
  ["tTop","tTopW","tTopM","tTopWof","tTopMof"].forEach(id=>$(id).textContent="0");drawField(null);drawChart();};
function runCycle(){
  const proto=prototypeOf(train);const apps=[];for(let i=0;i<WORLD.perCycle.applicants;i++)apps.push(makeFounder(R,WORLD.applicants));
  const tm=apps.reduce((a,f)=>a+f.traction,0)/apps.length,ts=Math.sqrt(apps.reduce((a,f)=>a+(f.traction-tm)**2,0)/apps.length)||1;
  apps.forEach(f=>f.score=WORLD.screener.traction*(f.traction-tm)/ts+WORLD.screener.prototype*similarity(f,proto));
  [...apps].sort((a,b)=>b.score-a.score).forEach((f,i)=>f.funded=i<WORLD.perCycle.funded);
  [...apps].sort((a,b)=>b.q-a.q).forEach((f,i)=>f.top=i<WORLD.perCycle.funded);
  const funded=apps.filter(f=>f.funded);funded.forEach(f=>{f.exit=outcome(R,f);train.push(f);});
  const sh=k=>funded.reduce((a,f)=>a+f[k],0)/funded.length;
  const c={n:cycles.length+1,apps,proto,share:{female:sh("female"),elite:sh("elite"),hub:sh("hub")},
    topF:apps.filter(f=>f.top&&f.funded).length,topW:apps.filter(f=>f.top&&f.female&&f.funded).length,topWof:apps.filter(f=>f.top&&f.female).length,
    topM:apps.filter(f=>f.top&&!f.female&&f.funded).length,topMof:apps.filter(f=>f.top&&!f.female).length};
  cycles.push(c);cur=c.n;return c;
}
const LENS={female:{word:"women",a:"Women",b:"Men"},elite:{word:"from elite schools",a:"Elite school",b:"Other school"},hub:{word:"based in the big-3 hubs",a:"Big-3 hub",b:"Elsewhere"}};
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}
function drawField(c){
  const cv=$("field"),ctx=cv.getContext("2d");const W=cv.width,H=cv.height;ctx.clearRect(0,0,W,H);
  const cols=20,rows=15,gap=4,s=Math.min((W-gap*(cols-1))/cols,(H-gap*(rows-1))/rows);
  const A=css("--g-a"),B=css("--g-b"),faint=css("--faint"),warn=css("--warn");
  const apps=c?[...c.apps].sort((x,y)=>(y[lens]-x[lens])):null;
  for(let i=0;i<cols*rows;i++){const x=(i%cols)*(s+gap),y=Math.floor(i/cols)*(s+gap);
    if(!apps){ctx.strokeStyle=faint;ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,s-1,s-1);continue;}
    const f=apps[i];const col=f[lens]?B:A;
    if(f.funded){ctx.fillStyle=col;ctx.fillRect(x,y,s,s);}
    else{ctx.globalAlpha=.28;ctx.fillStyle=col;ctx.fillRect(x,y,s,s);ctx.globalAlpha=1;}
    if(f.top&&!f.funded){ctx.strokeStyle=warn;ctx.lineWidth=2.5;ctx.strokeRect(x+1.5,y+1.5,s-3,s-3);}}
  const L=LENS[lens];
  $("legend").innerHTML=`<span><i style="background:var(--g-b)"></i>${L.a}</span><span><i style="background:var(--g-a)"></i>${L.b}</span><span><i style="background:var(--faint)"></i>faded = rejected</span><span><i style="border:2px solid var(--warn);width:8px;height:8px"></i>top-30 talent, rejected, never labeled</span>`;
}
function drawChart(){
  const W=420,H=230,pl=40,pr=14,pt=14,pb=30;const base=WORLD.applicants[lens];
  const x=i=>pl+(W-pl-pr)*(i/5),y=v=>pt+(H-pt-pb)*(1-v);
  let g=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart of funded share by cycle" style="width:100%;height:auto">`;
  [0,.25,.5,.75,1].forEach(v=>{g+=`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pl-6}" y="${y(v)+4}" font-size="10" text-anchor="end" fill="var(--muted)">${v*100}%</text>`;});
  for(let i=0;i<=5;i++)g+=`<text x="${x(i)}" y="${H-10}" font-size="10" text-anchor="middle" fill="var(--muted)">${i===0?"history":"C"+i}</text>`;
  g+=`<line x1="${pl}" x2="${W-pr}" y1="${y(base)}" y2="${y(base)}" stroke="var(--ink)" stroke-dasharray="5 4" stroke-width="1.4"/>`;
  const hist=WORLD.history[lens];const pts=[[0,hist],...cycles.map(c=>[c.n,c.share[lens]])];
  g+=`<polyline points="${pts.map(p=>x(p[0])+","+y(p[1])).join(" ")}" fill="none" stroke="var(--machine)" stroke-width="2.5"/>`;
  pts.forEach((p,i)=>{g+=`<circle cx="${x(p[0])}" cy="${y(p[1])}" r="${i===pts.length-1?5:3.5}" fill="var(--machine)"/>`;});
  const last=pts[pts.length-1];g+=`<text x="${Math.min(x(last[0])+8,W-pr-30)}" y="${y(last[1])-9}" font-size="12" fill="var(--machine)">${Math.round(last[1]*100)}%</text>`;
  $("chart").innerHTML=g+"</svg>";$("lensWord").textContent=LENS[lens].word;
}
function narrate(c){
  const w=Math.round(c.share.female*100),h=Math.round(c.share.hub*100);
  const lines={1:`Cycle 1. The screener funds ${w}% women from a pool that's 50% women. Nobody told it to. It learned "winner" from a history where most winners were men.`,
    2:`Cycle 2. The new cohort's exits join the history. It barely moves the picture, because 30 new rows can't outvote hundreds of old ones.`,
    3:`Cycle 3. ${h}% of checks go to the big-3 hubs (40% of applicants). Hub founders exit more often here because of network access, and the model reads that as talent.`,
    4:`Cycle 4. Look at the orange outlines: top-potential founders the model passed on. They'll never produce an outcome, so the model never finds out it was wrong.`,
    5:`Cycle 5. Done. ${w}% women funded. The bias didn't explode, it locked in. The history keeps outvoting the present.`};
  $("narr").textContent=lines[c.n];
}
function step(){
  if(cur>=5)return;const c=runCycle();drawField(c);drawChart();narrate(c);
  const sum=k=>cycles.reduce((a,c)=>a+c[k],0);
  $("tTop").textContent=sum("topF")+" / "+cycles.length*30;$("tTopW").textContent=sum("topW");$("tTopWof").textContent=sum("topWof");
  $("tTopM").textContent=sum("topM");$("tTopMof").textContent=sum("topMof");
  $("cycLabel").textContent="Cycle "+cur+" of 5";
  if(cur<5)$("stepBtn").textContent="Run cycle "+(cur+1);else{$("stepBtn").disabled=true;$("allBtn").disabled=true;showReveal();}
}
$("stepBtn").onclick=()=>{if(!running)step();};
$("allBtn").onclick=()=>{if(running)return;running=true;$("stepBtn").disabled=true;
  const fast=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tick=()=>{step();if(cur<5)setTimeout(tick,fast?0:900);else running=false;};tick();};
document.querySelectorAll(".lens button").forEach(b=>b.onclick=()=>{lens=b.dataset.lens;
  document.querySelectorAll(".lens button").forEach(x=>x.setAttribute("aria-pressed",x===b));drawField(cycles[cycles.length-1]||null);drawChart();});

function showReveal(){
  const P=picks.map(i=>deck[i]);const cnt=(arr,k)=>arr.filter(f=>f[k]).length;
  const rankT=[...deck].sort((a,b)=>b.traction-a.traction);const avgRank=P.reduce((a,f)=>a+rankT.indexOf(f)+1,0)/4;
  $("youLine").textContent=`You funded ${cnt(P,"female")} of the ${cnt(deck,"female")} women, ${cnt(P,"elite")} of the ${cnt(deck,"elite")} elite-school founders, and ${cnt(P,"hub")} of the ${cnt(deck,"hub")} hub-based founders. On traction, your picks ranked ${avgRank.toFixed(1)} of 12 on average (1 = fastest growth).`;
  const best=[...deck].sort((a,b)=>b.q-a.q)[0];const bi=deck.indexOf(best);
  $("missLine").textContent=picks.includes(bi)?`You backed ${best.name}, who had the highest hidden potential in your batch. Nice instincts, or nice luck.`:
    `The founder with the highest hidden potential in your batch was ${best.name} (${best.school}, ${best.city}, ${best.g}% growth). You passed. In the real world you'd never know.`;
  const sum=k=>cycles.reduce((a,c)=>a+c[k],0);
  const wr=sum("topWof")?Math.round(100*sum("topW")/sum("topWof")):0,mr=sum("topMof")?Math.round(100*sum("topM")/sum("topMof")):0;
  $("lockLine").textContent=`Across five cycles the screener funded ${wr}% of the top-talent women it saw and ${mr}% of the top-talent men. Same talent, different odds, and the gap came from the training history, not a rule anyone wrote.`;
  $("reveal").hidden=false;
}
$("again").onclick=()=>{newBatch();setAct(1);};
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{drawField(cycles[cycles.length-1]||null);});
newBatch();drawField(null);drawChart();
