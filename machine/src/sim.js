/*
 * The Prototype Machine: simulation core.
 * Pure functions, no page code. Loaded by index.html and by test/sim.test.js.
 * Every number in WORLD is an illustrative assumption; see MODEL.md.
 */
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function gauss(r){let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
const sig=x=>1/(1+Math.exp(-x));
const WORLD={applicants:{female:0.5,elite:0.25,hub:0.4},history:{n:300,female:0.12,elite:0.6,hub:0.75},
  outcome:{q:1.6,elite:0.7,hub:0.6,base:-1.7},screener:{traction:1.0,prototype:2.4},perCycle:{applicants:300,funded:30},cycles:5};
const makeFounder=(r,mix)=>{const q=gauss(r);return{q,female:r()<mix.female?1:0,elite:r()<mix.elite?1:0,hub:r()<mix.hub?1:0,traction:0.6*q+0.8*gauss(r)};};
const outcome=(r,f)=>{const o=WORLD.outcome;return r()<sig(o.q*f.q+o.elite*f.elite+o.hub*f.hub+o.base)?1:0;};
function prototypeOf(train){const ex=train.filter(t=>t.exit);const n=ex.length||1;const m=k=>ex.reduce((a,t)=>a+t[k],0)/n;return{female:m("female"),elite:m("elite"),hub:m("hub")};}
const similarity=(f,p)=>1-(Math.abs(f.female-p.female)+Math.abs(f.elite-p.elite)+Math.abs(f.hub-p.hub))/3;

/* Exported for the Node test; ignored in the browser. */
if (typeof module !== "undefined") module.exports = { rng, gauss, sig, WORLD, makeFounder, outcome, prototypeOf, similarity };
