import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * Minimal typings for the Web Speech API. It is still vendor-prefixed in most
 * browsers and absent from lib.dom, so the surface we actually use is declared
 * here rather than pulling in a dependency for four properties.
 */
interface SpeechResultAlt { transcript: string }
interface SpeechResult { 0: SpeechResultAlt; isFinal: boolean; length: number }
interface SpeechResultList { length: number; [i: number]: SpeechResult }
interface SpeechEvent { resultIndex: number; results: SpeechResultList }
interface SpeechErrorEvent { error: string }

interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechEvent) => void) | null
  onerror: ((e: SpeechErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

type RecognitionCtor = new () => Recognition

function ctor(): RecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function speechInputAvailable(): boolean {
  return ctor() !== null
}

export type MicState = 'idle' | 'listening' | 'denied' | 'unavailable'

/**
 * Voice input for 1.2.
 *
 * Recognition runs in the browser's own engine. Note what this hook does not do:
 * it keeps no recording, writes nothing to storage, and hands the caller a
 * string that vanishes when the turn ends. On most desktop browsers the engine
 * is a cloud service — so the setting that turns this on says so plainly rather
 * than implying the audio never leaves the phone.
 */
export function useSpeechInput(lang: string, onFinal: (text: string) => void) {
  const [state, setState] = useState<MicState>(
    speechInputAvailable() ? 'idle' : 'unavailable',
  )
  const [interim, setInterim] = useState('')
  const recog = useRef<Recognition | null>(null)
  const finalRef = useRef(onFinal)
  finalRef.current = onFinal

  const stop = useCallback(() => {
    recog.current?.stop()
  }, [])

  const start = useCallback(() => {
    const Ctor = ctor()
    if (!Ctor) { setState('unavailable'); return }

    // Never stack sessions — a second start() while listening throws.
    recog.current?.abort()

    const r = new Ctor()
    r.lang = lang
    r.continuous = false
    r.interimResults = true
    r.maxAlternatives = 1

    r.onstart = () => { setState('listening'); setInterim('') }

    r.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const result = e.results[i]
        if (result.isFinal) {
          const text = result[0].transcript.trim()
          if (text) finalRef.current(text)
          live = ''
        } else {
          live += result[0].transcript
        }
      }
      setInterim(live)
    }

    r.onerror = (e) => {
      setState(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied' : 'idle')
      setInterim('')
    }

    r.onend = () => {
      setState((s) => (s === 'denied' ? s : 'idle'))
      setInterim('')
    }

    recog.current = r
    try {
      r.start()
    } catch {
      setState('idle')
    }
  }, [lang])

  // Release the microphone if the surface unmounts mid-listen.
  useEffect(() => () => recog.current?.abort(), [])

  return { state, interim, start, stop }
}
