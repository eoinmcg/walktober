<script setup lang="ts">
import type { MaskParams } from '~/utils/mask'

const { ready, busy, status, result, run } = useBackgroundRemoval()
const params = ref<MaskParams>({ cutoff: 0.5, soft: 0.3, feather: 0 })
const srcUrl = ref('')

async function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (srcUrl.value) URL.revokeObjectURL(srcUrl.value)
  srcUrl.value = URL.createObjectURL(f)
  await run(f)
}
onBeforeUnmount(() => srcUrl.value && URL.revokeObjectURL(srcUrl.value))
</script>

<template>
  <main>
    <h1>🍃 Leaf cutout</h1>
    <p>{{ status }}</p>
    <input type="file" accept="image/*" :disabled="!ready || busy" @change="onFile" />
    <div class="cols">
      <img v-if="srcUrl" :src="srcUrl" alt="source" v-show="busy" />
      <span v-show="result">
        <ResultCanvas :source="result" :params="params" />
      </span>
    </div>
  </main>
</template>

<style>
body {
  font: 16px system-ui;
}

main {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.cols {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.cols>* {
  flex: 1;
  min-width: 280px;
}

img {
  max-width: 100%;
  /* border: 1px solid #ccc; */
}
</style>
