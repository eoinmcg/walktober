/**
 * Precompute CLIP text embeddings for every quest.
 *
 * Run:   npx tsx scripts/build-text-embeddings.ts
 * Needs: npm i -D tsx   &&   npm i @huggingface/transformers
 *
 * Input:  data/quests.json
 * Output: public/embeddings/text-embeddings.json
 *
 * At runtime only the *vision* encoder is loaded in the browser; this file
 * supplies the text side, so the text encoder never ships to the phone.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { AutoTokenizer, CLIPTextModelWithProjection } from '@huggingface/transformers'

// MUST match the vision model used at runtime, or the vectors live in
// different spaces and similarities are meaningless.
const MODEL_ID = 'Xenova/clip-vit-base-patch32'
const QUESTS_PATH = 'data/quests.json'
const OUT_PATH = 'public/embeddings/text-embeddings.json'
const PRECISION = 5 // decimals kept per float; keeps the JSON small

type Quest = {
  id: string
  rarity: string
  prompts: string[]
  confusers: string[]
}
type QuestFile = { negatives: string[]; quests: Quest[] }

// ---------- vector helpers ----------

function normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / norm)
}

function mean(vectors: number[][]): number[] {
  const out = new Array(vectors[0].length).fill(0)
  for (const v of vectors) for (let i = 0; i < v.length; i++) out[i] += v[i]
  return out.map((x) => x / vectors.length)
}

const round = (v: number[]) => v.map((x) => Number(x.toFixed(PRECISION)))

// ---------- model ----------

console.log(`Loading ${MODEL_ID} ...`)
const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID)
const model = await CLIPTextModelWithProjection.from_pretrained(MODEL_ID)

/** Embed a batch of strings -> L2-normalized vectors. */
async function embed(texts: string[]): Promise<number[][]> {
  const inputs = tokenizer(texts, { padding: true, truncation: true })
  const { text_embeds } = await model(inputs)
  const [rows, dim] = text_embeds.dims as [number, number]
  const data = text_embeds.data as Float32Array

  const out: number[][] = []
  for (let r = 0; r < rows; r++) {
    out.push(normalize(Array.from(data.slice(r * dim, (r + 1) * dim))))
  }
  return out
}

// ---------- build ----------

const { negatives, quests }: QuestFile = JSON.parse(await readFile(QUESTS_PATH, 'utf8'))

// Deduplicate shared strings (e.g. "a photo of a pebble" appears in many quests)
const allTexts = new Set<string>(negatives)
for (const q of quests) q.confusers.forEach((t) => allTexts.add(t))
const singles = [...allTexts]
const singleVecs = await embed(singles)
const lookup = new Map(singles.map((t, i) => [t, singleVecs[i]]))

const questOut = []
for (const q of quests) {
  // Prompt ensembling: embed each phrasing, average, then re-normalize.
  const promptVecs = await embed(q.prompts)
  const target = normalize(mean(promptVecs))

  questOut.push({
    id: q.id,
    rarity: q.rarity,
    target: round(target),
    confusers: q.confusers.map((label) => ({ label, vec: round(lookup.get(label)!) })),
  })
  console.log(`  ✓ ${q.id} (${q.prompts.length} prompts, ${q.confusers.length} confusers)`)
}

const output = {
  model: MODEL_ID,
  dim: singleVecs[0].length,
  // CLIP's learned temperature; the runtime needs this for softmax.
  // Verify against the model config if you swap checkpoints.
  logitScale: 100,
  negatives: negatives.map((label) => ({ label, vec: round(lookup.get(label)!) })),
  quests: questOut,
}

await mkdir(dirname(OUT_PATH), { recursive: true })
await writeFile(OUT_PATH, JSON.stringify(output))
console.log(`Wrote ${OUT_PATH} (${quests.length} quests, dim ${output.dim})`)
