# The Prototype Machine

An interactive simulation of how AI screening, trained on past exits, can lock bias into venture funding.

You play a partner at a seed fund and back four of twelve founders. An AI screener then learns from your picks and the fund's history and runs five funding cycles on its own. You watch who gets funded, who gets passed over, and what the model never finds out.

Built by Syeda Tawheeda Huq for her Cognitive Science senior project (COGS 301) at Lehigh University, 2026–27.

## Play it

Open `index.html` in a browser. No install or build step.

## What's in here

| File | What it is |
|---|---|
| `index.html` | The page: three acts (you screen, it learns, it runs). |
| `styles.css` | Look and layout, light and dark themes. |
| `src/sim.js` | The simulation: founders, outcomes, the prototype-matching screener. All assumptions live in `WORLD` at the top. |
| `src/app.js` | The interface: cards, grid, chart, narration. |
| `test/sim.test.js` | Checks the simulation still produces the documented result. Run `node test/sim.test.js`. |
| `MODEL.md` | Every assumption, the current result, and the research behind each design choice. |

## Roadmap

- **Act 4: break the loop.** Toggle interventions (traction anchors, exploration slots, training on unfunded founders) and compare outcomes.
- Tune toward real data where it exists, and grow the model from VC and founder interviews.
