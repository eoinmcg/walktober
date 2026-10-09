import { pipeline, env } from '@huggingface/transformers'

let classifier: any = null

export function useLeafPipeline() {
  const base = useRuntimeConfig().app.baseURL

  async function load() {
    if (classifier) return classifier

    env.allowRemoteModels = false          // never touch huggingface.co
    env.allowLocalModels = true            // off by default in browsers
    env.localModelPath = `${base}models/`

    // Absolute URLs
    const ort = new URL(`${base}ort-tf/`, location.origin).href
    env.backends.onnx.wasm.wasmPaths = {
      mjs: `${ort}ort-wasm-simd-threaded.asyncify.mjs`,
      wasm: `${ort}ort-wasm-simd-threaded.asyncify.wasm`,
    }

    // int8 model -> wasm + q8 ; fp32 model -> dtype: 'fp32' (and webgpu is fine)
    classifier = await pipeline('image-classification', 'mobilenet', {
      device: 'wasm',
      dtype: 'q8',
    })
    return classifier
  }

  async function identifyLeaf(img: string | Blob | HTMLCanvasElement) {
    console.log({ img })
    return (await load())(img, { top_k: 3 })
  }

  return { identifyLeaf }
}
