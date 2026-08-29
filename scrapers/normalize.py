"""Raw source rows -> Historia events.

This is where the corpus gets its opinions, so every rule is explicit and cheap to
audit. Nothing here reaches the network; run it over `cache/` and you can iterate on
the tagging heuristics as fast as you can edit.
"""
import hashlib, json, re
from datetime import datetime, timezone

from . import config

_ERAS = json.loads((config.REGISTRY / "eras.json").read_text())["eras"]
_TAX = json.loads((config.REGISTRY / "taxonomy.json").read_text())
_ALL_TAGS = {t for group in _TAX["tags"].values() if isinstance(group, list) for t in group}


# ------------------------------------------------------------------ dates

_BCE = re.compile(r"\b(\d{3,4})\s*(?:BCE|BC)\b", re.I)
_CE_YEAR = re.compile(r"\b(1[0-9]{3}|20[0-2][0-9])\b")
_CENTURY = re.compile(r"\b(\d{1,2})(?:st|nd|rd|th)\s+century\s*(BCE|BC|CE|AD)?\b", re.I)
_RANGE = re.compile(r"\b(\d{3,4})\s*[--]\s*(\d{2,4})\b")


def extract_year(text: str) -> tuple[int | None, int | None, str]:
    """-> (year, year_end, precision). Negative years are BCE."""
    m = _BCE.search(text)
    if m:
        y = -int(m.group(1))
        return y, None, "decade"

    m = _CENTURY.search(text)
    if m:
        n = int(m.group(1))
        bce = (m.group(2) or "").upper() in ("BCE", "BC")
        # 5th century CE spans 401-500; midpoint 450. BCE mirrors negative.
        mid = (n - 1) * 100 + 50
        return (-mid if bce else mid), None, "century"

    m = _RANGE.search(text)
    if m:
        start = int(m.group(1))
        raw_end = m.group(2)
        # "1857-58" style: expand the abbreviated end year against the start.
        end = int(raw_end) if len(raw_end) == 4 else int(str(start)[: 4 - len(raw_end)] + raw_end)
        if start <= end <= start + 200:
            return start, end, "exact"

    m = _CE_YEAR.search(text)
    if m:
        return int(m.group(1)), None, "exact"
    return None, None, "era"


def iso_to_year(iso: str | None) -> int | None:
    """Wikidata dates arrive as ISO-ish strings, with a leading '-' for BCE."""
    if not iso:
        return None
    neg = iso.startswith("-")
    m = re.search(r"(\d{4})-\d{2}-\d{2}", iso.lstrip("-"))
    if not m:
        return None
    y = int(m.group(1))
    return -y if neg else y


def era_for(year: int) -> str:
    """The NARROWEST era whose span contains the year.

    Eras deliberately overlap -- Company Raj (1757-1858) sits inside the successor-state
    period (1707-1818) because both are true of Bengal in 1780. Resolving by list order
    would file Plassey under 'successor states'; resolving by narrowest span files it
    under Company Raj, which is what a player scrubbing the timeline expects.
    """
    hits = [e for e in _ERAS if e["start"] <= year <= e["end"]]
    if hits:
        return min(hits, key=lambda e: e["end"] - e["start"])["id"]
    return _ERAS[0]["id"] if year < _ERAS[0]["start"] else _ERAS[-1]["id"]


def era_meta(era_id: str) -> dict:
    return next((e for e in _ERAS if e["id"] == era_id), _ERAS[-1])


# --------------------------------------------------------- category + tags

# Ordered: the first category whose pattern hits wins, so put the specific above the vague.
CATEGORY_RULES = [
    ("war", r"\b(battle|war|siege|invad|invasion|conquer|annex|revolt|rebellion|mutiny|insurgen|militant|campaign against|sacked|defeat|army|troops)\b"),
    ("legislature", r"\b(act\b|act of|bill\b|law\b|legislat|ordinance|treaty|charter|amendment|reorganisation|reorganization|abolish|enacted|passed by|assembly|constitution|settlement of revenue|permanent settlement|ryotwari|zamindari)\b"),
    ("craft", r"\b(handicraft|handloom|weav|textile|silk|muslin|brocade|pottery|terracotta|bronze|brass|metallurg|carv|lacquer|embroider|artisan|craftsmen|guild|GI tag|geographical indication|temple was built|architecture|shipbuild)\b"),
    ("disaster", r"\b(famine|drought|flood|cyclone|earthquake|epidemic|plague|cholera|tsunami|landslide)\b"),
    ("development", r"\b(railway|canal|dam\b|irrigation|port\b|highway|power plant|electrif|hospital|university|school|literacy|industr|factory|refinery|IT park|software|scheme|five-year plan|infrastructure|bridge)\b"),
    ("movement", r"\b(movement|agitation|satyagraha|protest|march\b|strike\b|union\b|reform movement|campaign for|demand for statehood|non-cooperation|quit india)\b"),
    ("culture", r"\b(poet|literature|temple festival|cinema|film|music|dance|saint|bhakti|sufi|language|script|newspaper|renaissance)\b"),
]
_CATEGORY_RULES = [(c, re.compile(p, re.I)) for c, p in CATEGORY_RULES]

