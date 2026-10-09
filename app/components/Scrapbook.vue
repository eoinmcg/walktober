<script setup lang="ts">

const props = defineProps({
  items: Array,
  handleDelete: {
    type: Function,
    required: true
  }
})

const triggerDelete = (id) => {
  props.handleDelete(id)
}

</script>

<template>
  <section class="scrapbook">
    <div class="item" v-for="i in items">
      <NuxtLink :to="`/item/${i.id}`">
        <img :src="i.url" />
        <span class="label" v-if="i.label !== ''">{{ i.label }}</span>
        <span class="date">{{ formatDate(i.createdAt) }}</span>
        <button class="delete" @click.stop.prevent="triggerDelete(i.id)">
          <Icon name="fa7-solid:trash-alt" />
        </button>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
/* ---------- The board: a green craft cutting-mat ---------- */
.scrapbook {
  --paper: #fbf9f3;
  --ink: #2b2a33;
  --board: #2f5d55;
  --board-line: rgba(255, 255, 255, 0.07);
  --stamp: #c4351c;

  display: grid;
  grid-template-columns: repeat(auto-fill, 210px);
  justify-content: space-evenly;
  gap: 3.25rem 2.25rem;
  padding: 3rem 2.5rem;
  border-radius: 6px;
  background-color: var(--board);
  background-image:
    linear-gradient(var(--board-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--board-line) 1px, transparent 1px);
  background-size: 28px 28px;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.35);
}

/* ---------- Each item is a taped-down print ---------- */
.scrapbook .item {
  --tilt: -2deg;
  --dy: 0px;
  --tape: rgba(238, 190, 70, 0.78);
  --tape-tilt: -4deg;

  position: relative;
  display: flex;
  transform: translateY(var(--dy)) rotate(var(--tilt));
  transition: transform 0.25s cubic-bezier(0.3, 1.4, 0.5, 1), z-index 0s 0.1s;
}

.scrapbook .item:hover,
.scrapbook .item:focus-within {
  transform: translateY(-8px) rotate(0deg) scale(1.07);
  z-index: 5;
  transition-delay: 0s;
}

/* The paper print itself */
.scrapbook .item a {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0.75rem 0.75rem 0.6rem;
  background: var(--paper);
  color: var(--ink);
  text-decoration: none;
  border-radius: 2px;
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.25),
    0 6px 10px -2px rgba(0, 0, 0, 0.3),
    0 18px 28px -8px rgba(0, 0, 0, 0.35);
}

.scrapbook .item:hover a,
.scrapbook .item:focus-within a {
  box-shadow:
    0 2px 2px rgba(0, 0, 0, 0.25),
    0 14px 20px -4px rgba(0, 0, 0, 0.35),
    0 32px 44px -10px rgba(0, 0, 0, 0.45);
}

/* Washi tape holding it down */
.scrapbook .item a::before {
  content: "";
  position: absolute;
  top: -13px;
  left: 50%;
  width: 92px;
  height: 28px;
  translate: -50% 0;
  rotate: var(--tape-tilt);
  background:
    repeating-linear-gradient(90deg,
      rgba(255, 255, 255, 0.28) 0 6px,
      transparent 6px 12px),
    var(--tape);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  /* torn edges */
  clip-path: polygon(0 0, 4% 12%, 0 25%, 4% 38%, 0 50%, 4% 62%, 0 75%, 4% 88%, 0 100%,
      100% 100%, 96% 88%, 100% 75%, 96% 62%, 100% 50%, 96% 38%, 100% 25%, 96% 12%, 100% 0);
  pointer-events: none;
  z-index: 2;
}

/* ---------- Photo ---------- */
.scrapbook .item img {
  display: block;
  margin: 0 auto;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  object-fit: cover;
  object-position: center;
  background: #ddd;
  /* slightly inset, like a developed print */
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
  filter: saturate(1.05) contrast(1.03);
}

/* ---------- Caption: handwritten label + typewriter date ---------- */
.scrapbook .item .label {
  width: auto;
  margin: 0.7rem 0.15rem 0;
  padding: 0;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 1.55rem;
  font-weight: 600;
  line-height: 1.05;
  text-align: center;
  rotate: -1deg;
}

.scrapbook .item .date {
  align-self: flex-end;
  margin: 0.55rem 0.15rem 0;
  padding: 0.1rem 0.4rem;
  font-family: var(--font-type);
  font-size: 0.72rem;
  color: var(--stamp);
  border: 1.5px solid var(--stamp);
  border-radius: 3px;
  opacity: 0.85;
  rotate: 2deg;
}

/* ---------- Delete: a little sticker, appears on hover ---------- */
.scrapbook .item button.delete {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 3;
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  margin: 0;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--stamp);
  color: #fff;
  font-size: 0.85rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
  opacity: 0;
  scale: 0.6;
  transition: opacity 0.15s, scale 0.2s cubic-bezier(0.3, 1.6, 0.5, 1);
}

.scrapbook .item:hover button.delete,
.scrapbook .item:focus-within button.delete,
.scrapbook .item button.delete:focus-visible {
  opacity: 1;
  scale: 1;
}

.scrapbook .item button.delete:hover {
  background: #fff;
  color: var(--stamp);
  border-color: var(--stamp);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Touch screens have no hover, so keep the sticker visible */
@media (hover: none),
(pointer: coarse) {
  .scrapbook .item button.delete {
    opacity: 1;
    scale: 1;
    width: 2.75rem;
    /* ~44px, the recommended minimum touch target */
    height: 2.75rem;
    top: -14px;
    right: -14px;
    font-size: 1rem;
  }
}

/* ---------- Make it look hand-placed (no two neighbours match) ---------- */
.scrapbook .item:nth-child(6n + 1) {
  --tilt: -2.5deg;
  --dy: 4px;
  --tape: rgba(238, 190, 70, 0.78);
  --tape-tilt: -5deg;
}

.scrapbook .item:nth-child(6n + 2) {
  --tilt: 1.8deg;
  --dy: -6px;
  --tape: rgba(240, 130, 150, 0.75);
  --tape-tilt: 4deg;
}

.scrapbook .item:nth-child(6n + 3) {
  --tilt: -1deg;
  --dy: 8px;
  --tape: rgba(120, 190, 225, 0.75);
  --tape-tilt: -2deg;
}

.scrapbook .item:nth-child(6n + 4) {
  --tilt: 2.6deg;
  --dy: 0px;
  --tape: rgba(160, 205, 130, 0.78);
  --tape-tilt: 6deg;
}

.scrapbook .item:nth-child(6n + 5) {
  --tilt: -1.6deg;
  --dy: -4px;
  --tape: rgba(238, 190, 70, 0.78);
  --tape-tilt: 3deg;
}

.scrapbook .item:nth-child(6n + 6) {
  --tilt: 1.2deg;
  --dy: 6px;
  --tape: rgba(240, 130, 150, 0.75);
  --tape-tilt: -6deg;
}

/* ---------- Small screens & accessibility ---------- */
@media (max-width: 520px) {
  .scrapbook {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2.5rem 1.25rem;
    padding: 2.25rem 1.1rem;
  }

  .scrapbook .item img {
    height: auto;
    aspect-ratio: 1 / 1;
  }

  .scrapbook .item a::before {
    width: 64px;
  }

  .scrapbook .item .label {
    font-size: 1.3rem;
  }
}

@media (prefers-reduced-motion: reduce) {

  .scrapbook .item,
  .scrapbook .item button.delete {
    transition: none;
  }
}
</style>
