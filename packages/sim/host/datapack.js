/**
 * Datapack loading. This is the ONE place the sim touches the filesystem, and it
 * happens before the simulation starts — `run()` itself takes data as arguments
 * and reads nothing (docs/10-buildplan.md Part A.4).
 */
import { readFileSync } from 'node:fs';

export function loadDatapack(root) {
  const read = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
  return {
    timeline: read('data/timeline/timeline.json'),
    works:    read('data/corpus/works.json'),
    polities: read('data/polities/polities.json'),
    people:   read('data/people/people.json'),
  };
}
