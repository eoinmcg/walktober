<script setup lang="ts">
interface Props {
  value?: number | null; // If null or undefined, it goes into indeterminate mode
  max?: number;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  max: 100,
});

const isIndeterminate = computed(() => props.value === null || props.value === undefined);

const progressWidth = computed(() => {
  if (isIndeterminate.value) return '0%';
  const percentage = (props.value! / props.max) * 100;
  return `${Math.min(100, Math.max(0, percentage))}%`;
});
</script>

<template>
  <div class="custom-progress-container" role="progressbar" :aria-valuenow="value ?? undefined" aria-valuemin="0"
    :aria-valuemax="max">
    <div class="custom-progress-fill" :class="{ 'is-indeterminate': isIndeterminate }" :style="{
      width: isIndeterminate ? '30%' : progressWidth,
      backgroundColor: color
    }"></div>
    {{ value }}
  </div>
</template>

<style scoped>
.custom-progress-container {
  width: 100%;
  height: 2rem;
  background: gold;
  border: 2px solid rgba(0, 0, 0, .5);
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  margin: 2rem 0;
}

.custom-progress-fill {
  height: 100%;
  border-radius: 1rem;
  /* Smooth transition for when a value finally arrives */
  transition: width 0.4s ease, background-color 0.3s ease;
}

/* The Indeterminate Animation */
.is-indeterminate {
  position: absolute;
  animation: pico-indeterminate 1.5s infinite linear;
  will-change: left;
}

@keyframes pico-indeterminate {
  0% {
    left: -30%;
    /* Start off-screen */
  }

  100% {
    left: 100%;
    /* Slide all the way past */
  }
}
</style>
