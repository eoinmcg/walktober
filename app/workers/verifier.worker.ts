/// <reference lib="webworker" />
import {
  AutoProcessor,
  CLIPVisionModelWithProjection,
  RawImage,
  env,
} from '@huggingface/transformers'

env.allowLocalModels = false

// Verdict rules: tweak these (or make them per-quest) once you have real photos.
const MIN_PROB = 0.5 // target must have at least this probability...
const MIN_MARGIN = 0.2 // ...and beat the runner-up by this much

type Vec = number[]
type LabelVec = { label: string; vec: Vec }
type EmbeddingFile = {
  model: string
  logitScale: number
  negatives: LabelVec[]
  quests: { id: string; rarity: string; target: Vec; confusers: LabelVec[] }[]
}

let data: EmbeddingFile
let processor: any
let model: any

const post = (msg: unknown) => self.postMessage(msg)

const dot = (a: Vec, b: Vec) => a.reduce((s, x, i) => s + x * b[i], 0)

function normalize(v: Vec): Vec {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / n)
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits)
  const exps = logits.map((l) => Math.exp(l - max))
  const sum = exps.reduce((s, x) => s + x, 0)
  return exps.map((x) => x / sum)
}

async function pickDevice(): Promise<'webgpu' | 'wasm'> {
  try {
    const adapter = await (navigator as any).gpu?.requestAdapter()
    if (adapter) return 'webgpu'
  } catch { }
  return 'wasm'
}

async function init() {
  data = await (await fetch('/embeddings/text-embeddings.json')).json()

  // Aggregate per-file download progress into one percentage.
  const files: Record<string, { loaded: number; total: number }> = {}
  const progress_callback = (p: any) => {
    if (p.status !== 'progress') return
    files[p.file] = { loaded: p.loaded, total: p.total }
    const all = Object.values(files)
    const total = all.reduce((s, f) => s + f.total, 0)
    const loaded = all.reduce((s, f) => s + f.loaded, 0)
    post({ type: 'progress', percent: total ? Math.round((loaded / total) * 100) : 0 })
  }

  let device = await pickDevice()

  const load = async (dev: 'webgpu' | 'wasm') => {
    processor = await AutoProcessor.from_pretrained(data.model, { progress_callback })
    model = await CLIPVisionModelWithProjection.from_pretrained(data.model, {
      device: dev,
      dtype: dev === 'webgpu' ? 'fp32' : 'q8',
      progress_callback,
    })
  }

  try {
    await load(device)
  } catch (err) {
    if (device === 'wasm') throw err
    console.warn('WebGPU failed, falling back to WASM:', err)
    device = 'wasm'
    await load(device)
  }

  post({ type: 'ready', device, model: data.model })

}

async function classify(blob: Blob) {
  const t0 = performance.now()

  const image = await RawImage.fromBlob(blob)
  const inputs = await processor(image)
  const { image_embeds } = await model(inputs)
  const photo = normalize(Array.from(image_embeds.data as Float32Array))

  const results = data.quests.map((q) => {
    const labels = [
      { label: q.id, vec: q.target, isTarget: true },
      ...q.confusers.map((c) => ({ ...c, isTarget: false })),
      ...data.negatives.map((c) => ({ ...c, isTarget: false })),
    ]
    const probs = softmax(labels.map((l) => data.logitScale * dot(photo, l.vec)))

    const ranked = labels
      .map((l, i) => ({ label: l.label, prob: probs[i], isTarget: l.isTarget }))
      .sort((a, b) => b.prob - a.prob)

    const targetProb = probs[0]
    const runnerUp = ranked.find((r) => !r.isTarget)!.prob
    const pass = targetProb >= MIN_PROB && targetProb - runnerUp >= MIN_MARGIN

    return { id: q.id, rarity: q.rarity, prob: targetProb, pass, ranked }
  })

  results.sort((a, b) => b.prob - a.prob)
  post({ type: 'result', results, ms: Math.round(performance.now() - t0) })
}

self.onmessage = async (e: MessageEvent) => {
  try {
    if (e.data.type === 'init') await init()
    if (e.data.type === 'classify') await classify(e.data.blob)
  } catch (err: any) {
    post({ type: 'error', message: err?.message ?? String(err) })
  }
}
