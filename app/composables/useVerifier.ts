export type RankedLabel = { label: string; prob: number; isTarget: boolean }
export type QuestResult = {
  id: string
  rarity: string
  prob: number
  pass: boolean
  ranked: RankedLabel[]
}

type Status = 'idle' | 'loading' | 'ready' | 'running' | 'error'

export function useVerifier() {
  const status = ref<Status>('idle')
  const progress = ref(0)
  const results = ref<QuestResult[]>([])
  const elapsedMs = ref<number | null>(null)
  const device = ref<string>('')
  const error = ref<string | null>(null)

  let worker: Worker | null = null

  function init() {
    if (worker || !import.meta.client) return
    status.value = 'loading'

    worker = new Worker(new URL('../workers/verifier.worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data
      switch (msg.type) {
        case 'progress':
          progress.value = msg.percent
          break
        case 'ready':
          device.value = msg.device
          status.value = 'ready'
          break
        case 'result':
          results.value = msg.results
          elapsedMs.value = msg.ms
          status.value = 'ready'
          break
        case 'error':
          error.value = msg.message
          status.value = 'error'
          break
      }
    }

    worker.postMessage({ type: 'init' })
  }

  function classify(file: Blob) {
    if (!worker || status.value !== 'ready') return
    status.value = 'running'
    error.value = null
    worker.postMessage({ type: 'classify', blob: file })
  }

  onBeforeUnmount(() => worker?.terminate())

  return { status, progress, results, elapsedMs, device, error, init, classify }
}
