/**
 * Speech synthesis wrapper.
 *
 * Opt-in only (a11y.voiceOut), because a phone that starts talking without
 * being asked is a hazard in a household where nobody knows what you are
 * reading. Uses the browser's built-in voices — nothing is sent to a server.
 */

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let current: SpeechSynthesisUtterance | null = null

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split('-')[0])) ??
    undefined
  )
}

export function speak(
  text: string,
  lang: string,
  onDone?: () => void,
): void {
  if (!speechAvailable()) {
    onDone?.()
    return
  }
  cancelSpeech()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  const voice = pickVoice(lang)
  if (voice) utterance.voice = voice
  utterance.rate = 0.98
  utterance.pitch = 1.02
  utterance.onend = () => {
    current = null
    onDone?.()
  }
  utterance.onerror = () => {
    current = null
    onDone?.()
  }
  current = utterance
  window.speechSynthesis.speak(utterance)
}

export function cancelSpeech(): void {
  if (!speechAvailable()) return
  window.speechSynthesis.cancel()
  current = null
}

export function isSpeaking(): boolean {
  return current !== null
}
