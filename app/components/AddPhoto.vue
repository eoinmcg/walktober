<script setup lang="ts">
const route = useRoute()

// Hide on /photo (tolerates a trailing slash)
const hidden = computed(() => route.path.replace(/\/$/, '') === '/photo')
</script>

<template>
  <Transition name="pop">
    <div v-if="!hidden" id="take-photo">
      <NuxtLink to="/photo" class="add-photo" aria-label="Add photo">
        <Icon name="fa7-solid:camera" aria-hidden="true" />
        <span class="label">Add photo</span>
      </NuxtLink>
    </div>
  </Transition>
</template>

<style scoped>
#take-photo {
  position: fixed;
  z-index: 50;
  /* keep clear of the iPhone home bar when running as a PWA */
  right: calc(1.25rem + env(safe-area-inset-right, 0px));
  bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
}

/* Mustard "tape" sticker: a different colour from the red delete stickers */
.add-photo {
  --tape: #e8b73a;
  --ink: #2b2a33;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: 3.5rem;
  height: 3.5rem;
  margin: 0;
  padding: 0 1.1rem;
  border: 2px solid #fff;
  border-radius: 999px;
  background: var(--tape);
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  rotate: -6deg;
  box-shadow:
    0 2px 2px rgba(0, 0, 0, 0.25),
    0 10px 18px -4px rgba(0, 0, 0, 0.4);
  transition: rotate 0.25s cubic-bezier(0.3, 1.5, 0.5, 1), scale 0.25s cubic-bezier(0.3, 1.5, 0.5, 1);
}

.add-photo:hover,
.add-photo:focus-visible {
  rotate: 0deg;
  scale: 1.08;
  color: var(--ink);
  background: var(--tape);
}

.add-photo:active {
  scale: 0.96;
}

/* Label: always there for screen readers, visible only on hover-capable screens */
.label {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-width 0.25s ease, opacity 0.2s ease, margin 0.25s ease;
}

@media (hover: hover) {

  .add-photo:hover .label,
  .add-photo:focus-visible .label {
    max-width: 8rem;
    margin-left: 0.5rem;
    opacity: 1;
  }
}

/* Enter / leave when navigating to or from /photo */
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.3, 1.5, 0.5, 1);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

@media (prefers-reduced-motion: reduce) {

  .add-photo,
  .label,
  .pop-enter-active,
  .pop-leave-active {
    transition: none;
  }
}
</style>
