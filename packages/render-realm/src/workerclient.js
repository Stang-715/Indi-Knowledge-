/**
 * Main-thread side of the worldgen worker.
 *
 * Falls back to synchronous generation when workers are unavailable — a
 * file:// page, a locked-down embed, an old browser. The game must run
 * everywhere; the worker is a performance decision, not a dependency.
 */
export class WorldgenClient {
  constructor(url) {
    this.seq = 0;
    this.pending = new Map();
    this.ready = false;
    try {
      this.worker = new Worker(url, { type: 'module' });
      this.worker.onmessage = (e) => {
        const { id, ok, result, error } = e.data;
        const p = this.pending.get(id);
        if (!p) return;
        this.pending.delete(id);
        ok ? p.resolve(result) : p.reject(new Error(error));
      };
      this.worker.onerror = (e) => { this.fail(e.message ?? 'worker error'); };
    } catch {
      this.worker = null;
    }
  }

  get available() { return !!this.worker; }

  fail(msg) {
    for (const p of this.pending.values()) p.reject(new Error(msg));
    this.pending.clear();
    this.worker = null;                       // fall back from here on
  }

  send(kind, payload, transfer = []) {
    if (!this.worker) return Promise.reject(new Error('no worker'));
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ id, kind, payload }, transfer);
    });
  }

  /**
   * Drop any request that is no longer wanted.
   *
   * Panning issues a request per frame and only the last one matters. Without
   * this the worker finishes a queue of stale tiles while the player waits for
   * the one they are looking at.
   */
  abandonAll() {
    for (const p of this.pending.values()) p.reject(new Error('superseded'));
    this.pending.clear();
  }
}
