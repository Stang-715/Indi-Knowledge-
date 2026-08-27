# The Victoria 3 UI Census — every menu, submenu, and button, and what each does

Research round for *Paramountcy*'s menu system. **This document is the deliverable the
design phase waits on**: a complete inventory of Victoria 3's HUD and menus, button by
button, before we design anything. Six parallel research passes over the official Paradox
wiki, the attackofthefanboy guide, gamepressure, Steam guides, dev diaries, reviews — and,
for the military/diplomacy sections, **the game's own localization files**, so those
labels are verbatim game strings.

## How to read this

- Six sections, each a region of the UI. Tables are `Element | What it does | Badge/hover | Notes`.
- `[V]` / "verbatim" = confirmed against wiki text or game files. `[unverified]` / `(lc)` =
  reconstructed from converging sources; spot-check before pixel-copying.
- **Two corrections to the prompt that started this:** (1) since patch 1.9 the game has
  **four lenses, not five** — the Trade lens was deleted with the World Market rework;
  (2) the current patch is **1.13 "The Great Wave" (Apr 2026)**, which replaced convoys
  and admiral orders with Naval Missions. Every section carries version notes so we can
  target any patch's layout deliberately rather than mixing eras by accident.

## The census at a glance

Roughly **400+ distinct interactive elements** across:

| Region | Approximate count | Section |
|---|---|---|
| Top bar, situations/alerts, outliner, time | ~35 | 1 |
| Left icon bar (17 buttons) + Country, Budget, Politics, Culture, Population panels | ~90 | 2 |
| Buildings, Market, Trade, Companies, Tech, Journal, Power Blocs | ~110 | 3 |
| Military (formations, orders, mobilization) + Diplomacy (actions, treaties, plays, war) | ~130 | 4 |
| Lens bar (4–5 lenses × sub-tools), 25+ map modes, state panel, map interaction | ~70 | 5 |
| Launcher, main menu, setup, escape menu, settings, events, tooltips, tutorial | ~60 | 6 |

## The five-part pattern, checked against reality

1. **Status bar** — real, and *smaller* than reviewers remember: 4 numbers + 3 capacity
   meters + rank; the second stats row is a toggle. Everything on it is a click-through.
2. **Topic drawers** — 17 left-bar entries, not 5. Paradox splits them into *major*
   (weekly-use: Politics, Budget, Buildings, Market, Military, Power Bloc) and *minor*
   (reference: Diplomacy, Tech, Culture, Population, Journal, Companies, Ledger, help).
   That two-tier split is the discipline the prompt's "5 categories" flattens.
3. **Lenses** — the real pattern is stronger than "redraw the map": a lens arms a
   *tool*, the map recolors into an **eligibility palette** (green/orange/blue/red/white),
   and the click *executes on the map object*. And Paradox **deleted a lens** (Trade, 1.9)
   when its verb stopped being a player action — lenses are for verbs, not subjects.
4. **Outliner** — user pinning via star icons anywhere + non-removable auto-pins for
   ongoing processes (law votes, plays, wars) + tabs since 1.6.
5. **Alerts** — one situations button (count badge, gold glow), color-coded list,
   right-click dismiss with a restore-counter, and per-type routing
   (Pop-up/Toast/Feed/off). It took two patches (−50% volume in 1.2) to make this livable.

## Design lessons the sources agree on (for our design phase)

- **The #1 complaint is fragmentation**, not density: "at no point does the player have
  all the information they need at hand" — the cure Paradox actually shipped was fewer,
  bigger panels (1.6 Pop Browser) and deleting systems (1.9 trade), not more tabs.
- **Nested tooltips are the best and worst feature at once**: praised as the teaching
  layer, damned when load-bearing data lives only at the bottom of a tooltip chain.
- **Notification volume is a balance problem**, tuned like gameplay (1.1 rerouting,
  1.2 −50% cut). Ship the routing controls on day one.
- **Every eligibility state needs a color**, including "no, and you can't fix it" (white)
  vs "no, but you could" (red) — that one distinction does enormous teaching work.
- **Predictive tooltips before commitment** (projected budget impact of an expand, PM
  change previews, treaty acceptance chips) are what make hundreds of buttons safe to press.

---

## SECTION: Top bar, Current Situations, Outliner, Time controls, Journal widget
# (agent 1 findings, verbatim — sources [W]=vic3.paradoxwikis.com, [A]=attackofthefanboy, [G]=gamepressure, [S]=Steam guide, [K]=shortcut refs, [DD]=dev diaries)

## 1. Top bar (top-left) — two rows

| Element | What clicking does | Badge / hover | Notes |
|---|---|---|---|
| Country flag | Opens the country tab / country overview panel | Country summary tooltip [hover unverified] | Leftmost [W][A] |
| Rank cockade (circle+number under flag) | Opens rankings/prestige info | Number = score/rank position; hover: current prestige + prestige to move up/down a rank | 7 rank tiers via Prestige+Recognition [W] |
| Bureaucracy readout | Opens relevant panel [click target unverified] | Fill-scale by usage; hover: generation vs usage sources | Capacity 1 [A][G][S] |
| Authority readout | Same pattern [unverified] | Fill-scale + hover breakdown | Decrees, consumption taxes, IG interactions [G] |
| Influence readout | Same pattern [unverified] | Fill-scale + hover; cap from rank | Diplomatic pacts [G] |
| Money / Treasury | Opens Budget window | Treasury total + weekly balance (resolves Mondays); green=positive, white=positive-but-temp-negative, red=net negative | Loans/gold reserve details live in Budget panel [W][S] |
| Second row stats: GDP, Literacy, Standard of Living, Population, Radicals, Loyalists | Each a shortcut to its detail panel [per-stat targets unverified] | Values at a glance | Release-era: toggle switch bottom-right of bar shows/hides this row [A]. Innovation & Legitimacy are NOT on the bar |

## 2. Current Situations button + alerts

