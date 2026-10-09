import { ref, onBeforeUnmount } from 'vue'

export type RankedLabel = { label: string; prob: number; isTarget: boolean }
export type QuestResult = {
  id: string
  rarity: string
  prob: number
  pass: boolean
  ranked: RankedLabel[]
}

type Status = 'idle' | 'loading' | 'ready' | 'running' | 'error'

const cacheName = ''

// Helper to check if Transformers IndexedDB has cached files
async function checkModelIsCached(): Promise<boolean> {
  if (!import.meta.client) return false
  try {
    const dbs = await window.indexedDB.databases?.() || []
    const hasDb = dbs.some(db => db.name === 'transformers')
    if (!hasDb) return false

    return new Promise((resolve) => {
      const request = indexedDB.open('transformers')
      request.onsuccess = (event) => {
        const db = event.target as IDBDatabase
        const storeNames = Array.from(db.objectStoreNames)
        if (storeNames.length === 0) {
          db.close()
          return resolve(false)
        }
        const tx = db.transaction(storeNames[0], 'readonly')
        const store = tx.objectStore(storeNames[0])
        const countReq = store.count()
        countReq.onsuccess = () => {
          db.close()
          resolve(countReq.result > 0)
        }
        countReq.onerror = () => {
          db.close()
          resolve(false)
        }
      }
      request.onerror = () => resolve(false)
    })
  } catch {
    return false
  }
}

export function useVerifier() {
  const status = ref<Status>('idle')
  const progress = ref(0)
  const results = ref<QuestResult[]>([])
  const elapsedMs = ref<number | null>(null)
  const device = ref<string>('')
  const error = ref<string | null>(null)
  const isCached = ref<boolean | null>(null) // Tracks cache state

  let worker: Worker | null = null

  async function init() {
    if (worker || !import.meta.client) return

    // 1. Check cache status first so we can adjust UI behavior if needed
    isCached.value = await checkModelIsCached()

    // If it's cached, you can choose to skip the 'loading' visual state entirely 
    // or keep it minimal since loading from IndexedDB is near-instant.
    status.value = 'loading'

    worker = new Worker(new URL('../workers/verifier.worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data
      switch (msg.type) {
        case 'progress':
          // If it's cached, progress might instantly jump to 100%, 
          // avoiding the long flash.
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
    if (!worker || status.value !== 'ready') {
      console.warn('worker not ready. exiting')
      console.log({ file, worker }, status)
      return
    }
    status.value = 'running'
    error.value = null
    worker.postMessage({ type: 'classify', blob: file })
  }

  onBeforeUnmount(() => worker?.terminate())

  return { status, progress, results, elapsedMs, device, error, isCached, init, classify }
}
