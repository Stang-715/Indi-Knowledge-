"""Polite, cached HTTP. Every network read in this project goes through `fetch`.

Design notes:
  * On-disk cache keyed by URL hash -- a re-run after a crash costs zero requests,
    and the whole pipeline is replayable offline from `cache/`.
  * Retries only on transport errors and 5xx/429. A 404 is an answer, not a failure.
  * A single global rate limiter, because per-call sleeps drift under concurrency.
"""
import hashlib, json, os, threading, time
from pathlib import Path

import requests

from . import config

_lock = threading.Lock()
_last_call = [0.0]


class Blocked(RuntimeError):
    """Egress refused the host. Distinct from a genuine HTTP error so callers can
    tell 'your network policy blocks this' from 'the source is down'."""


def _throttle():
    with _lock:
        gap = 1.0 / config.RATE_LIMIT_RPS
        wait = gap - (time.monotonic() - _last_call[0])
        if wait > 0:
            time.sleep(wait)
        _last_call[0] = time.monotonic()


def _cache_path(url: str, params: dict | None) -> Path:
    key = hashlib.sha256((url + json.dumps(params or {}, sort_keys=True)).encode()).hexdigest()[:24]
    return config.CACHE / key[:2] / f"{key}.json"


def fetch(url: str, params: dict | None = None, *, kind: str = "json", use_cache: bool = True):
    """Return parsed JSON (kind='json') or text (kind='text'). Raises Blocked/RuntimeError."""
    cp = _cache_path(url, params)
    if use_cache and config.CACHE_ENABLED and cp.exists():
        age_days = (time.time() - cp.stat().st_mtime) / 86400
        if age_days < config.CACHE_TTL_DAYS:
            payload = json.loads(cp.read_text())
            return payload["body"] if kind == "text" else payload["body"]

    headers = {"User-Agent": config.USER_AGENT, "Accept-Encoding": "gzip"}
    last = None
    for attempt in range(config.RETRIES):
        _throttle()
        try:
            r = requests.get(url, params=params, headers=headers, timeout=config.TIMEOUT)
        except requests.exceptions.ProxyError as e:
            raise Blocked(
                f"Egress proxy refused {url}. This environment's network policy likely "
                f"does not allow this host. Run the ingest where the host is reachable, "
                f"or pre-populate cache/ from a machine that can reach it."
            ) from e
        except requests.RequestException as e:
            last = e
            time.sleep(config.BACKOFF_BASE ** (attempt + 1))
            continue

        if r.status_code in (429, 500, 502, 503, 504):
            last = RuntimeError(f"HTTP {r.status_code} from {url}")
            # Honour Retry-After when the server bothers to send one.
            delay = float(r.headers.get("Retry-After") or config.BACKOFF_BASE ** (attempt + 1))
            time.sleep(delay)
            continue
        if r.status_code == 403:
            raise Blocked(f"HTTP 403 for {url} -- blocked by policy or by the source.")
        if r.status_code == 404:
            return None
        r.raise_for_status()

        body = r.json() if kind == "json" else r.text
        if config.CACHE_ENABLED:
            cp.parent.mkdir(parents=True, exist_ok=True)
            cp.write_text(json.dumps({"url": url, "params": params, "body": body}))
        return body

    raise RuntimeError(f"Exhausted {config.RETRIES} retries for {url}: {last}")