| Element | What it does | Badge / hover | Notes |
|---|---|---|---|
| Current Situations button (circle+number, right of top bar) | Opens situations list | Number = unique situation categories; glows gold on new info [W] | |
| Situation entries | Click → jump to relevant screen | Grouped by type, color-coded by priority — red = high [W] | Types: law passage, diplomatic actions, plays, brewing revolutions, pending events, elections |
| Dismissing | Right-click, or hover right side → small "x" [W] | — | Dismissable |
| Refresh icon (top of list) | Restores all removed situations | Number = how many removed [W] | Appears only after removals |
| Floating alert icons (beside button) | Left-click → screen; right-click → dismiss [W] | Per message settings | e.g. no research (light-bulb), revolution brewing, heavy army losses |
| Message settings button (top of list / top-right of screen) | Opens Message Settings: per-type routing | Options include Toast / Feed / Pop-up / disable [exact per-type list unverified] | 1.2 rework cut volume ~50% [DD74] |
| Notification feed / toasts | Stack near top; click → related content [unverified] | — | |

## 3. Outliner (right side)

| Element | What it does | Badge / hover | Notes |
|---|---|---|---|
| Auto-pinned situations block | Law votes, diplomatic actions/plays, revolutions, pending events auto-pin; many NOT removable while ongoing [W] | Progress per item | Under calendar widget |
| Auto-pinned journal entries | Click → open entry; star icon unpins [W][DD104] | — | |
| Pin bar / pinned lists | Pin any eligible menu via star icon next to its header: diplomacy, commanders, market prices, formations, interest groups, journal entries, countries [W][A][G] | — | Below calendar widget |
| Outliner tabs (1.6+) | Pinned / Economy / Politics / Diplomacy / Military / All [DD104] | — | 1.6 added header icon buttons: go-to, pin-to-outliner, zoom-to |
| Construction queue tracker | Click → Construction sub-tab of Buildings menu [A] | Construction points / queue items | Under calendar widget |

## 4. Time controls (top-right)

| Element | What it does | Notes |
|---|---|---|
| Date display (calendar widget) | Shows current date | Top-right |
| Pause button | Pause/unpause | Hotkey Space |
| Speed gauge I–V | Sets speed 1–5 | Hotkeys 1–5; Numpad +/− step speed |
| Journal hotkey | F10 opens Journal | Outliner reported Shift+F1 [unverified] |

## 5. Journal widget

| Element | What it does | Notes |
|---|---|---|
| Journal button (left column, orange icon) | Opens Journal panel: active entries + available decisions | F10 |
| Pinned entries (top-right) | Track objectives on main screen; click opens; star unpins | Auto-pinned on activation |

## 6. Other top-of-screen

- Message settings gear top-right: confirmed [W]
- Light-bulb icon right of situations button: research/essential alerts [G] [click behavior unverified]
- Esc → pause/settings menu; no dedicated top-bar search/screenshot buttons found

## Version notes
- 1.2 (DD74): notification volume −50%, message-settings rework
- 1.6 (DD104): outliner tabs, unpinnable auto-items, header go-to/pin/zoom buttons
- 1.9 "Lady Grey" (Jun 2025): no top-bar/outliner layout changes found

---

## SECTION: Left panel bar (complete), Country Overview, Budget, Politics/Laws, Culture & Religion, Population
# (agent 2 findings — condensed verbatim)

## Left-side panel icon bar (complete)
Hotkeys from wiki default.profile: politics=Q, budget=W, buildings=E, market=R, military=T; diplomacy=F1, technology=F2, culture=F3, population=F4, journal=F5. Rebindable.

| # | Button | Hotkey | Opens | Notes |
|---|---|---|---|---|
| 0 | Country flag + name (vitals header) | click | Country/Government Overview | Shows flag, rank, prestige, GDP, 3 capacities always visible; each readout clickable |
| 1 | Politics (major) | Q | Politics panel | Badge: low legitimacy / election / stalled law |
| 2 | Budget (major) | W | Budget panel | Red tint on deficit/near default |
| 3 | Buildings (major) | E | Buildings panel | Urban/Rural/Development tabs; construction controls here since 1.5 |
| 4 | Market/Trade (major) | R | Market panel | 1.9: World Market layer, routes removed, filters, price-history graphs |
| 5 | Military (major) | T | Military panel | 1.5 formations rework |
| 6 | Power Bloc (major, 1.7+) | — | Power Bloc panel | Only shown if in/leading a bloc |
| 7 | Diplomacy (minor) | F1 | Diplomacy panel | |
| 8 | Technology (minor) | F2 | Tech trees | |
| 9 | Culture (minor) | F3 | Culture & Religion panel | |
| 10 | Population (minor) | F4 | Population panel | |
| 11 | Journal (minor) | F5 | Journal entries + decisions | |
| 12 | Companies (minor, 1.5+) | — | Companies panel | 1.9 charters, overseas HQs |
| 13 | Trade Routes (minor, pre-1.9 only) | — | Trade routes list | REMOVED in 1.9 |
| 14 | Ledger (minor) | — | Sortable rankings by GDP/pop/SoL/literacy | |
| 15 | Outliner toggle (minor) | — | Show/hide right-side outliner | |
| 16 | Vickypedia "?" (minor, 1.3+) | — | Searchable concept encyclopedia | |

## Country/Government Overview (click flag)
- Flag + name + government type (name reflects laws); hover full tooltip
- Rank badge: GP/Major/Unrecognized Major/Minor/Unrecognized/Insignificant (+Decentralized); hover: prestige thresholds (GP = ≥3× avg global prestige OR ≥75% of top nation), recognition status
- Prestige value → breakdown: GDP, army/navy power projection, prestige goods, subjects, events
- Vitals row (GDP, population, literacy, SoL) each clickable to deep panel; trend arrows
- Capacities Bureaucracy/Authority/Influence: click → itemized usage; red when overdrawn
- Modifiers list: icon row, hover = name/effects/duration
- Subjects/Overlord block: subject list w/ type (puppet/protectorate/dominion/colony); click → their panel; diplomatic action buttons
- Ruler & heir portraits → character panel (ideology, traits, popularity, IG)

