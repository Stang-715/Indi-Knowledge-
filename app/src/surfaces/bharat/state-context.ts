import { read, write } from '../../core/storage'

/**
 * Which state the almanac is scoped to.
 *
 * A stated choice, remembered. Not derived from anything about the device, and
 * changeable in one tap — the same rule as every other place in this app that
 * could have been answered with a coordinate.
 */
const KEY = 'bharat-state'

export function currentState(): string {
  return read<string>('prefs', KEY, 'MH')
}

export function setCurrentState(code: string): void {
  write('prefs', KEY, code)
}
