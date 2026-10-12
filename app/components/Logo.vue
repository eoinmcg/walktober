<script setup lang="ts">
const props = defineProps({
  color: {
    type: String,
    default: 'currentColor'
  },
  hoverColor: {
    type: String,
    default: ''
  }
})

const isHovered = ref(false)

// Dynamically compute the active color based on hover state
const activeColor = computed(() => {
  return isHovered.value && props.hoverColor ? props.hoverColor : props.color
})
</script>

<template>
  <svg class="logo" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="2.5" />
    <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3" />
    <path d="M32 11 C45 17 49 31 32 44 C15 31 19 17 32 11 Z" fill="currentColor" />
    <path d="M32 44 V25 M32 37 L38 31 M32 31 L26 26" fill="none" stroke="var(--paper)" stroke-width="1.6"
      stroke-linecap="round" />
    <path d="M32 44 V48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    <path d="M19 52 C27 47 37 56 45 50" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"
      stroke-dasharray="0.1 6" />
  </svg>

</template>


<style scoped>
.custom-logo {
  /* Pass the computed Vue prop into a local CSS variable */
  color: v-bind(activeColor);
  transition: color 0.2s ease;
  cursor: pointer;
}
</style>
