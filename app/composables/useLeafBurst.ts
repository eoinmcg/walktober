import confetti from 'canvas-confetti'
import type { Options, Shape } from 'canvas-confetti'

export type LeafBurstOptions = Options & {
  message?: string
  /** Seconds the message stays fully visible before it starts fading */
  duration?: number
  /** Emojis to use as particles. Defaults to autumn leaves. */
  emojis?: string[]
}

const SCALAR = 3
const DEFAULT_EMOJIS = ['🍂', '🍁', '🍃']

// One cached shape per emoji, built lazily (so nothing runs during SSR)
const shapeCache = new Map<string, Shape>()

function getShapes(emojis: string[]): Shape[] {
  return emojis.map(text => {
    let shape = shapeCache.get(text)
    if (!shape) {
      shape = confetti.shapeFromText({ text, scalar: SCALAR })
      shapeCache.set(text, shape)
    }
    return shape
  })
}

const message = ref<string | null>(null)
let hideTimer: ReturnType<typeof setTimeout> | undefined

function showMessage(text: string, seconds: number) {
  clearTimeout(hideTimer)
  message.value = text
  hideTimer = setTimeout(() => (message.value = null), seconds * 1000)
}

export function useLeafBurst(defaults: LeafBurstOptions = {}) {
  function burst(overrides: LeafBurstOptions = {}) {
    const {
      message: text,
      duration = 2.5,
      emojis,
      ...confettiOptions
    } = { ...defaults, ...overrides }

    confetti({
      particleCount: 80,
      origin: { x: 0.5, y: 0.9 },
      angle: 90,
      spread: 100,
      startVelocity: 35,
      gravity: 0.4,
      decay: 0.92,
      drift: 0.5,
      ticks: 400,
      disableForReducedMotion: true,
      ...confettiOptions,
      scalar: SCALAR,
      shapes: getShapes(emojis?.length ? emojis : DEFAULT_EMOJIS),
    })

    if (text) showMessage(text, duration)
  }

  return { burst, message: readonly(message) }
}