## Budget panel (W)
Header: weekly balance + gold reserve/debt readout with graph. Income column | Expenses column.
- Tax level buttons (Very Low→Very High, 5 steps): global tax multiplier; hover shows projected income delta + per-IG approval effect
- Income rows: taxes (by type per taxation law), consumption taxes (per good), tariffs, minting (0.1% yearly GDP/week, cap ~£200K base, raised by gold mines/techs), gov dividends, investment pool transfers, diplomatic income
- Expense rows: government wages, military wages, subsidies, interest, diplomatic expenses, construction goods (reported here, controlled in Buildings since 1.5)
- Government wages setting (5 levels): pay of gov pops; approval/qualifications effects
- Military wages setting (5 levels): soldier/officer pay; Armed Forces approval, morale
- Consumption taxes: "Add consumption tax" → nested dialog pick good; costs Authority while active; each active tax listed w/ revenue + cancel X
- Gold reserve graph: treasury over time; surplus pays debt then accumulates to reserve cap (scales with GDP); over-cap devalues
- Loans/debt: automatic against credit limit; weekly interest; bar yellow near limit, red over; over limit → default risk / Declare Bankruptcy
- No manual take/repay loan buttons — borrowing automatic

## Politics panel (Q) — tabs: Overview | Government | Laws | Institutions (+ Movements section, 1.8 rework)
### Overview
- Ruler/Heir/HoG portraits → character sheets
- Interest group list: icon, name, Clout %, Approval −10..+10, leader, ideology icons, membership; "marginalized"/"powerful" tags; click → IG dialog (overview/leader/ideologies with per-law stances/traits unlocked at ±5 approval)
- Bolster/Suppress: pre-1.8 on IGs; 1.8+ moved to Political Movements
- Movements list: ideology, supporting pops %, radicalism gauge, activity (petitions→agitation→revolution); click → demands, supporters, suppress/bolster, meet-demands shortcut
- Revolution progress bar: countdown clock, seceding states painted; flashing red badge
### Government
- Legitimacy dial 0–100: from governing clout share (+votes % in democracies); −20 per extra IG/party over allowance; ideological incoherence penalties; bands give modifiers
- In Government column | Opposition column
- "Reform Government" → nested dialog: toggle IGs/parties into proposed government, preview legitimacy, Confirm starts transition cooldown; parties move as blocs
- Parties section (election countries): dynamic party cards, member IGs, combined clout, leader
- Elections widget: countdown (4-yr cycle), campaign phase bar, predicted vote share, momentum swings
### Laws
- ~21 law groups in 3 columns: Power Structure (Governance Principles, Distribution of Power, Citizenship, Church & State, Bureaucracy, Army Model, Internal Security), Economy (Economic System, Trade Policy, Taxation, Colonization, Education, Health...), Human Rights (Free Speech, Labor Rights, Children's Rights, Rights of Women, Welfare, Migration, Slavery)
- Click group → dialog listing every law: padlock if tech missing; hover: effects + per-IG stance
- Enact button: one law at a time; disabled tooltip explains blockers
- Enactment progress widget: 3 phases, checkpoint ~100 days; rolls Success/Advance/Debate/Stall; percent chips; stall count can force abandonment; pinned to outliner
- Cancel enactment: angers supporting movement
- Radicals/loyalists preview in law dialog
- 1.9: negotiation/amendments flow [partially unverified]
### Institutions
- List (Schools, Health, Police, Colonial Affairs, Home Affairs, Social Security, Workplace Safety...): +/− level stepper, each level costs Bureaucracy; red badge when overdrawn
### Decrees
- NOT here — issued per-state from the State panel (Authority cost)

## Culture & Religion panel (F3)
- Primary culture(s) header w/ heritage/language trait icons
- State religion header + Church & State law link
- Culture list: population, %, acceptance/discrimination status (1.9: Acceptance 0–100 ladder), radicalism tendency, SoL; click → culture dialog (traits, homelands, obsessions, states, pops)
- Religion list: same structure; taboos (goods not consumed)
- Conversion/assimilation readout per culture/religion
- Obsessions/taboos strip of good icons

## Population panel (F4)
- Header stats: total pop, growth, literacy %, avg SoL, workforce vs dependents, unemployment, radicals & loyalists — each clickable/hover breakdown
- Charts: strata, profession, culture, religion, workforce composition
- Pop list columns: profession icon, size, culture, religion, state, workplace, wealth, SoL, income, literacy, clout contribution, radicals/loyalists; click row → pop dialog (needs basket, income, qualifications, IG attraction, votes, assimilation)
- Filters: state, profession, culture, religion, strata, employment status; sortable column headers
- Unemployment view; radicals & loyalists view

## Version notes
- 1.3: 3-phase law enactment + revolution clock; Vickypedia
- 1.5: formations rework; Companies panel added; construction spending → Buildings panel
- 1.7: Power Bloc button; subject interaction & lobby UI
- 1.8: movements rework; bolster/suppress moved IGs→movements; cultural/religious movements
- 1.9: trade routes deleted (World Market); company charters; discrimination → Acceptance 0–100; Trade Routes button removed

---

## SECTION: Buildings, Markets/Goods, Trade (pre/post 1.9), Companies, Technology, Journal, Power Blocs
# (agent 3 findings — condensed verbatim; (lc)=low confidence)

## 1. BUILDINGS panel
- Category filter tabs: Agriculture/Ranching/Plantations (rural), Extraction, Manufacturing, Infrastructure, Urban Facilities, Development, Government, Military, Monuments (labels lc)
- Building-type row (collapsed): total levels, employment, aggregate weekly balance, PM summary ("mixed" indicator); chevron expands per-state
- Set-all PM dropdowns on type row: change a PM for every building of that type nationwide; predictive tooltip (projected profit/employment)
- Per-state row → Building details panel: level count ("3 +1" while expanding), employment bar, weekly balance
- Expand "+": queues +1 level (cost/queue position tooltip); post-1.8 only government-buildable levels — private queue expands its own
- Downsize "−": demolish w/ warning (fired workers)
- Auto-expand toggle: auto-queue when profitable, staffed, reserves ~95%, spare infrastructure
- Subsidize toggle: treasury covers losses; shows as Budget expense
- PM dropdowns: one per PM GROUP (mutually exclusive slot; 1–4 groups per building: base process, refining, power, automation, ...); hover = predicted balance/IO/employment. 1.0–1.7 had Ownership PM group; 1.8 replaced with ownership-shares system
- Employment display: professions employed vs needed; qualification shortages
- Cash reserves bar: fills first when profitable; national credit limit = base + sum of building reserves
- Balance sheet: revenue − inputs − wages; reserves skim; rest = dividends + investment pool
- Ownership section (1.8+): local workforce, Financial Districts/Manor Houses, Companies, foreign countries, government; foreign flagged
- Nationalize button (flag icon): if Economic System allows; cost + radicals warning
- Privatize action; 1.9: right-click context menu on buildings for privatize/nationalize
- Throughput/modifier list: state traits, companies +15%, executives, infamy, blockades

## 2. MARKETS/GOODS panel
- Header: national market (name, members, market capital), Market Access % (MAPI blends local vs market price)
- Goods category filters: Staple / Industrial / Luxury / Military
- Goods rows: icon, name, Sell Orders, Buy Orders, Balance, Price + trend; price band −75%..+75% of base; hover full order breakdown
- Shortage warning icon (lc)
- Good details panel: Producers list (click → building), Consumers list (buildings + pop needs), Trade/Market tab (pre-1.9 routes; 1.9 World Market exports/imports + Trade Advantage)
- Tariff/Subvention controls (1.9): per good per direction — none/12.5%/25%/50% of base price; cap by Trade Policy law; Free Trade disables tariffs; set one good at a time (no bulk vanilla)
- Local price table per state; pin star → outliner (market prices pinnable)

## 3. TRADE
### Pre-1.9 Trade Routes panel
- Route rows grouped export/import: good, route level, partner flag, weekly profit, convoy usage; auto level up/down with profitability
- "Establish new trade route": dialog — pick good (price compare + predicted profit), pick partner market, Import/Export, confirm (bureaucracy + convoys, run by Trade Center)
- Cancel X; Market Goods Policy dropdown per good (No Priority / Protect Domestic Supply / Encourage Exports)
- Embargo diplomatic action; auto-embargo at 100 infamy
### Post-1.9 World Market
- World Market panel: per-good WM price, your exports/imports, Trade Advantage
- Trade Centers trade autonomously; PM ladder scales traded qty; Trade Capacity base 50/level
- Trade Advantage: base 100; Trade Privileges treaties, Interests, Trade Policy law (Mercantilism +25% exp/−25% imp; Free Trade +25% all), spare capacity +20%, company Trade Centers; Relative advantage moves realized price; 100% of world exports → +20% WM price
- Treaties (1.9): Trade Privileges (25 yrs), No Tariffs/No Subventions per good, transit rights; break early → reputation hit
- Blockades: admiral order reduces WM access/lane efficiency/port throughput
- Treaty Ports: exempt from tariffs/subventions/embargoes both directions

## 4. COMPANIES panel (briefcase icon)
- Slots header: 1st from Corporate Charters tech, +1 per Society tier to 5 at Macroeconomics; +1 Technocracy law; +1 Companies III principle; canal companies extra (~9 ceiling)
- Company card: logo, name, Executive portrait (1.9: character, joins IG, trait bonuses; ±1 prosperity per 5 popularity), owned building types & levels
- Prosperity bar: target from productivity vs global avg ±50, +1/staffed level to +50, executive; Prosperous ≥100, lost <75; company buildings always +15% throughput
- Charter slots (1.9): Trade Rights (no DLC needed), Investment Rights (foreign Regional HQ), Colonization Rights (100 Authority + Interest), Industry Rights (+1 building type), Monopoly Rights; free slots from tech/laws, then 100 Authority upkeep each
- Prestige Good: Prosperous + top-3 global producer 36 cumulative months → renameable prestige good
- Available companies dropdowns: flavored/historical vs basic; requirement checklist green/red
- Establish button: typically 5 levels of associated building in one state to transfer (pay for private levels post-1.8/1.9)
- Disband (lc placement)

## 5. TECHNOLOGY panel
- Tabs: Production / Military / Society (177 techs + Sericulture exclusive); era columns I–V
- Tech cards: click = set active research (one at a time); SHIFT-CLICK = queue; clicking tech w/ unresearched prereqs queues the chain; states: researched/researching %/queued #/locked; hover: innovation cost, unlocks, spread progress
- Current research header: tech, weekly innovation, ETA
- Innovation: cap = 50 base + 1.5 per 1% literacy; over-cap boosts Technology Spread at reduced efficiency; universities government-run (wage bill)
- Spread indicators: passive progress on techs others have; scales with literacy/laws/recognition; boosted by actively researching same tech
- Era zoom-out view (readability weak, dev-acknowledged)

## 6. JOURNAL panel
- Active entry rows: icon + title + goal; expand = description + condition checklist (✓/✗)
- Progress bars (1.7+: multiple scripted bars, shared, auto-increment)
- Timeout countdown with expiry effect
- Pin star: auto-pinned high-importance top-right; manual star toggles; ordered by weight
- In-entry scripted buttons (1.7+) firing effects
- No completed-entries history UI

## 7. POWER BLOCS panel (1.7+, between Military and Diplomacy, F6)
- Form Power Bloc: 500 Influence; GP/Major rank, not Isolationism; wizard: Central Identity Pillar (Trade League only without DLC; Sovereign Empire, Ideological Union, Military Treaty, Religious Convocation), name, emblem, statue, first principle
- Header: name, emblem, pillar, leader, bloc rank; DLC: Customize button
- Cohesion meter: Orchestrated/Controlled/Stable/Divided/Fractured; drift ±1/wk toward target; pillar-specific inputs; −1..−3 per non-subject member; non-GP leader −50%
- Mandate progress: 2000/mandate; GP +10, Major +5, Minor +2 contributions × cohesion multiplier; spend to unlock/level principles (3 levels)
- Principles row: level pips I–III; "+" when mandate banked; e.g. Companies III +1 slot; Market Unification II +20% tariffs vs non-members
- Members list: flag, rank, contribution, cohesion impact, leverage; subjects auto-members; leader actions after 5 yrs (subjugate / force regime change / convert religion by pillar)
- Expel member (leader): −50 relations, 12-mo truce, −10% cohesion; Leave (member)
- Invite: needs +200 Leverage Advantage + relations; rejection −50 both ways; sway with obligation
- Leverage view/lens: current + predicted leverage vs competing blocs; sources: Interest +100, adjacency +100, shared culture trait +150, economic dependence, treaty articles ~+300; resistance GP 1000/Major 750/Minor 500/Insig 250 (+25% Censorship)
- Power Struggle: member +20% prestige can start; hold +15% 12 mo flips leadership
- Power Bloc Statue building: +3 prestige, pillar-specific state bonus

## 8. Version quick sheet
- Trade: routes (≤1.8) → World Market + tariffs/subventions + treaties (1.9)
- Ownership: PM group (≤1.7) → shares (1.8) → privatize/nationalize both ways + right-click menu (1.9)
- Companies: simple bonuses (1.5) → executives/charters/HQs/prestige goods (1.9)
- Power blocs: none → full panel (1.7+)
- Journal: static bars → scripted bars + buttons (1.7+)

---

## SECTION: Military panel & formations, commander orders, naval missions, mobilization, diplomacy actions, treaties, plays, war/peace
# (agent 4 findings — verified against the game's own localization files; labels are VERBATIM game strings)

## PATCH REALITY CHECK
Current live patch as of Aug 2026 is **1.13 "The Great Wave"** (naval overhaul, Apr 2026) — not 1.9.
Timeline: 1.5 formations rework · 1.6 outliner tabs · 1.7 power blocs · 1.9 treaties replace most pacts + bulk formation editing + Military Access invasions · 1.13 naval overhaul (convoys → Merchant Marine + Supply Ships; admiral orders → Naval Missions; piracy/privateering, flagships, retrofits).

## 1. Entry points
- Left-bar Military button (F5): military panel; alert badges for idle formations/missing commanders
- Diplomacy: per-country panels (click any flag/country) + Diplomatic lens; own country via top-left flag
- Military lens: tabs Army/Navy; options Create Army, Create Fleet, "Plan Invasion", "Designate Strategic Objectives" (also a map mode); rows show "#N available targets"
- Diplomatic lens tabs (verbatim): "Diplomatic Plays" / "Diplomatic Demands", "Diplomatic Actions", "Overlord Actions", "Subject Actions", "Establish Colony", "Declare Interests", "Regional Actions"; green number on each play = how many countries it can target
- Outliner: auto-pins plays/actions/wars; pinnable formations, commanders, countries, treaties; star icons
- Right-click: country → shortcuts incl. "Show active Treaties with [Country]"; commander → "Split Formation"/Promote; front marker → "Right-click to deploy the selected Military Formations to this Front"

## 2. Military panel (country level)
Header: Battalions readout (hover: count, ranking, Army Power Projection, army list) · Regular/Conscript overview ("N Battalions (X% Mobilized)") · Ships readout · "Mobilize all Armies"/"Demobilize all Armies" (confirm dialog) · "Activate conscripts" · "Create Army"/"Create Fleet" (pick HQ; errors: temporary HQ / not yours) · "Recruit additional General/Admiral" (dialog: 3 candidates w/ traits, age, IG, upkeep; Recruit button; costs Bureaucracy, promote = half) · HQ groupings + "Unassigned Characters" · garrison rows.
Formation rows: name+flag+count (click opens formation panel; ctrl/shift multi-select = bulk edit 1.9+) · commander portrait (Current/Next Order hover) · status line (verbatim set: "At [Front]", "Stationed at [HQ]", "Traveling to [Front] (Nd)", "Waiting for a Front", "No path to target", "Waiting to embark", "Merging with [Formation]", "Preparing Naval Invasion…", "Retrofitting Ships", "Returning to [State] for repairs", "Repairing and refilling crew", "No port to refill crew", "Currently Defeated") · morale/organization/attrition icons · mobilize toggle · pin + zoom buttons.
Bulk-edit bar (1.9+): "Merge selected Armies/Fleets" (post-merge Organization preview), order buttons for N commanders, mobilization-option toggles for N armies, mobilize/demobilize selected.

## 3. Military Formation panel — tabs: Information · Mobilization · Modifiers · Buildings
### Information
- Commander card → "Commander Orders" picker; "Promote" (effects: command limit; capped "#N max rank"); "Split Formation" (confirm)
- Stats strip: manpower, avg Offense/Defense, Organization %, Morale %, attrition, upkeep (per-source hovers)
- Formation order: "Stand By" (armies) / "Anchor Fleet" (fleets); front deployment via right-click
- "Assign a Strategic Objective": state picker; advancing generals push toward it; defenders prioritize it; click again to change/remove
- Unit composition editor: rows per Combat Unit Group (Infantry, Artillery, Cavalry, Marines) then per unit type; "+ Recruit [type]" (from Barracks in home HQ), "− Disband [type]" (least experienced; Shift=5, Ctrl=10; removes building level), "Upgrade [type]→[selected]" / per-group / "Upgrade All Units"; per-group default-type dropdown "(default)"
- Conscript variants of recruit/disband/upgrade; "Raise N Conscripts" button (activates Conscription Centers; active until demobilized)
- "Transfer Units to another Army/Fleet"; red "Disband [Formation]"; "Formation Settings" → "Allow borrowing and lending troops"
- Fleet extras (1.13): "Recall for repairs", retrofit status
### Commander orders (verbatim names)
Generals: Advance Front, Defend Front, Stand By; specials: Cautious Advance, Reckless Advance, Heavy Barrage, Rapid Advance (≥30% cavalry), Heavy Advance (tanks), Pillage; defensive: Adamant Defence, Counter Charge, Last Stand, Delaying Tactics.
Admirals pre-1.13: Intercept, Raid Convoys, Escort Convoys, Blockade, Port Bombardment, Naval Invasion support, "Project Power into [Region]".
### Naval Missions (1.13): Interception, Hunt Pirates, Blockade (efficiency/strength/min-presence), Raid Supply Lines, Protect Supply Lines, Project Power, Port Bombardment, Piracy, Privateering. Missions span 1–N sea regions ("2/4 Sea Regions (Mission Efficiency: 85%)"); right-click adds regions.
### Naval invasion planner
Lens "Plan Invasion" → pick army + fleet + target state → panel "Naval Invasion in [State]": missing-ships/battalions errors, power-projection warning, fleet-capacity split warning, mobilization gate, "All Generals' Orders will be forced to Advance", estimated departure, "Invasion is Stalled" badge. Landing statuses tracked. Sea node contested if enemy fleet ≥25% power projection. Land invasions via Military Access (1.9+) with reach/time errors.
### Mobilization tab — option groups (verbatim)
Supplies: Basic (mandatory), Extra, Luxurious · Supplements: Chocolate, Tobacco, Liquor, Opium, Narcotics · Transportation: Forced March, Rail Transport, Truck Transport · Reconnaissance: Balloon, Motorized, Aerial · Support Equipment: Machine Gunners, Flamethrowers, Chemical Weapons · Medical Support: First Aid, Field Hospitals.
Each tile: activate/deactivate w/ per-battalion effects + upkeep; confirm dialog; removal penalties (−50% morale for supplies/marches; ±org hits for equipment/medical). Mutually exclusive within group.
### Modifiers & Buildings tabs
Modifiers list; Buildings tab lists the Barracks/Naval Bases/Conscription Centers feeding the formation → jump to building panel (PMs set unit goods).
### Conscription
Conscription Center building per state, level = rate × population, capped by Army Model law; map interaction "Select State to activate Conscription Center".

## 4. Diplomacy
### Concepts/badges (verbatim sets)
Relations bands: Friendly, Amicable, Cordial, Neutral, Poor, Cold, Hostile. Attitudes: Human, Disinterested, Cautious, Cooperative, Conciliatory, Genial, Loyal, Protective, Wary, Antagonistic, Belligerent, Domineering, Rebellious, Defiant, Aloof. Infamy thresholds: Reputable, Infamous, Notorious, Pariah. Interests per strategic region.
### Country panel tabs (verbatim): Information · Diplomacy · Domestic · Interactions · Modifiers
Diplomacy tab: relations + attitude, rank/tier, infamy, truces, obligations, subject relation + liberty desire, Treaties list, ongoing actions.
### Interactions tab — standalone diplomatic actions (verbatim propose labels; ✻=ongoing, ⚑=accept/decline)
Begin/Stop Improving Relations ✻ · Begin/Stop Damaging Relations ✻ · Expel Diplomats · Absolve Obligation · Declare/End Rivalry ✻ · Embargo/End Embargo ✻ · Violate Sovereignty ⚑ · Trade States ⚑ · Demand Humiliation ✻ · Demand War Reparations ✻ · Demand Colonization Rights ✻ · Subjugation: Make into Protectorate/Puppet/Dominion/Personal Union/Vassal/Tributary/Colony/Chartered Company ⚑; Grant Independence; Ask to Become … · Overlord↔subject: Raise/Decrease Payments, Exempt From Service, Appoint/Request Governor, Grant/Request/Revoke Market Control, Increase/Decrease Autonomy, Support Regime, Offer/Request Knowledge Sharing, Evangelize, Grant/Request Investment Rights, Grant/Take/Demand State, Change Language of Administration · Enforce Military Access (1.9+) · Power-bloc: invite/request to join, Host/Request/Revoke Power Bloc Embassy, Force Regime Change, Impose State Religion, Subjugate, Spread Primary Culture · Start/Stop Funding Lobbies ✻ (1.8+) · Offer to Support Independence ✻ · Doctrine of Lapse (SoI DLC).
REMOVED as actions in 1.9 (now treaty articles): Alliance, Defensive Pact, Trade Agreement, Bankroll, Guarantee Independence, Military Access, Foreign Investment Rights, Take On Debt, Military Assistance, Transfer State, Customs Union.
### Treaty UI (1.9+)
Two columns "Your Articles" / "[Country's] Articles"; categories Mutual Agreements / Offer / Demand / Directional (+ greyed Unavailable sections); per-article acceptance chip (>+30 auto-accept, ≤0 decline, 0–29 chance); article input selectors (good/amount/£/company/state/country/region/law); quantity chips; Binding Period 5/10/15/25/99 yrs (break early = infamy/relations/truce penalties); custom treaty name (else auto-generated); "Make this work" (auto-add articles until acceptable); "Send Proposal" → Accept/Decline; existing rows: "Renegotiate" (blocked if Enforced) and "Withdraw" (confirm, whole treaty or listed articles).
Article list (current): Alliance, Defensive Pact, Guarantee Independence, Support Independence, Recognize Independence, Military Access, Strait Access, No Strait Closure, Toll Exemption, No Tolls, Transit Rights, Trade Privileges, Mutual Free Trade, No Tariffs, No Subventions, Enforce Embargo, Prohibit Trade with World Market, Money Transfer, Goods Transfer, State Transfer, Transfer Subject, Take on Debt, Military Assistance, Investment Rights, Company Monopoly, Treaty Port, Offer Embassy, Law Commitment, Non-Colonization Agreement, Join Power Bloc, Power Bloc Embassy, Non-Piracy Agreement (1.13), Abandon Piracy (1.13).

## 5. Diplomatic plays
Start: Diplomatic lens → Plays tab → type list (green target-count badge) → target → confirmation (initiating wargoal, infamy, participants preview). Block reasons verbatim (truce, already at war, relations too high, must be GP, pending demand...).
Play types: War Reparations, Open Market, Regime Change, Ban Slavery, Conquer State, Return State, Independence, Leave Power Bloc, Liberate Subject, Liberate Country, Take Treaty Port, Force Recognition, Cut Down to Size, Transfer Subject, Make Protectorate/Dominion/Tributary, Reduce/Increase Autonomy, Annex Subject, Revolution, Secession, Enforce Treaty Article (1.9+), Unification plays + Unification Leadership, Humiliation, Colonization Rights, Investment Rights, Force Nationalization, Join Power Bloc.
War-goal types: (same set plus) Revoke Claim, Revoke All Claims, Annex Country, Strait Access, No Tolls, Toll Exemption, No Strait Closure, Restore Union.
Play panel: escalation bar 0→100 with phases "Opening Moves" (ends at 20) → "Diplomatic Maneuvers" → "Countdown to War"; two-column who-joins display (leaders, backers, undecided w/ lean icons; hover = stance + forces + acceptance factors); Maneuvers pools both sides; "Add War Goal" dialog (maneuver + infamy cost; validity errors); "Make Primary Demand" (leader/subject targets only); "Sway" per country (offers: Obligation fixed cost, wargoals on their behalf, money, treaty promises); "Negotiate Support" (reverse sway; call in Obligation); third parties: Support / Oppose / Declare Neutrality (phase-gated); "Back Down"/"Give In" (enforces other side's primary demands, truce + obligations; not during Opening Moves); target-switch rules; mobilization strip during play.

## 6. War UI — War panel tabs: Overview · Make Peace
Overview: Initiator/Target headers; War Support meters (hover: initial / from battles / exhaustion / events / fervor / lobbies; floor rule if wargoals uncontrolled); participants w/ battalions/ships + Dead/Wounded (hover: battle vs attrition split); wargoal lists w/ status (Being pressed / Not pressed / Enforced / Invalid); fronts list (per-front battalion split %, click → front panel: sides, generals, Battles list, advancement bar); "Capitulate" (confirm; blockers verbatim: suzerain still fighting, sovereignty-violation joins, suzerain stakeholder; forced at −100).
Make Peace: wargoal checkboxes both sides ("pressed"); per-country Acceptance Score chips w/ full breakdown (war support, war leader, white peace, achievable-through-capitulation, complete victory, own goals lost); "Set Terms to White Peace"; "Propose Peace Deal" → per-party verdicts; recipient dialog Accept/Reject with N-day timer; result popup (Complete/Limited victory, Mixed Peace, White Peace) with sections Enforced via Capitulation / Enforced in Peace Deal / Unenforced; 1.9+: enforced terms become an Enforced Treaty (non-renegotiable while binding).

## 7. Strategic objectives & AI
Player: per-army Strategic Objective state assignment (formation panel or "Designate Strategic Objectives" map mode); badge "Strategic Objective / [Formation]".
AI-only region stances (None/Conquer/Protect/Colonize) — NOT player-facing toggles.

## 8. If targeting 1.9.x specifically
Use everything except 1.13 items: admiral orders + Convoys instead of Naval Missions/Supply Ships; no flagships/retrofit/piracy; treaty list stops at 1.9.0 set.

---

## SECTION: Lens bar, map modes, state panel, map interaction
# (agent 5 findings — condensed verbatim; [V]=verbatim-verified from wiki excerpts)

## KEY VERSION FACT: 5 lenses at release (Production, Military, Political, Diplomatic, Trade); **4 since 1.9 — Trade lens REMOVED** (1.9.3 tutorial text officially changed "five lenses"→"four"). Manual trade routes replaced by autonomous World Market.

## 1. Lens bar general mechanics
- Bottom-center row of round lens buttons; clicking fans open a sub-option row above [V]
- Sub-button flow: pick tool → cursor becomes target selector → map recolors → click state/country/region to execute. Core interaction pattern.
- Universal eligibility palette on map when tool armed [V]: green=can interact; orange=cannot (already meets condition); blue=in progress; red=ineligible but could qualify; white=ineligible, cannot easily qualify
- Contextual map-mode switching: lenses and info panels auto-switch the map mode; closing reverts [V]
- Hotkeys: bindable (Settings→Controls, default.profile); A/S/D/F/G set comes from a MOD, not vanilla; AotF cites Alt+1..Alt+5

## 2. Production lens (hammer/cog) — "Construct production buildings"
- Category tabs: Agriculture | Resources (extraction) | Industry (+ Infrastructure post-1.9, absorbed from Trade lens)
- Building button → states recolor by eligibility/throughput → click state = queue +1 level; repeat-click queues more
- Hover state: projected budget impact, arable land/resource potential, employment [V]
- "+" expand on building card (also in state panel); "−" downsize with confirmation
- 1.9: Employment bar added to lens list items

## 3. Military lens (sabers) — "Create armies and fleets, designate strategic objectives, plan naval invasions"
- Army tab: formation list; "+" creates Army formation; Activate Conscription Centers button (toggle per state) [V]
- Navy tab: "+" creates Fleet; assign admirals/flotillas
- Post-1.5: all unit hiring/upgrading inside formation panels; barracks/naval bases auto-queued
- Strategic Objective marker tool: click state → generals push toward it [V]
- Orders (Advance/Defend Front; Intercept/Raid Convoys/Escort/Naval Invasion) issued from commander/formation panel, not bare lens buttons
- Naval invasion: Admiral+General same HQ, 43-day joint prep, creates new front
- Map: strategic regions/HQs, fronts as lines with clickable markers badging battalion counts

## 4. Political lens (column/statue) — "Government buildings, decrees, state actions"
- Government buildings sub-tab: picker → click state to queue
- Decrees sub-tab: pick decree → click own state (also via right-click on state) [V]; base 100 Authority (Emergency Relief 50)
- State Actions sub-tab: Incorporate State [V], Change Capital (primary-culture homelands only) [V], Move Market Capital [V]
- NOT lens tools: change laws (Politics panel), bolster/suppress movements (Politics panel)

## 5. Diplomatic lens (handshake) — "Declare interests, establish colonies, conduct diplomacy"
- Regional actions: Declare Interest (influence cost; ~1.9 change: manual button removed, interests grow organically from treaties/troops/regions) | Establish Colony (needs interest + Colonization law; click eligible state)
- Country actions: click country on map → opens diplomatic interaction (same as right-click → quick actions incl. Improve Relations); full action list in country's diplomacy panel
- Map: strategic-region overlay / attitudes+wars+plays

## 6. Trade lens (pre-1.9 only) — REMOVED
- Infrastructure buildings sub-tab (Construction Sectors, Ports, Railways)
- Export route tool: pick good → market map mode → click target market; Import route mirror
- 1.9 replacement: Trade Centers buildings + World Market + treaty-based trade deals via diplomacy

## 7. Map modes (40+ toggleable overlays [V])
- Selector: small globe button right of lens bar, near minimap; modes can be chosen AND LOCKED [V]
- Default: Countries/political, blends to terrain on zoom [V]
- Modes: Countries [V], States, Strategic regions (58 regions, 3–22 states each [V]), Markets [V] (names + goods-flow hover + shipping lanes), Diplomatic [V] (attitudes, wars, plays), Power Blocs (1.7+), GDP global [V], GDP owned [V], GDP/capita, Population [V] (white→green; hover: growth, migration, births, mortality, unemployed, peasants, qualifications), Literacy [V] (red→green), Standard of Living [V], Infamy [V] (white→red), Loyalists [V], Radicals, Culture [V] (most populous + hover per-culture strength), Religion [V], Pollution [V], Devastation, Migration, Unincorporated states, Employment, Military/HQ strength, + one contextual mode per lens interaction

## 8. State panel (left-click a state)
- Header: name, owner flag, incorporation status at a glance
- Overview tab: population (→ filtered pops), Infrastructure used/available (ports+railways), Market Access %, state modifiers/traits, incorporation progress, turmoil/devastation
- Buildings tab [V]: urban/rural/development buildings; per row: levels, employment, production-method dropdowns, expand "+" (hover: projected budget impact), downsize "−", auto-expand toggle, wages/profitability; 1.9: tooltips gained action buttons + State Traits
- Arable land: used/total + supported agriculture types [V]
- Resources: capped extraction potentials; discoverable resources always indicated pre-tech [V]
- Pops tab: type, culture, religion, size, SoL, radicals/loyalists; sortable
- Local goods & prices: local vs market price deltas
- Decree slot: active decree + add/change
- Incorporate button (bureaucracy cost, timer) / colonial growth progress
- Split states: proportional resources, own panel per fragment [V]

## 9. Map interaction extras
- Left-click: state panel; with lens tool armed = execute action
- Right-click: nation → quick diplomatic menu; state → apply decree [V]; cancels armed tool; in lists reveals removal "x" [V]
- Zoom: 2D paper map (table framing) → political → 3D living world terrain [V]
- Hubs (city/port/farm/mine/wood) grow visibly and are clickable → state/building info; ports show ships
- Front lines + clickable front markers; battle icons (swords=land, anchor=naval) → battle panel with progress/casualties
- Orange-yellow border lining = countries at war / opposite sides of a play [V]
- Plays auto-pin to outliner [V]; interest markers on regions
- Minimap bottom-right: click to jump camera; globe selector adjacent

## Version summary
1.0–1.4: 5 lenses, manual interest, barracks via lens. 1.5: formations rework. 1.7: power blocs + map mode. 1.9: 4 lenses, World Market, employment bars, organic interests.

---

## SECTION: Launcher, main menu, game setup, escape menu, settings, events, tooltips, tutorial, criticism digest
# (agent 6 findings — condensed verbatim)

## 0. Paradox Launcher
Resume | Play | Playset selector (mods; drag order) | Game settings (graphics/language, debug-mode checkbox) | DLC tab

## 1. Main menu
Continue (flag of last country) | New Game (→ Objectives picker → nation select) | Load Game | Multiplayer → Host (public/private, name, password, auto-accept hot-join; join by server ID) / Join (server browser) | Options | Credits | Exit. No in-game mod/DLC management.

## 2. Game setup
### Objective picker (DD#52): one optional objective
- Learn the Game (tutorial; USA recommended)
- Economic Dominance (top GDP share; USA, GB, Ottomans, Brazil)
- Hegemon (population share; Prussia, Spain, Japan, Egypt)
- Egalitarian Society (<10% peasants, SoL≥20, literacy≥90%; France, Russia, Qing, Mexico)
- Sandbox (none)
### Nation selection
- World map picker (centralized countries only); country info panel (rank, ruler, government, GDP, pop, military, arable land, literacy, religion, culture, SoL, wars, relations, states)
- Search/country list [unverified], Random country, Observer mode
- Game Rules (presets savable; locked once started), Achievements toggle (Ironman NOT required), Ironman toggle (no country switching/manual saves), Start Game

## 3. Escape menu
Resume | Save Game (disabled Ironman) | Load Game | Settings | Switch Country (removed in Ironman; path to observer) | Open for Multiplayer | Exit to Main Menu | Exit Game.
Message settings NOT here — HUD top-right.

## 4. Settings
- Graphics: display mode, resolution, refresh, vsync; quality preset, shaders, AA, animation, resolution scale; UI scaling
- Audio: master/music/SFX/ambience [unverified verbatim]
- Game: autosave frequency + count, Map Controls → Mouse Pan (edge scrolling toggle), camera/zoom; Accessibility: colorblind modes (Deuteranopia +)
- Controls: fully rebindable hotkeys (1.2 overhaul, DD#74)
- Message Settings (HUD): per-type routing Pop-up/Toast/Feed/suppressed; "Pause and Popup on Events" master toggle (no per-type pause matrix)

## 5. Event pop-ups
Frame+title | animated art (Bink video loops) | flavor text with concept links | 1–4 option buttons (effects listed; hover full tooltip incl. weighted follow-ups; disabled options explain why) | duration modifiers in tooltips | tiers: full pop-up / Toast / Feed per message settings | pause per master toggle | related journal entries/situations pin above outliner

## 6. Tooltip system
- Hover tooltips on nearly everything, full calculation breakdowns
- Nested tooltips: highlighted concepts spawn further tooltips indefinitely
- Middle-click locks a tooltip (move into it, scroll, click links); locked tooltips fragile near neighbors (known complaint)
- Concept links = in-game encyclopedia (Vickypedia)
- 1.2: tooltip positioning fixes

## 7. Tutorial/help
- Tutorial = "Learn the Game" objective; intro popup then reactive journal-driven lessons
- Suggestions system (objective-linked next-action drip)
- Pop-up lessons with UI callouts; concept web doubles as encyclopedia
- Active tutorial/objective entries pin top-right; star unpins

## 8. Criticism digest
PRAISED: nested tooltips as teaching tool; art direction ("Art Deco ledger", animated event art); objectives/tutorial onboarding; post-launch UX patches (1.2 DD#74; 1.6 "UX Update" Pop Census Panel + V2-style Pop Browser = most praised UX addition)
CRITICIZED:
- Information fragmentation — "at no point does the player ever have all the information they need readily at hand"; "a dozen flavors of diplomacy menu"
- Nested tooltips bury crucial data at the bottom of chains; first-hours deluge
- Style over substance (launch trade menu decorative icons vs a plain list — fixed 1.2)
- Notification spam at 1.0 (glowing "!" repeats, toasts covering pinned entries); 1.1 rebalanced Toast/Feed; 1.2 cut volume ~50% (often misattributed to 1.1)
- Late-game micromanagement + construction-queue perf leaking into UI feel; 1.5/1.9 reduced
- Only blunt "Pause and Popup on Events" — no per-message pause matrix
- Launch "can't change settings" read-only-config bug

---
