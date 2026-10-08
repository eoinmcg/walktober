<script setup lang="ts">
import type { CutPoint, CutoutResult } from '~/composables/useSegmenter'

const emit = defineEmits<{ keep: [result: CutoutResult] }>()

const seg = useSegmenter()
const { status, progress, device, error, imageReady, result } = seg

const previewUrl = ref<string | null>(null)
const points = ref<CutPoint[]>([])
const mode = ref<0 | 1>(1) // 1 = include, 0 = exclude

onMounted(seg.init)
onBeforeUnmount(() => previewUrl.value && URL.revokeObjectURL(previewUrl.value))

const canPick = computed(() => status.value === 'ready' || status.value === 'busy')

function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  points.value = []
  seg.setImage(file)
}

function onTap(e: MouseEvent) {
  if (!imageReady.value || status.value === 'busy') return
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  points.value.push({
    x: (e.clientX - r.left) / r.width,
    y: (e.clientY - r.top) / r.height,
    label: mode.value,
  })
  seg.segment(points.value)
}

function undo() {
  points.value.pop()
  if (points.value.length) seg.segment(points.value)
  else seg.clearResult()
}

function startOver() {
  points.value = []
  seg.clearResult()
}
</script>

<template>
  <section class="cutout">
    <p v-if="status === 'loading'" class="note">
      Loading the cutout model… {{ progress }}%
      <span class="dim">(downloads once, then cached)</span>
    </p>
    <p v-else-if="status === 'error'" class="note bad">Couldn't load the model: {{ error }}</p>
    <p v-else class="note">Cutout model ready on {{ device }}</p>

    <label class="pick" :class="{ off: !canPick }">
      Take or choose a photo
      <input type="file" accept="image/*" capture="environment" :disabled="!canPick" @change="onPick" />
    </label>

    <template v-if="previewUrl">
      <p class="note">
        {{ points.length ? 'Tap more spots to refine.' : 'Tap the leaf.' }}
        If part of the background came along, switch to Exclude and tap it.
      </p>

      <div class="modes">
        <button :class="{ on: mode === 1 }" @click="mode = 1">Include</button>
        <button :class="{ on: mode === 0 }" @click="mode = 0">Exclude</button>
        <span class="spacer" />
        <button :disabled="!points.length" @click="undo">Undo</button>
        <button :disabled="!points.length" @click="startOver">Clear</button>
      </div>

      <div class="stage" :class="{ busy: status === 'busy' }" @click="onTap">
        <img :src="previewUrl" alt="Your photo" draggable="false" />
        <span v-for="(p, i) in points" :key="i" class="dot" :class="p.label ? 'in' : 'out'"
          :style="{ left: p.x * 100 + '%', top: p.y * 100 + '%' }" />
        <span v-if="status === 'busy'" class="working">Cutting…</span>
      </div>
    </template>

    <p v-if="error && status !== 'error'" class="note bad">{{ error }}</p>

    <div v-if="result" class="result">
      <div class="board">
        <img :src="result.url" class="sticker" alt="Cutout" />
      </div>
      <div class="meta">
        <span class="swatch" :style="{ background: result.avgColor }" />
        <span>{{ result.avgColor }}</span>
        <span>{{ Math.round(result.areaPct) }}% of the frame</span>
        <span>mask score {{ result.score.toFixed(2) }}</span>
        <span>{{ result.ms }} ms</span>
      </div>
      <div class="actions">
        <button class="primary" @click="emit('keep', result)">Keep this find</button>
        <a :href="result.url" download="cutout.png">Download PNG</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cutout {
  max-width: 560px;
  margin: 0 auto;
  padding: 1rem;
  color: #26302a;
  font-family: system-ui, sans-serif;
}

.note {
  font-size: 0.9rem;
  color: #5b665e;
  margin: 0.5rem 0;
}

.dim {
  opacity: 0.7;
}

.bad {
  color: #a3322b;
}

.pick {
  display: block;
  padding: 0.9rem;
  text-align: center;
  border: 2px dashed #6f8a6a;
  border-radius: 14px;
  cursor: pointer;
  margin: 0.8rem 0;
}

.pick.off {
  opacity: 0.4;
  pointer-events: none;
}

.pick input {
  display: none;
}

.modes {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.6rem;
}

.spacer {
  flex: 1;
}

button {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #b9c4b5;
  background: #fff;
  cursor: pointer;
  font: inherit;
}

button.on {
  background: #26302a;
  color: #fff;
  border-color: #26302a;
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

button:focus-visible,
a:focus-visible {
  outline: 3px solid #7aa874;
  outline-offset: 2px;
}

.stage {
  position: relative;
  display: block;
  line-height: 0;
  border-radius: 10px;
  overflow: hidden;
  cursor: crosshair;
  touch-action: manipulation;
}

.stage img {
  width: 100%;
  height: auto;
  display: block;
  user-select: none;
}

.stage.busy {
  cursor: progress;
}

.dot {
  position: absolute;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.dot.in {
  background: #3f9b52;
}

.dot.out {
  background: #c4412f;
}

.working {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 0.25rem 0.6rem;
  background: rgba(38, 48, 42, 0.85);
  color: #fff;
  border-radius: 999px;
  font-size: 0.8rem;
  line-height: 1.2;
}

.result {
  margin-top: 1.2rem;
}

.board {
  display: grid;
  place-items: center;
  padding: 1.5rem;
  border-radius: 14px;
  background-color: #dfe3d6;
  background-image:
    linear-gradient(45deg, #d1d6c6 25%, transparent 25%, transparent 75%, #d1d6c6 75%),
    linear-gradient(45deg, #d1d6c6 25%, transparent 25%, transparent 75%, #d1d6c6 75%);
  background-size: 24px 24px;
  background-position: 0 0, 12px 12px;
}

/* The die-cut look: a white border traced around the transparent edge, plus a soft lift. */
.sticker {
  max-width: 100%;
  max-height: 300px;
  height: auto;
  filter:
    drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(0 6px 8px rgba(38, 48, 42, 0.3));
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.9rem;
  align-items: center;
  margin-top: 0.7rem;
  font-size: 0.85rem;
  color: #5b665e;
  font-variant-numeric: tabular-nums;
}

.swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.8rem;
}

.actions a {
  color: #3d6a3a;
}

button.primary {
  background: #3d6a3a;
  color: #fff;
  border-color: #3d6a3a;
}
</style>