TAG_RULES = [
    ("annexation", r"\bannex|ceded to|brought under (?:British|Company)"),
    ("invasion", r"\binvad|invasion|incursion"),
    ("battle", r"\bbattle of|fought at|siege of"),
    ("rebellion", r"\brevolt|rebellion|mutiny|uprising"),
    ("insurgency", r"\binsurgen|militant|armed group|underground outfit"),
    ("partition", r"\bpartition"),
    ("famine", r"\bfamine"),
    ("crop_failure", r"\bcrop fail|harvest fail|blight"),
    ("drought", r"\bdrought"),
    ("flood", r"\bflood"),
    ("cyclone", r"\bcyclone|super cyclone"),
    ("earthquake", r"\bearthquake"),
    ("epidemic", r"\bepidemic|plague|cholera|influenza|pandemic"),
    ("mineral_discovery", r"\b(coal|iron ore|bauxite|mica|manganese)\b.{0,40}\b(discover|deposit|found|reserves)"),
    ("port_established", r"\bport (?:was )?(?:established|opened|built)|harbour (?:was )?(?:built|opened)"),
    ("railway_arrival", r"\brailway|railroad|rail line"),
    ("canal_built", r"\bcanal"),
    ("dam_built", r"\bdam\b|reservoir|barrage"),
    ("land_reform", r"\bland reform|land ceiling|tenancy act|abolition of zamindari|bhoodan"),
    ("revenue_settlement", r"\bpermanent settlement|ryotwari|mahalwari|revenue settlement"),
    ("language_movement", r"\blanguage (?:movement|agitation)|linguistic (?:state|reorganisation)|anti-Hindi"),
    ("capital_designation", r"\bcapital (?:was )?(?:shifted|moved|made|designated)|became the capital"),
    ("dynastic_patronage", r"\bpatron|commissioned by|endowed by|under the patronage"),
    ("electrification", r"\belectrif|power (?:plant|station|grid)"),
    ("policy_liberalisation", r"\bliberalis|liberaliz|economic reforms|opened up to private"),
    ("migration", r"\bmigrat|exodus|displaced persons|refugee"),
    ("displacement", r"\bdisplac|evict|rehabilitat|ousted from land"),
    ("deindustrialisation", r"\bdecline of (?:the )?(?:handloom|weav|craft)|deindustrial|ruined the weavers"),
    ("craft_collapse", r"\b(?:handloom|weav|artisan|craft).{0,40}\b(?:declin|collaps|ruin|vanish)"),
    ("craft_flourish", r"\b(?:handloom|weav|artisan|craft|textile).{0,40}\b(?:flourish|thriv|prosper|renowned|famed)"),
    ("gi_tag_award", r"\bgeographical indication|GI tag"),
    ("literacy_rise", r"\bliteracy (?:rate )?(?:rose|increased|improved|highest)"),
    ("agri_yield_rise", r"\b(?:yield|production|output).{0,30}\b(?:rose|increased|doubled|surged)"),
    ("state_reorganisation", r"\bstates reorganisation|reorganisation act|was carved out|was bifurcated|split from"),
    ("statehood_demand", r"\bdemand for (?:a )?separate state|statehood movement"),
    ("industrial_boom", r"\bindustrial (?:growth|boom|expansion)|industrial belt"),
    ("it_boom", r"\bIT (?:industry|boom|hub|park)|software export|Silicon Valley of India"),
    ("peace_accord", r"\baccord (?:was )?signed|peace agreement|ceasefire"),
    ("temple_construction", r"\btemple (?:was )?(?:built|constructed|commissioned)"),
    ("urbanisation", r"\burbanis|urbaniz|city grew|population of the city"),
    ("cooperative_formation", r"\bcooperative|co-operative society|milk union|Amul"),
    ("irrigation_expansion", r"\birrigat"),
    ("cash_crop_shift", r"\b(?:indigo|opium|jute|cotton|tea|coffee).{0,40}\b(?:cultivat|plantation|forced to grow)"),
]
_TAG_RULES = [(t, re.compile(p, re.I)) for t, p in TAG_RULES]


def classify(text: str) -> str:
    for cat, pat in _CATEGORY_RULES:
        if pat.search(text):
            return cat
    return "highlight"


def infer_tags(text: str) -> list[str]:
    tags = [t for t, pat in _TAG_RULES if pat.search(text)]
    unknown = [t for t in tags if t not in _ALL_TAGS]
    assert not unknown, f"tag rules emit tags absent from taxonomy.json: {unknown}"
    return tags


