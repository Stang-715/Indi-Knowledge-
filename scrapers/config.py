"""Ingest configuration. One place for every knob the pipeline turns."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
CACHE = ROOT / "cache"
REGISTRY = DATA / "registry"
HISTORIA = DATA / "historia"

# Be a good citizen. Wikimedia asks for a contactable UA; a generic one gets rate-limited or blocked.
USER_AGENT = "IndiKnowledge-Historia/1.0 (educational game; contact: stang.id108@gmail.com)"

ENDPOINTS = {
    "wikipedia_rest":  "https://en.wikipedia.org/api/rest_v1",
    "wikipedia_api":   "https://en.wikipedia.org/w/api.php",
    "wikidata_api":    "https://www.wikidata.org/w/api.php",
    "wikidata_sparql": "https://query.wikidata.org/sparql",
    "data_gov_in":     "https://api.data.gov.in/resource",
}

# Wikimedia's published courtesy ceiling for unauthenticated clients is ~200 req/s;
# we sit far below it because there is no deadline that justifies hammering a free service.
RATE_LIMIT_RPS = 2.0
TIMEOUT = 30
RETRIES = 4
BACKOFF_BASE = 2.0          # 2s, 4s, 8s, 16s

CACHE_TTL_DAYS = 30
CACHE_ENABLED = True

# Licensing. Anything ingested must carry a license we can actually ship.
LICENSES = {
    "wikipedia": "CC-BY-SA-4.0",
    "wikidata":  "CC0-1.0",
    "data_gov_in": "GODL-India",
    "pib": "GoI-Open",
    "archive_org": "varies-check-item",
}

# Sections of a Wikipedia article worth mining. Everything else is noise for our purposes.
HISTORY_SECTIONS = [
    "History", "Etymology", "Ancient", "Medieval", "Early modern", "Colonial",
    "Colonial era", "British rule", "Modern", "Post-independence", "Independence",
    "Formation", "Economy", "Culture", "Handicrafts", "Art and culture",
    "Governance", "Politics", "Administration",
]

# Confidence floors. Below `MIN_KEEP` we drop the row entirely rather than store noise.
MIN_KEEP = 0.35
FLAG_BELOW = 0.70
