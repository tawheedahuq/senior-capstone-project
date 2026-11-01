/*
 * Checks that the simulation still produces the result the page describes.
 * Run with:  node test/sim.test.js
 *
 * It replays Act 3 (five cycles, no human picks) across 200 random seeds and checks:
 *   1. Top-talent women are funded at a lower rate than top-talent men overall.
 *   2. The gap shows up in nearly every run, not just on average.
 *   3. Funding locks in instead of running away: the women's share of checks in
 *      cycle 5 stays within 10 points of cycle 1 on average.
 * If you change a number in WORLD (src/sim.js), rerun this and update MODEL.md
 * if the results change.
 */
const { rng, WORLD, makeFounder, outcome, prototypeOf, similarity } = require("../src/sim.js");

const RUNS = 200;
let topW = 0, topWof = 0, topM = 0, topMof = 0, runsWithGap = 0;
let shareC1 = 0, shareC5 = 0;

for (let s = 1; s <= RUNS; s++) {
  const r = rng(s * 31);
  const train = [];
  for (let i = 0; i < WORLD.history.n; i++) { const f = makeFounder(r, WORLD.history); f.exit = outcome(r, f); train.push(f); }
  let w = 0, wo = 0, m = 0, mo = 0;
  for (let c = 1; c <= WORLD.cycles; c++) {
    const proto = prototypeOf(train);
    const apps = [];
    for (let i = 0; i < WORLD.perCycle.applicants; i++) apps.push(makeFounder(r, WORLD.applicants));
    const mean = apps.reduce((a, f) => a + f.traction, 0) / apps.length;
    const sd = Math.sqrt(apps.reduce((a, f) => a + (f.traction - mean) ** 2, 0) / apps.length) || 1;
    apps.forEach(f => { f.score = WORLD.screener.traction * (f.traction - mean) / sd + WORLD.screener.prototype * similarity(f, proto); });
    [...apps].sort((a, b) => b.score - a.score).forEach((f, i) => { f.funded = i < WORLD.perCycle.funded; });
    [...apps].sort((a, b) => b.q - a.q).forEach((f, i) => { f.top = i < WORLD.perCycle.funded; });
    const funded = apps.filter(f => f.funded);
    funded.forEach(f => { f.exit = outcome(r, f); train.push(f); });
    const womenShare = funded.filter(f => f.female).length / funded.length;
    if (c === 1) shareC1 += womenShare / RUNS;
    if (c === WORLD.cycles) shareC5 += womenShare / RUNS;
    apps.forEach(f => { if (!f.top) return; if (f.female) { wo++; if (f.funded) w++; } else { mo++; if (f.funded) m++; } });
  }
  if (w / wo < m / mo) runsWithGap++;
  topW += w; topWof += wo; topM += m; topMof += mo;
}

const wRate = topW / topWof, mRate = topM / topMof;
const checks = [
  [`Top-talent women funded less often than men (${(wRate * 100).toFixed(0)}% vs ${(mRate * 100).toFixed(0)}%)`, wRate < mRate],
  [`Gap appears in at least 95% of runs (${runsWithGap}/${RUNS})`, runsWithGap >= RUNS * 0.95],
  [`Lock-in, not runaway: women's share cycle 1 ${(shareC1 * 100).toFixed(0)}% vs cycle 5 ${(shareC5 * 100).toFixed(0)}%`, Math.abs(shareC5 - shareC1) < 0.10],
];
let failed = 0;
for (const [label, ok] of checks) { console.log((ok ? "PASS  " : "FAIL  ") + label); if (!ok) failed++; }
process.exit(failed ? 1 : 0);
