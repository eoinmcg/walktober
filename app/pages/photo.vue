<script setup lang="ts">
import type { MaskParams } from '~/utils/mask'

const { ready, busy, status, result, run } = useBackgroundRemoval()
const params = ref<MaskParams>({ cutoff: 0.5, soft: 0.3, feather: 0 })
const srcUrl = ref('')

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return

  if (srcUrl.value) URL.revokeObjectURL(srcUrl.value)
  srcUrl.value = URL.createObjectURL(f)

  try {
    await run(f)
  } finally {
    // Allows selecting or taking the same image again.
    input.value = ''
  }
}

onBeforeUnmount(() => {
  if (srcUrl.value) URL.revokeObjectURL(srcUrl.value)
})
</script>

<template>
  <main>
    <p v-if="ready">READY</p>
    <p v-else>PREPARING</p>

    <div class="actions">
      <!-- Choose from gallery/files -->
      <label>
        Choose image
        <input type="file" accept="image/*" :disabled="!ready || busy" @change="onFile" />
      </label>

      <!-- Open camera on supported mobile devices -->
      <label>
        Take photo
        <input type="file" accept="image/*" capture="environment" :disabled="!ready || busy" @change="onFile" />
      </label>
    </div>

    <div class="cols">
      <img v-if="srcUrl" :src="srcUrl" alt="Source" v-show="busy" />
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
