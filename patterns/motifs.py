"""The motif library: recurring causal shapes in Indian state history.

A motif is an ORDERED sequence of stages. Each stage matches on tags (and optionally
category or state endowment), and must occur within `max_gap` years of the previous
stage. A motif that matches in several states with good confidence is promoted to a
game RULE -- that promotion is the whole point of this module. History is not
decoration here; it is where the simulation's causal model comes from.

Fields per stage:
  any_tags   -- stage matches if the event carries ANY of these tags
  all_tags   -- ...and ALL of these, if given
  category   -- optional category constraint
  max_gap    -- max years since the previous matched stage (first stage ignores it)
  optional   -- stage may be skipped without failing the match
"""

MOTIFS = [
 {
  "id": "port_bloom",
  "label": "Harbour to Workshop",
  "thesis": "A usable harbour pulls in trade, trade capitalises craft, and craft becomes the region's identity long after the trade moves on.",
  "requires_endowment": ["coastal", "port_natural", "island"],
  "stages": [
    {"name": "harbour",  "any_tags": ["port_established", "trade_treaty"]},
    {"name": "exchange", "any_tags": ["revenue_surge", "port_boom", "urbanisation", "trade_treaty"], "max_gap": 120, "optional": True},
    {"name": "craft",    "any_tags": ["craft_flourish", "guild_formation"], "max_gap": 150},
  ],
  "game_rule": "Building a port on a coastal state raises Trade for 3 turns; if Trade stays high for 5 turns, Artisanry gains a permanent +1 craft slot.",
 },
 {
  "id": "extraction_famine",
  "label": "The Revenue Ratchet",
  "thesis": "A revenue demand fixed independently of the harvest converts a bad monsoon into a mass death event. The famine is fiscal, not meteorological.",
  "stages": [
    {"name": "conquest",  "any_tags": ["annexation", "invasion"]},
    {"name": "settlement","any_tags": ["revenue_settlement", "revenue_extraction"], "max_gap": 60},
    {"name": "shock",     "any_tags": ["crop_failure", "drought", "flood"], "max_gap": 120, "optional": True},
    {"name": "famine",    "any_tags": ["famine", "population_loss"], "max_gap": 120},
  ],
  "game_rule": "Setting Revenue to Fixed grants +2 Treasury per turn but removes the harvest-failure buffer. A drought while Fixed triggers Famine: -30% population, -2 Legitimacy, permanent Unrest scar.",
 },
 {
  "id": "craft_kill",
  "label": "The Unmaking of a Craft",
  "thesis": "Craft economies die from demand-side policy — monopsony, tariffs, mechanised imports — far faster than from any loss of skill.",
  "stages": [
    {"name": "control",  "any_tags": ["annexation", "revenue_extraction", "tariff_change", "revenue_settlement"]},
    {"name": "erosion",  "any_tags": ["deindustrialisation", "craft_collapse"], "max_gap": 120},
    {"name": "outflow",  "any_tags": ["migration", "population_loss", "revenue_decline"], "max_gap": 80, "optional": True},
  ],
  "game_rule": "Artisanry decays 4%/turn while a foreign power holds your Trade channel. Below 25% the craft is LOST — it cannot be rebuilt this era, only revived later at triple cost via a GI-tag project.",
 },
 {
  "id": "resource_curse",
  "label": "The Resource Curse",
  "thesis": "Mineral wealth under communally-held land produces extraction, displacement and eventually armed resistance — the insurgency maps onto the ore body.",
  "requires_endowment": ["mineral_coal", "mineral_iron", "mineral_bauxite", "forest", "plateau"],
  "stages": [
    {"name": "discovery",    "any_tags": ["mineral_discovery", "industrial_boom"]},
    {"name": "displacement", "any_tags": ["displacement", "dam_built", "urbanisation"], "max_gap": 80},
    {"name": "grievance",    "any_tags": ["agitation", "rebellion", "statehood_demand"], "max_gap": 100},
    {"name": "entrenchment", "any_tags": ["insurgency", "insurgency_entrenched"], "max_gap": 120, "optional": True},
  ],
  "game_rule": "Every Mine placed on tribal-tenure land adds +3 Treasury and +1 permanent Unrest. Unrest above 7 spawns an insurgency that closes the district to all further building until resolved by Accord or Autonomy — never by force alone.",
 },
 {
  "id": "reform_dividend",
  "label": "The Long Dividend",
  "thesis": "Land reform and schooling pay nothing for a generation, then compound. States that spend early on people outperform states that spend early on plant.",
  "stages": [
    {"name": "seed",     "any_tags": ["literacy_drive", "land_reform"]},
    {"name": "widen",    "any_tags": ["literacy_drive", "land_reform", "public_health_drive", "cooperative_formation"], "max_gap": 160},
    {"name": "dividend", "any_tags": ["literacy_rise", "infant_mortality_fall", "agri_yield_rise", "remittance_inflow"], "max_gap": 120},
  ],
  "game_rule": "Human-capital spend returns nothing for 15 turns, then pays 3x indefinitely. The AI opponents never build it. It is how a resource-poor state wins a long game.",
 },
 {
  "id": "linguistic_statehood",
  "label": "Identity Becomes a Border",
  "thesis": "Where a population's identity -- language, tribe or region -- does not match the administration governing it, mobilisation follows and the map is eventually redrawn to fit. Language is the paradigm case (Tamil Nadu, Gujarat); tribal identity does the same work in Jharkhand.",
  "stages": [
    {"name": "friction",  "any_tags": ["language_movement", "caste_mobilisation"]},
    {"name": "agitation", "any_tags": ["agitation", "statehood_demand"], "max_gap": 60},
    {"name": "redraw",    "any_tags": ["state_reorganisation"], "max_gap": 60},
  ],
  "game_rule": "Governing a population whose language or identity you do not share adds +1 Unrest/turn, compounding. At 10 the territory secedes into a new state — playable by another player in multiplayer.",
 },
 {
  "id": "capital_drain",
  "label": "The Capital Drain",
  "thesis": "Losing capital status costs a city more than the buildings it keeps: investment follows administration, and the decline shows up decades later.",
  "stages": [
    {"name": "shift",      "any_tags": ["capital_designation"]},
    {"name": "divergence", "any_tags": ["regional_imbalance", "revenue_decline", "deindustrialisation"], "max_gap": 90},
  ],
  "game_rule": "Moving your capital gives the new city +40% growth and the old one -20% for 20 turns. Reversing the move does not restore it.",
 },
 {
  "id": "diaspora_engine",
  "label": "The Remittance Engine",
  "thesis": "Educate a population a poor economy cannot employ and it exports labour; the wages come home as consumption and human development without industrialisation.",
  "stages": [
    {"name": "schooling",  "any_tags": ["literacy_drive", "literacy_rise"]},
    {"name": "departure",  "any_tags": ["migration"], "max_gap": 200},
    {"name": "inflow",     "any_tags": ["remittance_inflow"], "max_gap": 60},
  ],
  "game_rule": "High Literacy + low Industry opens the Migration channel: -Labour, +Treasury, +Wellbeing, and a hidden Fragility counter tied to a foreign economy you do not control.",
 },
 {
  "id": "patronage_monument",
  "label": "Loot into Stone",
  "thesis": "Successful conquest is converted into monumental building and endowed craft — the temple is a war memorial with an economy attached.",
  "stages": [
    {"name": "victory",   "any_tags": ["battle", "annexation", "revenue_surge"]},
    {"name": "endowment", "any_tags": ["dynastic_patronage", "temple_construction", "monastic_endowment"], "max_gap": 60},
    {"name": "craft",     "any_tags": ["craft_flourish", "guild_formation"], "max_gap": 100, "optional": True},
  ],
  "game_rule": "Spending war spoils on a Monument converts one-off Treasury into permanent Legitimacy and unlocks that era's craft tree. Hoarding the spoils instead keeps the gold and forfeits the tree.",
 },
 {
  "id": "accord_cycle",
  "label": "Insurgency and Accord",
  "thesis": "Armed movements in India end at negotiated accords, not at military victory — and unimplemented accords restart the cycle.",
  "stages": [
    {"name": "rising", "any_tags": ["rebellion", "insurgency", "insurgency_entrenched"]},
    {"name": "accord", "any_tags": ["peace_accord"], "max_gap": 50},
  ],
  "game_rule": "Insurgency cannot be reduced below 3 by military action. Only Accord clears it — and an Accord whose terms you fail to fund re-ignites at +2 within 10 turns.",
 },
 {
  "id": "irrigation_trap",
  "label": "The Irrigation Trap",
  "thesis": "Subsidised water and guaranteed procurement raise yields spectacularly, then lock the region into the crop that exhausts its water.",
  "requires_endowment": ["river_plain", "monsoon_rain_shadow", "desert", "plateau"],
  "stages": [
    {"name": "works",   "any_tags": ["canal_built", "dam_built", "irrigation_expansion", "electrification"]},
    {"name": "boom",    "any_tags": ["agri_yield_rise", "revenue_surge"], "max_gap": 60},
    {"name": "depletion","any_tags": ["drought", "agri_yield_fall", "crop_failure"], "max_gap": 90},
  ],
  "game_rule": "Irrigation gives +50% yield and sets a hidden Water Table counter draining each turn. At zero, yields fall below the pre-irrigation baseline and the fix costs more than the original works.",
 },
 {
  "id": "partition_shock",
  "label": "The Cut",
  "thesis": "A border drawn through a functioning economy severs producers from markets and people from land; the demographic shock outlives the political one by generations.",
  "stages": [
    {"name": "cut",      "any_tags": ["partition"]},
    {"name": "movement", "any_tags": ["migration", "population_loss"], "max_gap": 20},
    {"name": "remaking", "any_tags": ["urbanisation", "deindustrialisation", "revenue_decline", "agitation"], "max_gap": 60, "optional": True},
  ],
  "game_rule": "Partition is the only irreversible map event. You lose territory, gain refugees (Labour +, Housing -, Unrest +), and every adjacency bonus through the severed border is deleted permanently.",
 },
]
