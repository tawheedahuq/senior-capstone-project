# How the model works

The Prototype Machine is a toy world built to make one mechanism visible: an AI screener that learns "what a winner looks like" from past exits can lock historical bias into who gets funded, even when talent is spread equally. Every number below is an illustrative assumption, not an estimate of the real venture market. All of them live in `WORLD` in `src/sim.js`.

## The pieces

| Piece | What it does | Default |
|---|---|---|
| Founders | Each has hidden potential `q` (standard normal, same for every group), plus three visible traits: gender, elite school, big-3 hub. | — |
| Applicant pool | Share of applicants with each trait. | 50% women, 25% elite school, 40% hub |
| Traction | Visible revenue growth, a noisy signal of potential: `0.6·q + 0.8·noise`. | — |
| Outcomes | Chance of an exit: `sigmoid(1.6·q + 0.7·elite + 0.6·hub − 1.7)`. The elite and hub terms stand in for network and follow-on access, not talent. Gender has no effect on outcomes. | — |
| History | The fund's past deals, which seed the training data. | 300 deals: 12% women, 60% elite, 75% hub |
| Screener | Scores each applicant as `1.0·traction (standardized) + 2.4·similarity to the prototype`, where the prototype is the average traits of every past founder who exited. Funds the top scorers. | — |
| Cycles | Applicants and checks per round. | 5 cycles, 300 applicants, 30 checks |
| Selective labels | Only funded founders get an outcome and join the training data. Rejected founders never teach the model anything. | — |

## Current result

From `node test/sim.test.js` across 200 runs:

- The screener funds about **25% of top-talent women** versus about **48% of top-talent men** (top talent = the 30 highest-potential applicants in a cycle). The gap appears in every run.
- Women's share of checks stays near **26–30%** from cycle 1 to cycle 5, against 50% of applicants. Bias **locks in rather than runs away**. Thirty new outcomes a cycle can't outweigh 300 rows of skewed history.

Open question for the thesis: what turns lock-in into runaway? Candidates include weighting recent cohorts more heavily, a smaller history, or a stronger network advantage in outcomes.

## Research behind each choice

- **Prototype matching.** Rosch (1975), *Journal of Experimental Psychology: General* 104(3); Rosch & Mervis (1975), *Cognitive Psychology* 7. Categories are judged by resemblance to their best examples.
- **Representativeness and stereotypes.** Tversky & Kahneman (1974), *Science* 185; Bordalo, Coffman, Gennaioli & Shleifer (2016), *QJE* 131(4).
- **AI screening drifts toward the familiar.** Bonelli (2023), "Data-driven Investors," HEC Paris working paper.
- **VCs over-weight representative traits.** Lyonnet & Stern, "Machine Learning About Venture Capital Choices" (2025 draft).
- **Selective labels.** Lakkaraju, Kleinberg, Leskovec, Ludwig & Mullainathan (2017), KDD.
- **Feedback loops in algorithmic allocation.** Ensign et al. (2018), "Runaway Feedback Loops in Predictive Policing," FAT*.
- **Networks shape who gets funded.** Howell & Nanda (2024), *JFQA* 59(6); Gompers, Mukharlyamov & Xuan (2016), *JFE* 119(3).
- **Funding gaps used to motivate the history skew.** PitchBook *All In: Female Founders* (2025); Carta startup ecosystem data (2025).

## What this model is not

- Not a forecast or an estimate of real VC behavior. It shows a mechanism under stated assumptions.
- It ignores counter-evidence it doesn't model, such as Gornall & Strebulaev's (2025) finding that cold pitch emails from women got more interested replies. A full write-up should address that.
- No data from players is collected. If player choices are ever used as research data, that needs IRB review first.
