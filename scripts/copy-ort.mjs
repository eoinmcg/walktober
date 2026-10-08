// Copies the ORT wasm runtime into public/ort so it is served locally (offline-capable)
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const src = 'node_modules/onnxruntime-web/dist'
const dst = 'public/ort'
console.log({ src, dst })
mkdirSync(dst, { recursive: true })
for (const f of ['ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']) {
  console.log({ f })
  cpSync(`${src}/${f}`, `${dst}/${f}`)
}


// transformers.js's own ORT runtime (npm nests it if versions differ from the 1.20.1 you pin)
const nested = resolve('node_modules/@huggingface/transformers/node_modules/onnxruntime-web/dist')
const tfSrc = existsSync(nested) ? nested : ortSrc
mkdirSync(resolve('public/ort-tf'), { recursive: true })
for (const f of readdirSync(tfSrc).filter(f => /\.(asyncify|jsep)\.(mjs|wasm)$/.test(f))) {
  cpSync(`${tfSrc}/${f}`, resolve(`public/ort-tf/${f}`))
}
