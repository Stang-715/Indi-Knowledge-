/**
 * Playtest instrumentation (phase 43). Local only — nothing leaves the
 * machine. The tester plays, then exports a JSON blob and pastes it back to
 * us. Every number here exists to answer one question from
 * docs/18-playtest-protocols.md: where did the cadence lose you?
 */
export function makeTelemetry(now = () => performance.now()) {
  const t = {
    startedAt: new Date().toISOString(),
    wallMs: 0,
    eras: {},           // era id -> { ms, decisions, cardsOpened, yearsOpened }
    decisions: 0,
    cardsOpened: 0,
    yearPagesOpened: 0,
    cardsKept: 0,
    threadsOpened: 0,
    lossesNoticed: 0,   // risk panel opened within 20 in-game years of a loss
    lossesTotal: 0,
    pauses: 0,
    slipsShown: 0,
    slipsDismissedUnread: 0,
  };
  let lastTick = now();
  let currentEra = null;
  let lastLossYear = null;

  const bucket = () => {
    if (!currentEra) return null;
    return (t.eras[currentEra] ??=
      { ms: 0, decisions: 0, cardsOpened: 0, yearsOpened: 0 });
  };

  return {
    tick(eraId, playing) {
      const n = now();
      const dt = n - lastTick; lastTick = n;
      if (!playing || dt > 2000) return;      // ignore tab-away gaps
      t.wallMs += dt;
      currentEra = eraId;
      const b = bucket(); if (b) b.ms += dt;
    },
    decision() { t.decisions++; const b = bucket(); if (b) b.decisions++; },
    cardOpened() { t.cardsOpened++; const b = bucket(); if (b) b.cardsOpened++; },
    yearOpened() { t.yearPagesOpened++; const b = bucket(); if (b) b.yearsOpened++; },
    cardKept() { t.cardsKept++; },
    threadOpened() { t.threadsOpened++; },
    paused() { t.pauses++; },
    slipShown() { t.slipsShown++; },
    slipDismissedUnread() { t.slipsDismissedUnread++; },
    loss(year) { t.lossesTotal++; lastLossYear = year; },
    riskPanelOpened(year) {
      if (lastLossYear !== null && year - lastLossYear <= 20) {
        t.lossesNoticed++; lastLossYear = null;
      }
    },
    export() {
      return JSON.stringify({ ...t,
        decisionsPerHour: t.wallMs ? Math.round(t.decisions / (t.wallMs / 3.6e6)) : 0,
      }, null, 1);
    },
  };
}
