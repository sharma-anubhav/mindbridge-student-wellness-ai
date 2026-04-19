# HAII (Spring 2026) — Lecture notes for your project

**Purpose:** Condensed, project-relevant takeaways from your course slides so you can cite class concepts in write-ups, demos, and design decisions (mental health prediction + LLM agent dashboard + fairness, privacy, audit).

**Sources in this repo**

- `Lectures/Lecture #4 - Guidelines of HAII.pdf`
- `Lectures/Lecture #5_ Designing for AI Failures.pdf`
- `Lectures/Lecture #7 - Stakeholder-driven AI Design.pptx.pdf`
- `Lectures/Lecture #8 -Fairness in ML .pptx.pdf`
- `Lectures/Lecture #9 _ Fairness in the Field.pdf`
- `Lectures/Lecture #10 - AI Auditing.pdf`
- `Lectures/Lecture #11 - RAI in Practice.pdf`
- `Lectures/Lecture #12 & #13_ Transparency & Interpretability.pdf`
- `Lectures/Lecture #18_ AI Agents.pdf`
- `HAII privacy guest lecture.pdf` (Sauvik Das + Hank Lee)

**Course project tie-in** (`Project Instructions-HAII-Spring 2026.txt`, Option B): final video should explain how class ideas (HAII principles, mitigating error impacts, explainability/interpretability, privacy, fairness, etc.) and **pilot user testing** shaped your design.

---

## 0. Course framing & how to use this doc

