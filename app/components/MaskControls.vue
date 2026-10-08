<script setup lang="ts">
import type { MaskParams } from '~/utils/mask'
const params = defineModel<MaskParams>({ required: true })
const sliders = [
  { key: 'cutoff', label: 'Cutoff', min: 0.05, max: 0.95, step: 0.01 },
  { key: 'soft', label: 'Softness', min: 0.02, max: 1, step: 0.01 },
  { key: 'feather', label: 'Feather (px)', min: 0, max: 10, step: 0.5 },
] as const
</script>

<template>
  <fieldset>
    <legend>Mask tuning</legend>
    <label v-for="s in sliders" :key="s.key" class="row">
      <span>{{ s.label }}</span>
      <input v-model.number="params[s.key]" type="range" :min="s.min" :max="s.max" :step="s.step" />
      <output>{{ params[s.key] }}</output>
    </label>
  </fieldset>
</template>

<style scoped>
.row { display: flex; gap: .75rem; align-items: center; }
.row span { width: 7rem; }
</style>
