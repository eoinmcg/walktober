<script setup lang="ts">
import { useLeafBurst } from '@/composables/useLeafBurst'

const { message } = useLeafBurst()
</script>

<template>
  <Teleport to="body">
    <div class="leaf-overlay" role="status" aria-live="polite">
      <Transition name="leaf-fade" mode="out-in">
        <p v-if="message" :key="message" class="leaf-text">{{ message }}</p>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.leaf-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  /* never blocks clicks underneath */
  z-index: 9999;
  /* above the confetti canvas (default 100) */
}

.leaf-text {
  margin: 0;
  padding: .5rem 1rem;
  background: #fff;
  text-align: center;
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 700;
  color: var(--color-accent);
  box-shadow: 0 2px 12px rgb(255, 255, 255, 0.5);
  border-radius: 3px;
  transform: translateY(var(1px)) rotate(var(-3deg));
}

.leaf-fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.leaf-fade-leave-active {
  transition: opacity 1s ease;
}

.leaf-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.leaf-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {

  .leaf-fade-enter-active,
  .leaf-fade-leave-active {
    transition: none;
  }

  .leaf-fade-enter-from {
    transform: none;
  }
}
</style>
