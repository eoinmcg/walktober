<script setup lang="ts">
import type { MaskParams } from '~/utils/mask'

const { ready, busy, status, result, run } = useBackgroundRemoval()
const params = ref<MaskParams>({ cutoff: 0.5, soft: 0.3, feather: 0 })
const srcUrl = ref('')
const fileInput = ref()

function initUpload() {
  fileInput.value.click()

}

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

onMounted(async () => {
  await nextTick()
  if (navigator.userActivation && !navigator.userActivation.isActive) return
  try {
    fileInput.value?.click()
  } catch {
    /* blocked: the user taps the button instead */
  }
})


onBeforeUnmount(() => {
  if (srcUrl.value) URL.revokeObjectURL(srcUrl.value)
})

</script>

<template>
  <main class="container">
    <div class="actions" v-if="!busy && !result">
      <button class="take-photo" @click="initUpload">
        <Icon name="fa7-solid:camera" aria-hidden="true" />
        Add photo
      </button>
      <input type="file" class="hidden" ref="fileInput" accept="image/*" :disabled="busy || !ready" @change="onFile" />
    </div>


    <div class="cols">
      <div class="preview">
        <img v-if="srcUrl" :src="srcUrl" alt="Source" />
        <Transition name="fade">
          <div v-show="busy" class="busy" role="status">
            <span aria-busy="true">Cutting out...</span>
          </div>
        </Transition>
      </div>
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

.preview {
  position: relative;
  display: inline-block;
  /* wrapper hugs the image size */
}

.preview img {
  display: block;
  max-width: 100%;
}

.busy {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  /* horizontal center */
  align-items: flex-start;
  /* stick to the top */
  padding-top: 1.25rem;
  background: rgba(20, 30, 28, 0.65);
  backdrop-filter: blur(3px);
  color: #fff;
  font-family: var(--font-hand);
  font-size: 1.6rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}



.actions {
  display: grid;
  place-items: center;
  min-height: 16rem;
  margin-block: 1rem;
  padding: 2rem;
  border: 2px dashed color-mix(in srgb, var(--pico-color, #333) 35%, transparent);
  border-radius: 4px;
}

.take-photo {
  --tape: #e8b73a;
  --ink: #2b2a33;

  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  width: auto;
  margin: 0;
  padding: 0.9rem 2rem;
  border: 2px solid #fff;
  border-radius: 999px;
  background: var(--tape);
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 2rem;
  font-weight: 600;
  line-height: 1;
  rotate: -3deg;
  box-shadow:
    0 2px 2px rgba(0, 0, 0, 0.25),
    0 12px 22px -6px rgba(0, 0, 0, 0.4);
  transition: rotate 0.25s cubic-bezier(0.3, 1.5, 0.5, 1), scale 0.25s cubic-bezier(0.3, 1.5, 0.5, 1);
}

.take-photo:hover,
.take-photo:focus-visible {
  background: var(--tape);
  color: var(--ink);
  rotate: 0deg;
  scale: 1.06;
}

.take-photo:active {
  scale: 0.97;
}

@media (prefers-reduced-motion: reduce) {
  .take-photo {
    transition: none;
  }
}
</style>
