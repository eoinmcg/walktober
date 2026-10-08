import type { CutoutSource } from '~/utils/mask'
import type { WorkerIn, WorkerOut } from '~/workers/cutout.worker'

export function useBackgroundRemoval() {
  const base = useRuntimeConfig().app.baseURL
  const ready = ref(false)
  const busy = ref(false)
  const status = ref('Loading model…')
  const result = shallowRef<CutoutSource | null>(null)

  let worker: Worker | null = null
  let nextId = 0
  let latestId = -1

  function post(msg: WorkerIn) { worker?.postMessage(msg) }

  function setResult(next: CutoutSource) {
    result.value?.bitmap.close()   // free the previous bitmaps' memory
    result.value?.mask.close()
    result.value = next
  }

  function onMessage(e: MessageEvent<WorkerOut>) {
    const msg = e.data
    switch (msg.type) {
      case 'ready':
        ready.value = true
        status.value = 'Ready. Pick a leaf image.'
        break
      case 'result':
        if (msg.id !== latestId) { msg.bitmap.close(); msg.mask.close(); return } // stale
        setResult({ bitmap: msg.bitmap, mask: msg.mask })
        busy.value = false
        status.value = 'Done.'
        break
      case 'error':
        if (msg.id === undefined) status.value = `Model load failed: ${msg.message}`
        else if (msg.id === latestId) { busy.value = false; status.value = `Failed: ${msg.message}` }
        break
    }
  }

  function run(file: File) {
    if (!ready.value) return
    busy.value = true
    status.value = 'Processing…'
    latestId = nextId++
    post({ type: 'run', id: latestId, file })
  }

  onMounted(() => {
    // Relative URL so Vite bundles the worker (dev and build)
    worker = new Worker(new URL('../workers/cutout.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = onMessage
    worker.onerror = (e) => { status.value = `Worker error: ${e.message}`; busy.value = false }
    post({ type: 'init', base, origin: location.origin })
  })

  onBeforeUnmount(() => {
    worker?.terminate()
    worker = null
    result.value?.bitmap.close()
    result.value?.mask.close()
  })

  return { ready, busy, status, result, run }
}
