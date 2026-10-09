<script setup lang="ts">
const { status, progress, results, elapsedMs, device, error, init, classify } = useVerifier()

const previewUrl = ref<string | null>(null)

onMounted(async () => {
  init()
  const images = await getAllImages()
  console.log('eady?', images)
})

function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  classify(file)
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`
</script>

<template>
  <main class="container">

    <p v-if="status === 'loading'" class="note">
      Loading model… {{ progress }}% <span class="hint">(first load downloads weights, then it's cached)</span>
    </p>
    <p v-else-if="status === 'error'" class="note err">Error: {{ error }}</p>
    <p v-else class="note">Model ready on <b>{{ device }}</b></p>

    <label class="pick" :class="{ disabled: status !== 'ready' && status !== 'running' }">
      📷 Take / choose a photo
      <input type="file" accept="image/*" capture="environment" :disabled="status !== 'ready'" @change="onPick" />
    </label>

    <img v-if="previewUrl" :src="previewUrl" class="preview" alt="Your photo" />
    <p v-if="status === 'running'" class="note">Thinking…</p>

    <section v-if="results.length && status !== 'running'">
      <p class="note">Scored {{ results.length }} quests in {{ elapsedMs }} ms</p>

      <article v-for="r in results" :key="r.id" class="quest" :class="{ pass: r.pass }">
        <header>
          <strong>{{ r.id }}</strong>
          <span class="rarity">{{ r.rarity }}</span>
          <span class="verdict">{{ r.pass ? '✅ match' : '❌ no match' }}</span>
        </header>

        <ul>
          <li v-for="l in r.ranked.slice(0, 4)" :key="l.label">
            <span class="label" :class="{ target: l.isTarget }">
              {{ l.isTarget ? '🎯 ' + r.id : l.label.replace('a photo of ', '') }}
            </span>
            <span class="bar"><span :style="{ width: pct(l.prob) }" /></span>
            <span class="val">{{ pct(l.prob) }}</span>
          </li>
        </ul>
      </article>
    </section>
  </main>
</template>

<style scoped>
.note {
  color: #666;
  font-size: 0.9rem;
}

.hint {
  opacity: 0.7;
}

.err {
  color: #b00020;
}

.pick {
  display: block;
  padding: 0.9rem;
  border: 2px dashed #c77b30;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  margin: 1rem 0;
}

.pick.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.pick input {
  display: none;
}

.preview {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.quest {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 0.7rem;
  margin-bottom: 0.7rem;
}

.quest.pass {
  border-color: #3a9d5d;
  background: #f1faf4;
}

.quest header {
  display: flex;
  gap: 0.6rem;
  align-items: baseline;
}

.rarity {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
}

.verdict {
  margin-left: auto;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}

li {
  display: grid;
  grid-template-columns: 9rem 1fr 3.5rem;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
  margin: 0.2rem 0;
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.label.target {
  font-weight: 600;
}

.bar {
  background: #eee;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  background: #c77b30;
}

.val {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