# ------------------------------------------------------------- confidence

def score(*, precision: str, n_sources: int, source_kinds: set[str],
          n_tags: int, era_id: str, text_len: int) -> float:
    """Deliberately conservative. It is cheaper to flag a true event for review than
    to let a hallucinated one become a quiz answer."""
    s = 0.30
    s += {"exact": 0.30, "decade": 0.18, "quarter_century": 0.12, "century": 0.08, "era": 0.02}.get(precision, 0.0)
    s += min(n_sources, 3) * 0.08
    if "wikidata" in source_kinds:
        s += 0.08                       # structured claims beat prose extraction
    if source_kinds & {"gazetteer", "census", "data_gov_in", "journal", "book"}:
        s += 0.10
    if n_tags:
        s += min(n_tags, 3) * 0.02      # recognisable causal shape => better understood
    if text_len < 80:
        s -= 0.10                       # too terse to verify
    ceiling = era_meta(era_id).get("confidence_ceiling", 1.0)
    return round(max(0.0, min(s, ceiling)), 3)


# ------------------------------------------------------------------ build

def event_id(state_id: str, year: int, category: str, title: str) -> str:
    h = hashlib.sha1(f"{state_id}|{year}|{category}|{title.lower().strip()}".encode()).hexdigest()[:6]
    return f"{state_id}.{year}.{category}.{h}"


def make_event(*, state_id, text, title=None, year=None, year_end=None,
               precision=None, sources, actors=None, places=None):
    if year is None:
        year, year_end, precision = extract_year(text)
    if year is None:
        return None                      # undatable prose is not a timeline event
    precision = precision or "exact"
    era = era_for(year)
    category = classify(text)
    tags = infer_tags(text)
    kinds = {s["kind"] for s in sources}
    conf = score(precision=precision, n_sources=len(sources), source_kinds=kinds,
                 n_tags=len(tags), era_id=era, text_len=len(text))
    if conf < config.MIN_KEEP:
        return None

    title = (title or text)[:140].rstrip()
    flags = []
    if conf < config.FLAG_BELOW:
        flags.append("low_confidence")
    if len(sources) == 1:
        flags.append("single_source")
    if re.search(r"\b(disputed|contested|claimed|alleged|according to some)\b", text, re.I):
        flags.append("contested_history")

    return {
        "id": event_id(state_id, year, category, title),
        "year": year, "year_end": year_end, "year_precision": precision,
        "era": era, "category": category,
        "title": title,
        "summary": text[:900],
        "tags": tags,
        "places": places or [], "actors": actors or [],
        "magnitude": None,
        "causes": [], "effects": [],
        "confidence": conf,
        "review": {
            "status": "flagged" if flags else "auto",
            "flags": flags, "note": "", "reviewer": None,
        },
        "contested": "contested_history" in flags,
        "sim": {"channel": None, "deltas": {}, "scenario": None},
        "sources": sources,
    }


def dedupe(events: list[dict]) -> list[dict]:
    """Deterministic ids make exact dupes free to drop. Near-dupes (same state-year-category,
    heavily overlapping titles) get merged, keeping the higher-confidence row and unioning sources."""
    by_id: dict[str, dict] = {}
    for e in events:
        prev = by_id.get(e["id"])
        if prev is None:
            by_id[e["id"]] = e
            continue
        keep, drop = (e, prev) if e["confidence"] > prev["confidence"] else (prev, e)
        seen = {(s["kind"], s["ref"]) for s in keep["sources"]}
        keep["sources"] += [s for s in drop["sources"] if (s["kind"], s["ref"]) not in seen]
        keep["tags"] = sorted(set(keep["tags"]) | set(drop["tags"]))
        # More corroboration than we scored for => re-score.
        keep["confidence"] = min(1.0, round(keep["confidence"] + 0.05, 3))
        by_id[e["id"]] = keep
    return sorted(by_id.values(), key=lambda x: (x["year"], x["category"]))


def coverage(events: list[dict]) -> dict:
    out: dict[str, dict] = {}
    for e in events:
        c = out.setdefault(e["era"], {"event_count": 0, "_conf": [], "gap_years": []})
        c["event_count"] += 1
        c["_conf"].append(e["confidence"])
    for era_id, c in out.items():
        c["mean_confidence"] = round(sum(c["_conf"]) / len(c["_conf"]), 3)
        del c["_conf"]
        meta = era_meta(era_id)
        if meta["resolution"] == "year":
            have = {e["year"] for e in events if e["era"] == era_id}
            span = range(max(meta["start"], 1900), meta["end"] + 1)
            c["gap_years"] = [y for y in span if y not in have]
    return out


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")
