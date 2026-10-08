import * as ort from 'onnxruntime-web/wasm'

const SIZE = 320
const MEAN = [0.485, 0.456, 0.406]
const STD = [0.229, 0.224, 0.225]

export type WorkerIn =
  | { type: 'init'; base: string; origin: string }
  | { type: 'run'; id: number; file: File }

export type WorkerOut =
  | { type: 'ready' }
  | { type: 'error'; id?: number; message: string }
  | { type: 'result'; id: number; bitmap: ImageBitmap; mask: ImageBitmap }

let session: ort.InferenceSession | null = null

function send(msg: WorkerOut, transfer: Transferable[] = []) {
  self.postMessage(msg, { transfer })
}

async function init(base: string, origin: string) {
  const ortBase = new URL(`${base}ort/`, origin).href
  const mjsUrl = ortBase + 'ort-wasm-simd-threaded.mjs'

  const res = await fetch(mjsUrl)
  const type = res.headers.get('content-type') ?? ''
  if (!res.ok || !type.includes('javascript')) {
    throw new Error(`${mjsUrl} returned HTTP ${res.status} (${type || 'no content-type'}). Is public/ort populated?`)
  }
  const mjsBlob = URL.createObjectURL(new Blob([await res.text()], { type: 'text/javascript' }))

  ort.env.wasm.wasmPaths = { mjs: mjsBlob, wasm: ortBase + 'ort-wasm-simd-threaded.wasm' }
  ort.env.wasm.numThreads = 1

  session = await ort.InferenceSession.create(`${new URL(base, origin).href}models/u2netp.onnx`, {
    executionProviders: ['wasm'],
  })
}

async function run(id: number, file: File) {
  if (!session) throw new Error('Model not loaded')
  const bitmap = await createImageBitmap(file)
  const { width: W, height: H } = bitmap

  const c = new OffscreenCanvas(SIZE, SIZE).getContext('2d')!
  c.drawImage(bitmap, 0, 0, SIZE, SIZE)
  const px = c.getImageData(0, 0, SIZE, SIZE).data
  let max = 1
  for (let i = 0; i < px.length; i += 4) max = Math.max(max, px[i], px[i + 1], px[i + 2])
  const n = SIZE * SIZE
  const input = new Float32Array(3 * n)
  for (let i = 0; i < n; i++)
    for (let ch = 0; ch < 3; ch++)
      input[ch * n + i] = (px[i * 4 + ch] / max - MEAN[ch]) / STD[ch]

  const out = await session.run({
    [session.inputNames[0]]: new ort.Tensor('float32', input, [1, 3, SIZE, SIZE]),
  })
  const d = out[session.outputNames[0]].data as Float32Array

  let lo = Infinity, hi = -Infinity
  for (const v of d) { if (v < lo) lo = v; if (v > hi) hi = v }
  const small = new OffscreenCanvas(SIZE, SIZE)
  const sctx = small.getContext('2d')!
  const mi = sctx.createImageData(SIZE, SIZE)
  for (let i = 0; i < n; i++) {
    const v = ((d[i] - lo) / (hi - lo || 1)) * 255
    mi.data.set([v, v, v, 255], i * 4)
  }
  sctx.putImageData(mi, 0, 0)
  const big = new OffscreenCanvas(W, H)
  const bctx = big.getContext('2d')!
  bctx.imageSmoothingQuality = 'high'
  bctx.drawImage(small, 0, 0, W, H)
  const mask = big.transferToImageBitmap()

  send({ type: 'result', id, bitmap, mask }, [bitmap, mask]) // transferred, not copied
}

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  const msg = e.data
  try {
    if (msg.type === 'init') {
      await init(msg.base, msg.origin)
      send({ type: 'ready' })
    } else if (msg.type === 'run') {
      await run(msg.id, msg.file)
    }
  } catch (err) {
    send({ type: 'error', id: msg.type === 'run' ? msg.id : undefined, message: String(err) })
  }
}