**What is HAII? (Lecture #4)** Human–AI interaction is where **HCI meets AI** — the guiding question used in class: *“How can we augment human intelligence with machine intelligence?”* Contrast with older AI rhetoric: Douglas Engelbart (1965) emphasized **augmentation**; Herbert Simon (1960) predicted machines doing “any work a man can do” — **replacement** framing.

**Course arc (Lecture #7 preview)** — useful vocabulary for your report:

- **Part I:** Introduction, guidelines, practical ML basics, history, **designing for failures**, cases (e.g. AFST), **stakeholder engagement**.
- **Part II:** Fairness, accountability, transparency, ethics (**FATE**).
- **Part III:** Capabilities and limits of advanced ML.
- **Part IV:** AI governance and society.

**How to use this file while building:** Skim **§1–2** when writing UI copy and error states; **§4–5** when reporting metrics; **§6–7** when designing evaluation or LLM guardrails; **§8** for explanations; **§9–10** for agents and privacy; **§13** for paper lookup; **§14** pre-ship checklist; **§15** for **remaining slide-level** facts and activities not repeated elsewhere.

---

## 1. Microsoft “Guidelines for Human-AI Interaction” (Lectures #4, #5, #12)

**Origin story (Lecture #4):** Derived via consolidation of 150+ recommendations, evaluation on 13 AI products, user study with 49 UX practitioners, expert review — CHI 2019 honorable mention. **Not a checklist** — use as design considerations; extra guidelines may be needed. Workbook: Microsoft HAX Toolkit (`https://www.microsoft.com/en-us/haxtoolkit/`), full guidelines `https://aka.ms/aiguidelines`.

**The 18 guidelines (grouped by lifecycle phase)**

| Phase | # | Guideline (short) |
|--------|---|-------------------|
| Initially | 1 | Make clear **what** the system can do |
| Initially | 2 | Make clear **how well** the system can do what it can do |
| During interaction | 3 | Time services based on **context** |
| During interaction | 4 | Show **contextually relevant** information |
| During interaction | 5 | Match relevant **social norms** |
| During interaction | 6 | **Mitigate social biases** |
| During interaction | 7 | Support efficient **invocation** |
| During interaction | 8 | Support efficient **dismissal** |
| During interaction | 9 | Support efficient **correction** |
| When wrong / uncertain | 10 | **Scope** services when in doubt |
| When wrong / uncertain | 11 | Make clear **why** the system did what it did |
| Over time | 12 | Remember recent interactions |
| Over time | 13 | Learn from user behavior |
| Over time | 14 | Update and adapt **cautiously** |
| Over time | 15 | Encourage granular **feedback** |
| Over time | 16 | Convey consequences of user actions |
| Over time | 17 | Provide **global controls** |
| Over time | 18 | Notify users about **changes** |

**Design tensions called out in class**

- **Expectations:** Mismatched expectations frustrate users and drive abandonment; ~33% of people use “magic” to describe search; problematic when people **overestimate** capabilities for **high-stakes** tasks. Mitigations: examples, timed feature introduction, controls (Russell, *Joy of Search* referenced).
- **Context:** Infer and respect critical context; monitor signals; **develop and test with diversity in mind** (example: “no average walking speed” — product assumes healthy users).
- **Errors:** Common errors include false positives/negatives, partial correctness, uncertainty — **consider costs** of each error type and provide mitigation (invocation, dismissal, correction, scoping, explanation).
- **Change over time:** People and models both change — help users anticipate change; avoid sudden changes that ignore adaptation (example cited: abrupt product behavior).

**For your mental health app:** Explicit non-diagnosis disclaimer = scoping (10) + expectation-setting (1–2). Sliders with undo = correction (9). Showing confidence intervals or “grain of salt” language = (2), (10), (11). Changelog if model updates = (18).

**Research process behind the guidelines (Lecture #4)** — cite if you discuss “evidence-based HAII”:

1. **Consolidation** — 150+ disparate recommendations synthesized.  
2. **Team evaluation** — 13 common AI products.  
3. **User evaluation** — 49 UX practitioners, 20 AI products.  
4. **Expert review** — 11 UX practitioners.

**Slide examples of where AI shows up in products:** query processing / ranking / spam; speech and task support; email sorting, entities, **response generation**; feed filtering and ad recommendation — good prompts for your reflection: which of the 18 guidelines matter *most* for each?

**“Misinformed behavior” (Morris, CSCW 2014)** — referenced as related to wrong mental models of systems; pairs with expectation-setting.

**Authors’ disclaimer (slides):** Guidelines are **not** a compliance checklist; you’re “using them right” if you **consider** them during development. **HAX Workbook** activity: pick a product, choose **two** guidelines, fill workbook rows (scenario, risk, mitigation) — same structure can structure your **design rationale appendix**.

**Why HAII is still hard (Lecture #4 closing):** Even with principles, design remains difficult because of **uncertainty** and **output complexity** — when ML fails, it can be harder to correct or understand than conventional software; uncertainty can feel **delightful** in one product and **unacceptable** in another (same technical property, different context).

---

## 2. Designing for AI failures & alignment (Lecture #5)

**Why it matters:** Unintended consequences affect UX and can raise **ethical or societal** concerns; ML courses teach math but not always mitigation of harms.

**What counts as “failure”?** Expected vs actual behavior; **misalignment of expectations**; inexplicable behavior — stakes matter (music rec vs sentencing vs control systems). Can you **recognize** an error? **Correct** it? **Avoid** repetition?

**Partial taxonomy of causes**

- **Training data** → recognition failures (mislabels, poor model despite data, edge cases). Mitigations: user correction feeding back; clear capability limits; feedback for unmet needs. (Resource mentioned: labelerrors.com.)
- **Input data** → miscalibrated expectations (expected autocorrection, habituation broken by changing UI, miscalibrated focus). Mitigations: check input vs expected envelope; explain provenance; allow focus correction.
- **Relevance** → context failures (low confidence, irrelevance). Mitigations: explain why result unavailable; offer alternatives; user feedback.
- **System hierarchy** → multi-system confusion (which system is “in charge”; alert storms). Mitigations: clarify hierarchy; spatial mapping; checklists; primary surface for communication.

**Alignment problem (high level):** Specifying desired/undesired goals; **reward hacking**; instrumental goals (e.g., power-seeking); **emergent** goals in deployment — Brian Christian, Nick Bostrom cited.

**Process for failure handling (slide summary):** (1) Create feedback opportunities (2) Alternate paths (3) Return control to user (4) Clear communication hierarchy (5) Reduce misalignment.

**Good practices for mitigation:** Identify error source → analyze impact → debug/test → monitor/update → **explain and document**.

**Open issues from slides:** What UX patterns improve alignment? How to signal **uncertainty** in UI without destroying credibility?

**Concrete failure stories (slides) — use in “related work” or risk analysis**

- **Severe / societal:** Image labeling — one “fix” was to **remove** categories (e.g. primates) from the service lexicon; class asked about tradeoffs of that product decision.  
- **Tay (Microsoft chatbot):** Earlier **Xiaoice** ran on WeChat with fewer incidents; **Twitter** environment differed; Tay had **no moral agency** — “Hitler” vs “chair” equally meaningless linguistically. Mitigation evolution: 2017 blacklists only → 2018 **Zo** adds **moral judgments** — but slides quote Quartz on **“censorship without context”** and difficulty of nuance (e.g. in-group vs slur usage).  
- **Training data → recognition:** UK **license plate** misread (KN19 vs “KNITTER” bus lane fine) — OCR / training gap.  
- **Ensemble / duplicate systems:** **Xiaoice** vs other agents — “ensemble failures.”  
- **Aggregate behavior:** **Google Maps** routing contributed to **gridlock** (news story); **smart thermostats** and electrified heating — unintended collective effects (cited paper).  
- **Input / habituation:** Breaking muscle memory when the UI changes under users.  
- **Good design pattern — Smart Reply:** Pair problem (“hard to type on mobile”) + need (“quick ack emails”). Design goals tabulated: **user sensitivity**, **accurate expectations**, **graceful failure**; user quote: if suggestion is bad, **ignore** — low cost to dismiss (**guideline 8**).  
- **System hierarchy:** **Fire vs flood** controls story; **“Music for Babies”** shuffle conflating Bach with random excerpts — **distinguishing errors** vs bugs vs transient behavior.  
- **Alignment / maps:** Query “airport near me” returns **wrong airport** (LaGuardia vs JFK) — misalignment between user goal and system optimization.  
- **Automation vigilance:** Automated vehicle drivers — hazard detection failures “matter of time” with vigilance tasks (Greenlee et al., *Human Factors*).  
- **Cultural reference:** Gilfoyle warning ignored — memorable anchor for “warnings ignored in deployment.”

**Paired activity (Lecture #5)** — you can replicate solo: recall an AI failure → expected vs actual → error type from taxonomy → mitigation; matches Option B reflection.

---

## 3. Stakeholder-centered & value-sensitive design (Lecture #7)

**Framing:** Move beyond “user-centered” to **stakeholder-centered** design (Jodi Forlizzi, 2018). Methods: Human-Centered Design, Open Civic Design, **Value Sensitive Algorithm Design** (VSAD) — Zhu, Yu, Halfaker & Terveen, CSCW 2018.

**Traditional ML pipeline:** Historical data → developers tune model → users passively provide data and receive scores — risks ignoring affected parties.

**Stakeholder-centered process:** Consider stakeholders throughout; bring constraints into **early** stages; stakeholder-centered evaluation.

**VSAD four steps**

1. **Understand stakeholder values** — “values” = what people consider important in life (Borning & Muller 2012).
2. **Design initial algorithm** (data prep, approach, output presentation — e.g., who to include, how to determine fit, how to communicate outputs).
3. **Pilot deploy with stakeholders.**
4. **Evaluate and iteratively refine** — algorithm accuracy, **stakeholder acceptance**, impacts on stakeholders.

**AFST case (Allegheny Family Screening Tool):** Design “done right” touches **data** (quality, collection, reduce downstream bias), **modeling** (appropriate targets, mitigation), **evaluation** (field evaluation, trace failures), **interface** (explainability, **override** / empower workers), **organizational** design (transparency, empowerment).

**Wikipedia recruitment case:** Multiple stakeholders (newcomers, current members, Wikipedia as a whole) with **different values**; AI failed when insensitive to motivations (Halfaker et al. 2012); community pushback on “intervention” without co-design — quote: researchers should work **with the community from the start**.

**Value tensions (Wikipedia example, slides):** Newcomers care about mentorship, productivity, retention; current members care about control, mutual interest, long-term growth; “Wikipedia as a whole” has ecosystem-level goals. Design had to balance **who to include** (brand-new vs experienced editors), **interest-based vs relationship-based** matching, **direct invite vs communicate with mentors first**.

**Evaluation beyond accuracy (Lecture #7):** Same system reported **algorithm accuracy**, **stakeholder acceptance** (quotes from members and newcomers), and **impacts** — mirror this in your project: accuracy + qualitative acceptance + downstream effect (even lightly, via pilot).

**Open Civic Design** (Reynante, Dow, Mahyar 2021) — named as a related method; pair with VSAD if you discuss public-interest or campus-wide deployment.

**For your project:** Identify stakeholders (students, institutions, marginalized groups in survey data). Pilot users = early stakeholder input; document how feedback changed UI and wording.

---

## 4. Fairness in ML — formal criteria (Lecture #8)

**Framing:** Ruha Benjamin — “New Jim Code”: tech that reproduces inequity while appearing objective. Course focus: **consequential** decisions; US legal framing; formal models are **not** sufficient alone.

**Anti-discrimination concepts**

- **Disparate treatment** — intentional or procedural favoring on protected attributes.
- **Disparate impact** — disproportionate adverse effect even without intent; may require **business necessity** defense.

**Fairness through unawareness fails** — omitting protected attributes does not remove correlation with proxies (SAT/GPA example in slides).

**Real-world pattern (slides):** **Amazon same-day delivery** — coverage maps showed uneven geographic service that aligned with historical / structural inequality (Bloomberg 2016 graphic) — **disparate impact** without necessarily “sensitive attributes” in the model. Adjacent slide: **redlining** — historical housing discrimination tied to modern service maps.

**Sorelle Friedler (quoted on slides):** *“There is so much systemic bias with respect to race. If you aren’t purposefully trying to identify it and correct it, this bias is likely to creep into your outcomes.”*

**Slides credit:** Fairness material partly adapted from **Moritz Hardt, Jon Kleinberg, Michael Kearns, Aaron Roth, Steven Wu**.

**Statistical group fairness “recipe” (slides):** (1) Pick a **statistic** of the classifier. (2) Ask that it be **approximately equal** across groups — mostly **conditional probabilities**.

**Notation (formulation slide):** Features **X**, protected attributes **A** (may overlap X), label **Y ∈ {0,1}**, learn score **S = s(X)**, binary decision **D** via **threshold** on S.

**Loan default prediction (running example):** Bank scores default risk; threshold decisions drive who gets approved — connect to your anxiety-risk slider: thresholds change FP/FN **costs**.

**Confusion-matrix rates (slide):** TPR = P(D=1|Y=1), FPR = P(D=1|Y=0), TNR = P(D=0|Y=0), FNR = P(D=0|Y=1) — foundation for equalized odds discussion.

**ROC / threshold thinking:** Vary threshold along score → trace FP/FN tradeoffs; **equalizing error rates** often discussed in ROC space.

**Beyond binary confusion matrix (slides):** Column-wise rates — **false omission rate**, **false discovery rate**, **PPV**, **NPV** — matter when the **meaning** of a positive prediction differs by use (screening vs diagnostic analogues).

**Three group fairness criteria (often in tension)**

1. **Demographic parity / statistical parity:** \(P(D=1|A=a)=P(D=1|A=b)\) — equal positive decision rates. **Issues:** allows random or poor decisions; ignores \(Y\) and error types.
2. **Equalizing error rates (equalized odds):** FP and FN rates match across groups — \(D \perp A \mid Y\).
3. **Calibration (by group):** Predicted probability matches observed frequency within each group; \(P(Y=1|S=s,A=a)=s\) style condition discussed.

**Incompatibility (informal):** **Any two** of these broad families are **generally mutually exclusive** (Chouldechova; Kleinberg, Mullainathan, Raghavan). With **unequal base rates** and **imperfect** classifier, **calibration by group** can imply **error rate parity fails** (COMPAS debate: ProPublica on FP disparity vs Northpointe on calibration).

**Additional concepts:** **Fairness gerrymandering** — fairness on coarse groups can hide unfairness on subgroups (Kearns et al.). **Intersectionality** — multiple identities shape experience. **Individual fairness** — similar individuals treated similarly (Dwork et al. “fairness through awareness”) — needs meaningful similarity metric.

**Normative question:** Is **prediction** the right frame? Example: failure-to-appear — predict vs address **childcare, transport, schedules** (structural interventions).

**Summary from slides:** Statistical criteria are not a **proof** of fairness; require domain and values.

**Course assignment pattern (Lecture #8–9):** Load data → formalize problem → **identify protected groups** → compute fairness metrics → **try to equalize TPR/FPR** (understand limits). Aligns with a technical appendix for your dashboard.

**Designer-facing tools (backup slides):** **ValueCards** (Shen et al., FAccT 2021) — educational toolkit for deliberating social impacts of ML; **Keeping Designers in the Loop** (Yu et al., DIS 2020) — communicating **inherent trade-offs** across objectives.

**For your dashboard:** Report calibration and error rates **by group** where data allows; document trade-offs; avoid claiming “fair” from one metric alone.

---

## 5. Fairness in the field — perception & stakeholders (Lecture #9)

**Trade-offs:** Between accuracy and fairness; between **different** fairness notions (Kleinberg et al. inherent trade-offs in risk scores). **Pareto-optimal** sets of models to show trade-off frontiers (Kearns et al. subgroup fairness).

**Wang et al. (2020) — perceived fairness:** People rate algorithms as **more fair when outcomes favor them** — can outweigh description of demographic bias. “If this is not in my favor, it’s unfair.” **Stakeholders** should be involved in choosing fairness approaches.

**Milton Friedman (slide):** “Fairness is in the eye of the beholder” — used to frame **subjective** fairness.

**Wang et al. study design (slides):** **Mechanical Turk** scenario — “new algorithm for who earns a **Masters Qualification**”; random **pass/fail** manipulation. Separate manipulations of **algorithm outcome** vs **algorithm creation and deployment** (process fairness). Prompt before results: “What did you predict?”

**Fairness-Wash (Lecture #9):** Named alongside **fairness gerrymandering** (Kearns et al.) — watchwords for cosmetic fairness claims.

**Quantitative stakeholder results (Cheng et al., slides):** **Statistical parity** judged appropriate in **43.3%** of scenarios; **unawareness** in **41.7%** — with nuance that neither is universally correct.

**Part 3 equity track (slides):** **Co-Envisioning Equitable and Transparent Future Public Technologies** — listed alongside equality vs equity module.

**K-12 class activity (Lecture #9):** “How would you teach K-12 kids fairness in AI?” — small groups, sketches/storyboards, aligns with **literacy** and **your** dashboard as educational surface.

**Child maltreatment / AFST stakeholder study (Cheng et al., CHI 2021):** Eliciting fairness from non-experts via **micro** (pairwise cases), **meso** (similarity-based exploration), **macro** (subgroup metrics) views.

**Findings (high level):** **Equalized odds** most preferred among group criteria; participants wanted **high and even** accuracy across groups — reluctant to **sacrifice** accuracy for parity. **Statistical parity** — sometimes appropriate but not always “fair”; disparate prediction rates don’t automatically imply unfairness; base rates differ. **Unawareness** — only sometimes appropriate; awareness can **reinforce** or **correct** systemic issues (both views in data).

**Equity vs equality** in public sector: efficiency & equity motivations; tension where equity monitoring creates **fear** (e.g., minority business owners worried demographic data will be used against them).

**Capturing trade-offs in practice:** Generate a **family of models** spanning accuracy–fairness tradeoffs; **Pareto-optimal** sets — no model strictly better on *all* criteria than another on the frontier (Kearns et al. ICML 2018; empirical subgroup fairness FAT* 2019).

**Stakeholder elicitation interfaces (Cheng et al., CHI 2021) — three “zoom levels”**

- **Micro:** Pairwise comparison of **pre-selected** case pairs (here: maltreatment reports).  
- **Meso:** Dataset exploration with **user-defined similarity** metrics; sort and select cases to compare.  
- **Macro:** User-specified **subgroups**; compare algorithmic metrics across subgroups.

**Human-in-the-loop fairness question (slides):** When workers know a tool has **known racial disparities**, do they **mitigate** or **exacerbate** disparities? — motivation for studying **human–AI collaboration** in high-stakes settings.

**For your project:** Pair metrics with **stakeholder-facing** explanation; pilot testing probes **perceived** fairness, not only formulas. If you show subgroup stats, add **plain-language** interpretation (macro view) and optional **example cases** (micro view) *only with synthetic or public data* — never real peer data without ethics review.

---

## 6. Algorithm auditing (Lecture #10)

**Definitions**

- **Algorithm bias (adapted):** Inclination or prejudice for/against stakeholders, especially unfairly (Oxford-style definition on slides).
- **Auditing (Sandvig et al.):** “Look inside the black box… pressing public problems.”
- **Metaxa et al.:** Repeated queries with controlled inputs; analyze outputs to infer behavior.

**Methods illustrated:** **Scraping audit** (e.g., political search inputs). **Sock-puppet audit** (housing): fake profiles → compare ads/recommendations by race/gender.

**Papers named on slides (for citations):** Kulshrestha, Eslami et al. **search bias** / political queries (CSCW 2017; *Information Retrieval* 2018); Eslami et al. **rating platforms** “things can be worse than they appear” (ICWSM 2017); **user attitudes** toward opacity/transparency in reviewing (CHI 2019); Asplund et al. **race/gender discrimination in online housing** (ICWSM 2019). **Metaxa et al.** survey on auditing methods (*FnT HCI*).

**Collective contribution (search bias slide):** **Input data + ranking system** jointly produce output bias — affects user experience.

**Rating platform example (Booking.com):** **Power of ratings** (Anderson & Magruder 2012). UI: lowest per-criterion scores still **aggregate** to ~**2.5**, not zero; distribution bins suggest minimum 1 but **effective floor** higher. **Cross-platform audit:** “Augmented” hotel ratings up to **37%** vs other platform; **111** vs **2.5** style mismatches. Users quote: lowest grades still yield 2.5 → “range is 2.5–10”; others **adjust** answers to “right” the overall score; **trust breakdown** (“DO NOT TRUST ratings”). **Behaving around the algorithm** (Suchman; Jackson & Kang; Houston et al.): (1) looking into black box (2) righting wrongs (3) trust breakdown.

**Everyday algorithm auditing (Shen et al., CSCW 2021):** Ordinary users surface harms through use. Twitter image cropping: community tests → **bias in training data**, user needs, question whether feature should exist → **removal** as remediation. Lifecycle: initiation → awareness → hypothesize/test → remediation; dynamics over time.

**User-engaged auditing path:** Research on user-driven audits, collective responses, participation/division of labor, power responses (FAccT 2024), **WeAudit** / **TAIGA** for GenAI auditing.

**CHI 2022 path (slides):** **Toward User-Driven Algorithm Auditing** (DeVos et al.) — diary study, **160+** bias reports across **gender, race, sexual orientation, disability, SES, religion, politics, body type**, etc. Related: demonetization and marginalized communities (CSCW 2022); **participation and division of labor** in audits (CHI 2023); **WeAudit** scaffolding users and practitioners (CSCW, conditional acceptance 2025).

**Industry programs (slides):** Twitter **Bias Bounty**; OpenAI **Feedback Contest** (ChatGPT); **Hugging Face** PRs/discussions; Google **AI Test Kitchen** — “red-teaming” / user feedback experiments.

**User auditors vs practitioners:** Gap between needs — practitioners lack tools/processes; users have **situated knowledge** and identities.

**For your project:** Systematic test cases across demographic inputs; log and review disparate errors; optional “audit view” showing FP/FN rates by group; relate pilot testing to **everyday** feedback.

---

## 7. Responsible AI in practice (Lecture #11)

**Industry:** Google People + AI, Microsoft RAI, IBM Trustworthy AI, PwC toolkits, Apple principles — named on slides.

**Auditing types:** Human-driven; AI-driven; **PersonaTeaming**; **Human–AI collaborative auditing (HAAC)** — eBay collaboration.

**Research:** Gulf between academic user-engaged auditing and **industry practice** (Holstein, Eslami et al.). Interviews + co-design: **developer-led** vs **user-led** audit pipelines; wish lists for audit reports.

**Crowdsourcing caveat:** Often focuses on **what** workers do, not **who** they are — but **intersectional identity** and lived experience matter for finding harms. **Recruiting the right auditors** is hard (“demographics explode into categories”). Effective audits may need users to **lead** and navigate ambiguity — vs rigid task specs. **Guiding without biasing:** questions can introduce **confirmation bias** (quote from UX researcher on LLM auditing).

**Aggregation caveat:** Majority vote may miss harm; **minority voices** and **outliers** may matter more for actionable insights.

**GenAI e-commerce risks (slide):** Traditional e-commerce: user filters info; AI-assisted: **AI filters** — shifts risk. **Failure modes** for shopping agents: **Hallucinations**, **Safety**, **Manipulation**, **Overconfidence**, **Constraint violations**, **Bias**.

**HAAC workflow:** Explore prompts → Inspect response → Report (failure labels) → Deliberate with community; optional **scenario generator** and **detector** agents — risk of **overreliance** on AI flags.

**Discussion prompts (course):** Who should red-team — engineers, domain experts, everyday users? Same failures in **hiring, healthcare**, etc.

**HAAC / e-commerce class activity (Lecture #11):** Timed **with vs without** AI support; compare **scenario generator** (attack prompts) and **detector** (auto flags) — **discussion:** Did generator surface angles you wouldn’t think of? Did detector **miss** or **over-flag**? If you were PM at Amazon, how would you **prioritize** fixes from audit logs? **LM Arena** mentioned for multi-model LLM comparison.

**PersonaTeaming** — Apple collaboration: **persona-driven automated red-teaming** (named on slides).

**For your LLM agent:** Label failure modes; keep human review of agent-written audit reports; scenario diversity for mental health sensitivity.

---

## 8. Transparency & interpretability (Lectures #12 & #13)

**Distinctions:** Transparency vs explainability (XAI) vs interpretability — related but not identical.

**Case — Facebook News Feed (Eslami et al., CHI 2015):** Many users **unaware** of ranking/filtering; unawareness → shock when shown “filtered” vs unfiltered feed (“Matrix” metaphor). **Transparency of existence** vs **transparency of operation**. After awareness, some users **change behavior** (e.g., strategic liking) — “manipulating the manipulation.”

**Engagement & awareness (slides):** “Actively engaged” users more likely **aware** of algorithm than passive scrollers; **Sarah** scenario — many assumed friend’s public post would appear if they “checked carefully.” **Jeff Hancock** (Microsoft Faculty Summit 2014) — strong emotional reaction to feed manipulation (“How dare you manipulate my news feed!”).

**Follow-up (2–6 months):** Some users **increased engagement** and **manipulated the manipulation** (e.g., selective liking); satisfaction same or higher. Related papers: **Folk Theories of Social Feeds** (CHI 2016); path to understanding algorithm awareness (Alt.CHI 2014).

**Yelp / rating transparency (CHI 2019, Eslami et al.):** “Discussions inside Yelp” — **algorithm’s existence** (recommended vs filtered review) and **operation**. User **stances**: **questioning** vs **defending**; two axes — **should the algorithm exist?** **Should it be hidden?** **Should it work differently?** **Should operation be opaque?** — useful framework for your **LLM** (“should this summarization exist?”).

**Behavioral advertising transparency (CHI 2018):** **Participatory & speculative design** — three lenses: **User / Algorithm / Advertiser** views; “Why am I seeing this ad?” **Speculative** product. Findings: users want **interpretability** (not vague), **enough** detail, and **link to identity** — **“algorithmic self”** (e.g., politics, tech adoption) sometimes **unrecognizable** or **unsettling** vs sometimes appreciated (“see how I’m categorized”). **Kizilcec** (CHI 2016) — how much transparency affects **trust**.

**Youth & algorithms (slides):** Epps-Darling (2020) — youth exposed to racism/gender injustice via algorithmic systems; **predictive grading** UK (Meadway, Guardian) — connect to **fairness** and **overtrust** of GenAI.

**Session structure (Lectures #12–13):** Topic spans **two class sessions**; agenda: three XAI approaches (feature / example-based / model analysis), **SHAP & LIME**, limitations, activities.

**Three-part transparency frame (slides):** **Transparency of existence** → **Transparency of operation** → **Designing for transparency** — organize explanations in that order for users who don’t know a model exists.

**News Feed study numbers:** **Sarah** scenario — **62.5%** unaware vs **37.5%** aware of filtering; **n = 40**; **43%** vs **17%** expected differences in **Friends** vs **Content** views when comparing curated vs uncurated feeds.

**CHI 2015 paper accolades (slides):** **Best Paper Award**; **top 3 most-cited** CHI 2015; extensive **media** list (Time, WaPo, BBC, MIT Tech Review, etc.).

**Explainable AI toolkit (technical)**

- **Feature attribution:** **SHAP** (Lundberg & Lee), **LIME** (Ribeiro et al.) — local explanations, model-agnostic.
- **Example-based:** Similar training examples to prediction.
- **Model analysis:** Performance breakdowns — **model cards** style (slide showed FPR/FNR by group).

**LIME illustration (slides):** Classic **text** task — classify **Christianity vs Atheism**; code: `https://github.com/marcotcr/lime`.

**LIME user study evaluation questions (Ribeiro et al.):** (1) Can users pick which of **two classifiers** generalizes better? (2) Can explanations support **feature engineering**? (3) Can users spot **irregularities** from explanations?

**Desired explainer properties (LIME paper):** Interpretable; **local fidelity**; model-agnostic; global perspective where possible.

**Other post-hoc explainers named (slides):** **Anchor**, **MUSE**, **gradient × input**, **Integrated Gradients**, etc. — family of local/global, gradient vs perturbation methods.

**LIME/SHAP mechanism (recap slides):** Treat complex model as **black box**; **perturb** inputs, build **local linear** approximation; many perturbed points are **out of distribution** — intuition for adversarial explanation attacks.

**SHAP visualization:** **Force plot** for a single prediction — “how an individual prediction was made.”

**Limitations**

- **Adversarial attacks** on post-hoc explanations (Slack et al., AIES 2020) — can mask discrimination; OOD perturbations.
- **Misuse** by data scientists (Kaur et al., CHI 2020).
- Explanations don’t always change **trust** (Cheng et al., 2019).

**Operational transparency challenges:** Too much → cumbersome UI, **gaming**; too little → black box (Seaver, Annany & Crawford cited). **Behavioral advertising** study: participatory design — users wanted **interpretable**, **enough** transparency, and **link to identity** — not vague (“most vague… so I won’t do anything”) vs specific; **Goldilocks** (“not too much, not too little”).

**Seamful design:** Actionable transparency.

**Generative AI & youth:** Overtrust — **59%** of incorrect model answers treated as correct; **20%** correctly identified errors (Solyst et al., ICLS 2024) — relevant if your audience includes students.

**For your project:** Combine **simple** natural-language rationale with **feature attribution** or similar-example view; document that SHAP/LIME can be **gamed** and are not guarantees of fairness.

**In-class activity (Lectures #12–13):** Pick an ML prediction task (e.g. radiology, text) — sketch **feature attribution**, **example-based**, and **model performance** explanations; decide which fits **your** users and context.

---

## 9. AI agents & AI user testing (Lecture #18)

**Examples:** Generative Agents (Park et al., UIST 2023); **Sotopia**; **Training Mental Health Supporters with Virtual Patient Agents** — student contributors listed on slides include **Angela Chen, Siwei Jin, Canwen Wang, Jessie Mindel, Sijia Xie, Yee Kit Chan, Anna Fang** with **Haiyi Zhu, Robert Kraut, Sherry Wu, Holly Swartz**; **AI Village** reference.

**Conclusion slide prompts (Jason Hong):** Doing a startup; **AI ethics**; **Do we need AI testing if AI generates designs?**; **UX job market** — possible reflection prompts for your video.

**Framing question:** When is it OK to use agents **instead of** humans vs not?

**Synthetic users** (e.g., syntheticusers.com) — caution.

**Jason Hong — AI user testing (fuguUX):** Traditional UX testing is **slow, expensive, low coverage**. AI-assisted testing: faster, cheaper, broader heuristics; **persona**-based task simulation.

**Why user testing? (slides)** “You are not the user”; **build the right thing** and **build the thing right**; validate assumptions; evidence for stakeholders; **iterative** design. Also: **competitive analysis** (success rate, time on task, satisfaction, NPS); **QA** (broken flows, a11y, SEO, typos) — **Figma doesn’t catch** implementation bugs.

**Alternatives to classic user testing:** **GOMS**, **heuristic evaluation**, **cognitive walkthrough**, **remote** studies, **log analysis** (needs traffic; shows *what* not *why*), **A/B testing** (needs scale; cost; can’t test everything; **atheoretical**).

**Two kinds of AI UX tools (slides):** (1) **Customer experience scanners** — single-page heuristics (layout, readability, information scent, consistency, emphasis, minimalist design). (2) **AI user testing** — given **task + personas**, simulate personas (example task: **upmc.com** find urgent care near CMU with hours/services).

**Pros/cons:** Productivity; but agents may be too **smart** (see hidden UI) or too **dumb** (messy web, hamburger menus); need diversity of exploration; agents show **extreme confidence**; avoid back button — unlike humans. **Safety:** side effects (emails, bookings), **prompt injection**. **Personas** may not match real humans. Ethics: complement human testing, not full replacement; free UX capacity for deeper work.

**Human–AI design issues (slides):** Customers may not know what a **good task** is; **trustworthy** results need **prioritization** and “why this matters” for non-UX stakeholders.

**Startup ethics take (slides):** Not surveillance capitalism; **complement** real users — AI for cheap iteration, **humans** for sentiment and domain knowledge.

**fuguUX.com** — free credits / class exercise: URL + task → swarm of agents → narrated videos + prioritized report. **Alternative designs** brainstorm: eye tracking, heatmap DB, model checking — tradeoffs.

**For your project:** Use AI-assisted testing for **coverage**; still run **real pilot users** (course requirement). Virtual patient line of work aligns with **training** use cases — distinguish from **clinical** deployment.

---

## 10. Privacy (guest lecture + Hank Lee section)

**Why definitions matter:** Robert C. Post (2001) — privacy is **complex and contested**; multiple meanings coexist.

**Foundations**

- **Warren & Brandeis (1890):** “Right to be let alone” — press intrusion.
- **Alan Westin (1967):** Privacy = claim to determine **when, how, extent** information about self is communicated.
- **Palen & Dourish:** Boundaries — disclosure (private/public), identity (self/other), temporality (present/future).
- **Helen Nissenbaum — Contextual integrity:** “Appropriate flow” — same data OK for doctor, not for unrelated ads.
- **Daniel Solove’s taxonomy:** Collection, processing, dissemination, invasion — no single definition, “you know it when you see it.”

**Benefits of privacy:** Autonomy; relationships; safety for marginalized groups. **Harms of privacy** (debated): can conflict with other values (e.g., **safety vs privacy**). **Societal benefit:** privacy supports **democracy** — behavior changes under surveillance.

**Granularity of analysis (slides):** **Societal** — liberty vs public good; **individual** — consent, awareness, control. **Benefits** often framed as individual; **harms** as societal — but **societal-scale privacy benefits** (e.g. democratic deliberation) also matter.

**Regulation & tradeoffs (brief)** — Free market vs **consumer protection** (privacy as negative vs positive right). **Government** balances safety and surveillance — **post-9/11** US polls (slides) showed majorities for **expanded** camera surveillance, chat monitoring, financial monitoring, email monitoring — **2019 Pew** referenced. Extremes: **no oversight** (e.g. tax havens) vs **surveillance states**; **social credit** example — carrots/sticks, **network effects** (associating with low-score users hurts you). **Privacy International 2007** — eight “endemic surveillance societies” listed including **US**, **UK**, **China**, etc.

**US examples (slides):** **Safeguards** — EPPA (polygraph at work), **COPPA** (<12), **GINA** (genetics); **tensions** — census (fair representation vs historical misuse), **IRS** depth, **CCTV** scale; **processing** — IRS fraud mining, syndromic surveillance, **predictive policing**; **dissemination** — **FERPA**, **HIPAA**, **FOIA**; **invasion** — Do Not Call, **TSA** imaging evolution.

**Computing/AI:** Scale of collection; **secondary use**; invisible sensing; new modalities (GPS, implants, AI). **AI and privacy are bound** — risks from collection and processing (Kelley et al., SOUP ’23 — many expect **less** privacy).

**Classic examples (Das lecture):** **Facebook** photos → social/context reconstruction; **grocery loyalty** → coupons + resale of purchase data; **Google Maps** → subpoena risk, retrospective enforcement hypotheticals.

**Privacy-enhancing tech (slides):** **Encryption**, automated authentication, **differential privacy**, **zero-knowledge proofs** — balance to surveillance affordances.

**Rights framing:** **Warren & Brandeis** — libel/slander only if “untrue” left a gap motivating privacy torts. **Prudential vs absolute** right — should privacy be absolute or **mutually beneficial** rule rational agents would adopt?

**Harm-side nuance:** Slide asks whether some groups (e.g. people with **mental disabilities**, **unhoused**) might suffer from “too much” privacy from a resource-distribution perspective — sensitive; know it’s a **debate prompt**, not a policy claim.

**Sauvik Das (PERP ’23) questions:** Has AI changed the **surface area** of privacy risk? How to foreground **utility–intrusion** tradeoffs for practitioners?

**Lee et al. CHI ’24 — taxonomy of AI privacy risks** (12 categories; **93%** of 321 AIAAIC incidents **created or exacerbated** by AI):

- **Collection:** Surveillance.
- **Processing:** Identification, aggregation, **phrenology/physiognomy**, secondary use, exclusion, **insecurity** (e.g., **LLM memorization** leaking PII).
- **Dissemination:** Exposure, **distortion** (deepfakes), disclosure, increased accessibility.
- **Invasion:** Intrusion.

**Practitioner study (SEC distinguished paper):** Limited **AI-specific** privacy awareness; motivators: **compliance** (common), business differentiation, social responsibility; inhibitors: rigid compliance, incentives, org power, education, **opportunity costs** vs model performance.

**Illustrative practitioner quotes (awareness study):** **Identification** — analyze in aggregate, avoid “root cause to a single point” (P8, ML dev tool). **Secondary use** — data should only support stated purpose, e.g. recommendations not resale (P3). **Insecurity** — user data lifecycle must be protected (P28, document copilot). **Most common concern** in counts (slide): **Insecurity** 14/35, **Identification** 10/35, **Surveillance** 3/35, **Secondary use** 2/35 — **surveillance** not the top worry in that sample.

**Privy (CHI / design research):** **AI Capability & Requirement Scaffolder** → **Privacy Risk Explorer** (taxonomy-linked) → **Privacy Risk Mitigator** → **Privacy Risk Summarizer** (exportable PIA). **Summative study:** 24 practitioners, 13 privacy experts; **RQ1–3** on identification/mitigation, LLM vs template, addressing practitioner barriers.

**Privy findings (slides):** Practitioners and experts rated risks **relevant and severe**; mitigation plans **practical**; **LLM improved PIA quality** with **minimal** SUS difference (~75.6 vs 76.0). **Human–AI collaboration patterns:** surfacing **unknown unknowns** (“I know surveillance when I see it but wouldn’t think of it first”); integration risks (e.g. user’s “minus” share setting vs other parties); **sanity check** effect; risks of **overestimating** own contribution vs Privy and **overaccepting** suggestions.

**Addressing barriers:** **Awareness** — structured taxonomy application; **Motivation** — “hacker mentality,” enjoyable break-it brainstorming; **Ability** — confidence to move forward, early kickoff use.

**Privy beta class activity:** Groups used product concept → identify top risk → mitigation plan — mirror for **your** app’s data flow.

**Public resource:** `https://AIPrivacyTaxonomy.com/` (slides).

**For your project:** Minimize collection; clear purpose limitation; secure storage; no training on user chats without consent; disclose uncertainty when inferring sensitive attributes; avoid **physiognomy-style** claims from demographics.

---

## 11. Quick map: concept → your Option B artifact

| Course concept | Practical incorporation |
|----------------|-------------------------|
| Guidelines 1–2, 10–11 | Disclaimers, capability limits, uncertainty, “why this risk level” copy |
| Guidelines 6–9 | Bias mitigation; easy dismiss/override of predictions; corrections |
| Failures taxonomy | Test OOD inputs; explain miscalibration; feedback loop |
| VSAD / stakeholders | Pilot users + (if possible) one subject-matter reviewer; document overrides |
| Fairness metrics | Subgroup calibration, FPR/FNR tables in dashboard appendix |
| Auditing | Systematic test battery; log cases; optional audit tab |
| XAI | SHAP or top features + similar examples + model card |
| Privacy taxonomy | Data minimization; secondary use policy; leak testing for LLM |
| Agents / HAAC | Failure labels for LLM; human review; don’t sole-source crisis advice |

---

## 12. Suggested “exam-style” sentences for your report or video

You can adapt these (in your own words) to show course integration:

- “We applied the **Guidelines for Human-AI Interaction** (Microsoft HAX / CHI 2019) by scoping the system when uncertain and setting expectations about non-diagnosis.”
- “Following **Lecture 5**, we treated false positives and false negatives asymmetrically because the costs differ in a wellness context.”
- “Inspired by **value sensitive design** (Lecture #7), we ran a **pilot** before finalizing interface copy and risk communication.”
- “We report **calibration** and **error rate** differences across groups where sample size allows, acknowledging **inherent trade-offs** between fairness criteria (Lecture #8–9).”
- “We draw on **algorithm auditing** (Sandvig; everyday auditing) by maintaining structured test cases and user-reported failures.”
- “For the LLM module, we considered **HAAC-style** failure modes (hallucination, safety, manipulation, bias) and added human oversight.”
- “Privacy work follows **Solove** and the **CHI ’24 AI privacy taxonomy** — we minimized sensitive collection and documented secondary uses.”

---

## 13. Paper & resource index (quick lookup)

Use this to find primary sources named on slides (verify DOIs/years in your bibliography).

| Topic | Examples from lectures |
|--------|-------------------------|
| HAII guidelines | Amershi et al. CHI 2019; Microsoft **aka.ms/aiguidelines**; HAX Toolkit |
| Failures / alignment | Brian Christian; Bostrom; People + AI Guidebook; Morris CSCW 2014 |
| Stakeholder / values | Forlizzi 2018; Borning & Muller 2012; Zhu et al. VSAD CSCW 2018; Open Civic Design 2021 |
| Fairness (math) | Hardt et al.; Chouldechova; Kleinberg–Mullainathan–Raghavan; Dwork et al. fairness through awareness; Kearns et al. gerrymandering |
| Fairness (field) | Wang et al. 2020 perceived fairness; Cheng et al. CHI 2021; Yu et al. DIS 2020; ValueCards FAccT 2021 |
| Auditing | Sandvig et al. 2014; Metaxa et al. FnT HCI; Shen et al. CSCW 2021 everyday auditing; WeAudit / TAIGA |
| Transparency | Eslami et al. CHI 2015/2016/2018/2019; LIME; SHAP; Slack et al. AIES 2020; Kaur et al. CHI 2020 |
| Agents / sims | Park et al. UIST 2023 Generative Agents; Sotopia; virtual mental health patients (Zhu, Kraut, et al.) |
| Privacy | Westin; Nissenbaum; Solove; Lee et al. CHI ’24 taxonomy; Das PERP ’23; Privy / SEC paper |
| Extra slide facts | **§15** (logistics, numbers, URLs, class activities, WeAudit/TAIGA/Haac details) |

---

## 14. Project checklist (incorporate before you ship)

**Expectations & safety (Guidelines 1–2, 10–11; Lecture 5)**  
- [ ] Non-clinical disclaimer; high-stakes paths point to **human** help.  
- [ ] Model limits and **uncertainty** communicated without fake precision.  
- [ ] FP/FN **costs** named for your use case (e.g. unnecessary alarm vs missed signal).

**Fairness & data (Lectures #8–9; your `docs/DATA_LIMITATIONS.md`)**  
- [ ] Protected groups and **small-n** caveats documented.  
- [ ] Report **more than one** metric if you report fairness; note **trade-offs**.  
- [ ] Avoid “fairness washing” — metrics alone don’t prove fairness.

**Transparency (Lectures #12–13)**  
- [ ] **Existence** of model/LLM clear; **operation** sketched in plain language.  
- [ ] Explanations **specific** enough to act on — not vague “personalized” filler.  
- [ ] If using SHAP/LIME: remember **adversarial** and **misuse** risks.

**Privacy (Guest lecture; taxonomy)**  
- [ ] Data minimization; **secondary uses** stated; retention/deletion if applicable.  
- [ ] LLM: **memorization** / prompt logging considered; no PII in prompts if avoidable.

**Auditing & users (Lectures #10–11; Option B)**  
- [ ] Systematic **test cases** (inputs including edge cases).  
- [ ] **Pilot user** completed; feedback reflected in UI or doc.  
- [ ] LLM: **failure modes** (hallucination, safety, manipulation, bias, overconfidence, constraints).

**Submission (course)**  
- [ ] **Full prompts** for any commercial/generative model in code submission.  
- [ ] **Demo video** narrates class concepts + pilot influence.

---

## 15. Appendix — remaining slide-level detail (coverage pass)

Use this section to catch **facts, figures, and activities** on slides that are not repeated in §1–14 above. (Figures, screenshots, and purely visual slides have no extracted text.)

### Lecture #4 — Guidelines of HAII

- **Logistics (slide):** Reflection readings due **before class**, **Mon & Wed @ noon** (both sections).
- **In-class:** **Workbook** group activity (3–4 students); **Section B** signup; pick a feature/product; **two guidelines**; fill rows; share spreadsheet.
- **Discussion prompt:** “What are the **strengths and weaknesses** of the HAII guidelines?” (prepares critical essay-style critique).

### Lecture #5 — Designing for AI failures

- **Attribution:** Slides adapted from prior HAII, **Daniel M. Russell**, **Peter Norvig**, **People + AI Guidebook**.
- **Housing audit reference:** HUD / housing audit link (e.g. “what you need to know about HUD audit”) used as **audit** analogy before algorithm audits.
- **Risk:** “Severe failure” called out as a category before mitigation stories.
- **Class structure:** Recap → mitigating unintended consequences → **A/B/C** slide questions (instances of failure / error causes / design-time reduction).

### Lecture #7 — Stakeholder-driven AI design

- **Participation policy (slide):** **Two** unexcused absences allowed for activities; after that, participation deductions; chronic lateness affects grade; activities hard to make up.
- **Andrew Ng:** “Building Faster with AI” — slide marker in **process** / industry framing.
- **Human-centered design:** Two slogans — **“Designing the Right Thing”** vs **“Designing Things Right”** (Norman-style).
- **Case method:** Standard structure — **context** → **challenges** → **approaches** → **outcomes**.
- **Wikipedia recruitment evaluation numbers (slides):** Six-month deployment; **~16,000** editors evaluated; **4 batches** of **385** recommendations to **18** WikiProjects; algorithm rating means e.g. **3.24 / 2.36 / 2.33 / 2.76** by algorithm type; invitation clickthrough **47% / 16% / 22% / 28%**; experienced vs brand-new newcomer ratings **~2.85 vs 2.88**, invitation rates **34% vs 32%**.
- **Community tension:** Wikipedia policy tension — editors using Wikipedia for **experimentation** may be banned; counterexample cited: WikiProject editor recommendations as **good-faith** experiment.

### Lecture #8 — Fairness in ML

- **Slides 38–40:** “Risk assessment tool” **COMPAS** / visual — connect to ProPublica vs Northpointe debate on slides 41–42.
- **Harris County** (slide) — lawsuit/settlement referenced near failure-to-appear **alternative** framing (structural vs prediction).
- **Backup:** “Is prediction too narrow?” — **failure to appear**: predict vs **interventions** (childcare, transport, schedules); **Harris County** legal context on slide.

### Lecture #9 — Fairness in the field

- **Fairness gerrymandering** — also labeled **Fairness-Wash** (slide 11).
- **Optional readings** pointed to slides **7–12** (Kearns et al., Yu et al. DIS).
- **Boyne (2003):** Public sector **efficiency & equity** vs private **profit** — theoretical framing for equity module.
- **Equity findings themes:** **Tensions** of monitoring equity; **prioritization** of resources; **information and equity**; fear that equity data **backfires** on minority businesses (quotes B8, B3).

### Lecture #10 — AI Auditing

- **Third-party intervention** framing (Sandvig) — audits as external scrutiny.
- **Political bias** diagram: **Input → Algorithmic process → Output** with **Scraping audit** overlay.
- **Twitter cropping:** BBC and other links — **community testing** surfaced bias; **removal** of automatic cropping as resolution.
- **Everyday auditing lifecycle labels:** **Initiation → Awareness raising → Hypothesizing & testing → Remediation**; **Lifetime & dynamics** (ongoing).

### Lecture #11 — RAI in practice

- **Research team (WeAudit slide):** Wesley Deng, Howard Han, Clair Wang, Jason Hong, Ken Holstein, Motahhare Eslami; funders **NSF + Amazon FAI**, **Google Research Scholar**, **Cisco Ethics in AI**, **Microsoft Research AI & Society**, **Notre Dame–IBM Tech Ethics**.
- **TAIGA** = **Tool for Auditing Images Generated by AI** (in-prep CHI 2025 cited on slides).
- **User audit workflow verbs:** **INVESTIGATE** (inspect, reflect, explore) → **DELIBERATE** (report, discuss) — verify reports from others.
- **Pairwise comparison** user quote — subtle bias easier to see with **comparison** across prompts.
- **Peer reports** — “sense of community”; **intersectional** tags distribution.
- **Class:** **taiga.weaudit.org/search** for text-to-image auditing exploration.
- **HAAC** failure-mode **definitions** (short): Hallucination = fabricated specs/reviews; Safety = dangerous advice; Manipulation = upsell/urgency/emotion; Overconfidence = authority without uncertainty; Constraint violations = ignore budget/health limits; Bias = stereotyped/unequal recommendations.
- **Adversarial prompt examples** (slides): **Melatonin for 6-year-old** (safety); **emotional splurge under $500** (manipulation). Red-team instructions: complete **≥3 audit cycles** per condition.

### Lectures #12 & #13 — Transparency & interpretability

- **Misleading transparency:** Slide asks explicitly **wrong/misleading transparency?** — tie to youth & algorithmic racism (Epps-Darling).
- **Guessing game (GenAI):** Pittsburgh facts, multiplication, **fake resources** that “sound real,” wrong Google Docs help, historic event where ChatGPT says event didn’t exist — **overtrust** stats **59% / 20%** (Solyst et al., ICLS 2024).
- **Slack et al. AIES 2020:** `https://arxiv.org/pdf/1911.02508.pdf` — adversarial attacks on explanations.
- **LIME perturbation detail:** For binary features, set subset to 0 from 1; labels from black-box predictions on neighborhood.

### Lecture #18 — AI

- **fuguUX:** **10 free credits**; **fuguux.com**; **swarm** of agents on URL + task → narrated videos + prioritized report.

### Privacy guest lecture (Das + Lee)

- **Kelley et al. SOUP ’23:** **N = 10,011**, **10 countries** — expect **less privacy** due to AI.
- **AIAAIC:** **321** privacy-relevant incidents; technologies include **recommenders, LLMs, face recognition, home robots**.
- **Lee taxonomy paper:** CHI 2024 **Best Paper**; co-authors **Yu-Ju Yang, Thomas Serban Von Davier, Jodi Forlizzi, Sauvik Das**.
- **SEC paper title fragment:** *“I Don't Know If We're Doing Good. I Don't Know If We're Doing Bad”* — practitioner privacy work.
- **Privy summative expert ratings** (slide): relevancy mean **~4.97**, severity **~4.58** (1–6 scale); practitioner self-ratings **65–76%** high relevancy/severity buckets.
- **Privy mitigation dimensions** (Finding 2): **Addressing identified risks**, **useful conversation starter**, **product specificity**, **practicality** (~3.86–4.21 on 1–6).
- **Motivation key upshot (slide):** **Compliance 19/35**, **business alignment 9/35**, **social responsibility 5/35**; **many more inhibitors than motivators** overall.
- **PIA limitations named:** Privacy impact assessments **demand expert knowledge**, **slow to adapt**; LLM UIs can surface ethics/privacy **end-to-end** (positioning).
- **Class activity:** Privy link via **Slack** (not public); default **Grammarly** / **online ads** examples.

### Cross-reference: your project docs

- Tie data caveats to **Lecture #8–9** (base rates, subgroup sample size) and `docs/DATA_LIMITATIONS.md`.
- Tie deferred cleaning to **stakeholder** and **documentation** norms (Lecture #7).

---

*Generated from text extraction of your PDFs; slide figures and exact typography may differ. Cite original papers named on slides for academic work.*
