"""Source adapters. Each returns RAW dicts; normalisation happens in normalize.py.

Keeping extraction and interpretation apart matters here: when a source changes its
HTML or a SPARQL shape, only this file moves, and the tagging/era logic that the
game depends on stays put.
"""
import re
from typing import Iterable

from . import config
from .http import fetch


# ---------------------------------------------------------------- Wikidata

def resolve_qid(wikipedia_title: str) -> str | None:
    """Wikipedia title -> Wikidata QID. We never hardcode QIDs; a guessed identifier
    silently poisons every downstream query."""
    body = fetch(config.ENDPOINTS["wikidata_api"], {
        "action": "wbgetentities", "sites": "enwiki",
        "titles": wikipedia_title, "props": "info", "format": "json",
    })
    if not body:
        return None
    for qid, ent in (body.get("entities") or {}).items():
        if not qid.startswith("-"):
            return qid
    return None


# P17=country, P131=located in admin entity, P585=point in time, P580/P582=start/end,
# P31=instance of. We pull anything datable that sits inside the state.
SPARQL_EVENTS = """
SELECT ?item ?itemLabel ?date ?start ?end ?typeLabel ?placeLabel WHERE {
  ?item (wdt:P131*) wd:%(qid)s .
  OPTIONAL { ?item wdt:P585 ?date. }
  OPTIONAL { ?item wdt:P580 ?start. }
  OPTIONAL { ?item wdt:P582 ?end. }
  OPTIONAL { ?item wdt:P31  ?type. }
  OPTIONAL { ?item wdt:P276 ?place. }
  FILTER (BOUND(?date) || BOUND(?start))
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT %(limit)d
"""

SPARQL_BATTLES = """
SELECT ?item ?itemLabel ?date ?start ?end ?placeLabel WHERE {
  ?item wdt:P31/wdt:P279* wd:Q178561 .          # instance of / subclass of: battle
  ?item wdt:P276 ?place .
  ?place (wdt:P131*) wd:%(qid)s .
  OPTIONAL { ?item wdt:P585 ?date. }
  OPTIONAL { ?item wdt:P580 ?start. }
  OPTIONAL { ?item wdt:P582 ?end. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT %(limit)d
"""


def sparql(query: str, qid: str, limit: int = 400) -> list[dict]:
    body = fetch(config.ENDPOINTS["wikidata_sparql"],
                 {"query": query % {"qid": qid, "limit": limit}, "format": "json"})
    if not body:
        return []
    out = []
    for row in body.get("results", {}).get("bindings", []):
        out.append({k: v.get("value") for k, v in row.items()})
    return out


# ---------------------------------------------------------------- Wikipedia

def article_sections(title: str) -> list[dict]:
    """Fetch an article's section tree, then the wikitext of the history-bearing ones."""
    idx = fetch(config.ENDPOINTS["wikipedia_api"], {
        "action": "parse", "page": title, "prop": "sections", "format": "json",
    })
    if not idx:
        return []
    wanted = []
    for s in idx.get("parse", {}).get("sections", []):
        line = re.sub(r"<[^>]+>", "", s.get("line", "")).strip()
        if any(line.lower().startswith(h.lower()) for h in config.HISTORY_SECTIONS):
            wanted.append((s["index"], line))

    out = []
    for index, line in wanted:
        body = fetch(config.ENDPOINTS["wikipedia_api"], {
            "action": "parse", "page": title, "section": index,
            "prop": "wikitext", "format": "json",
        })
        if not body:
            continue
        text = body.get("parse", {}).get("wikitext", {}).get("*", "")
        out.append({"section": line, "wikitext": text})
    return out


def summary(title: str) -> dict | None:
    return fetch(f"{config.ENDPOINTS['wikipedia_rest']}/page/summary/{title}")


# ------------------------------------------------------- wikitext -> sentences

_CLEAN = [
    (re.compile(r"<ref[^>]*>.*?</ref>", re.S), " "),
    (re.compile(r"<ref[^>]*/>"), " "),
    (re.compile(r"\{\{[^{}]*\}\}"), " "),          # templates (run twice for nesting)
    (re.compile(r"\[\[(?:[^\]|]*\|)?([^\]|]*)\]\]"), r"\1"),
    (re.compile(r"'{2,}"), ""),
    (re.compile(r"<[^>]+>"), " "),
    (re.compile(r"\s+"), " "),
]


def clean_wikitext(t: str) -> str:
    for _ in range(2):
        for pat, rep in _CLEAN:
            t = pat.sub(rep, t)
    return t.strip()


_SENT = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])")


def sentences(text: str) -> Iterable[str]:
    for s in _SENT.split(text):
        s = s.strip()
        if 40 <= len(s) <= 600:
            yield s
