/**
 * Pseudo-localisation.
 *
 * The point is not to look like another language — it is to break layouts that
 * only fit because English is unusually short. Accenting every letter proves the
 * string came from the catalogue rather than being hard-coded, and padding to
 * ~140% is roughly the expansion a Devanagari or Malayalam translation brings.
 *
 * Interpolation placeholders are left untouched, because mangling them would
 * hide real bugs behind fake ones.
 */

const MAP: Record<string, string> = {
  a: 'á', b: 'ƀ', c: 'ç', d: 'ð', e: 'é', f: 'ƒ', g: 'ǧ', h: 'ĥ', i: 'í',
  j: 'ĵ', k: 'ķ', l: 'ĺ', m: 'ɱ', n: 'ñ', o: 'ó', p: 'ƥ', q: 'q', r: 'ŕ',
  s: 'ś', t: 'ţ', u: 'ü', v: 'ṽ', w: 'ŵ', x: 'ẋ', y: 'ý', z: 'ż',
  A: 'Á', B: 'Ɓ', C: 'Ç', D: 'Ð', E: 'É', F: 'Ƒ', G: 'Ǧ', H: 'Ĥ', I: 'Í',
  J: 'Ĵ', K: 'Ķ', L: 'Ĺ', M: 'Ṁ', N: 'Ñ', O: 'Ó', P: 'Ƥ', Q: 'Q', R: 'Ŕ',
  S: 'Ś', T: 'Ţ', U: 'Ü', V: 'Ṽ', W: 'Ŵ', X: 'Ẋ', Y: 'Ý', Z: 'Ż',
}

const PAD = 'ẋẏż'

export function pseudo(input: string): string {
  let out = ''
  let i = 0
  while (i < input.length) {
    // Leave {placeholders} alone — corrupting them hides real bugs.
    if (input[i] === '{') {
      const close = input.indexOf('}', i)
      if (close > -1) {
        out += input.slice(i, close + 1)
        i = close + 1
        continue
      }
    }
    out += MAP[input[i]] ?? input[i]
    i += 1
  }
  const extra = Math.max(2, Math.round(out.length * 0.4))
  let tail = ''
  while (tail.length < extra) tail += PAD
  return `[${out}·${tail.slice(0, extra)}]`
}
