<script setup lang="ts">

const quests = ref([])
const imageUrls = []
const { toast } = useToast()
const ready = ref(false)

const { isQuestCompleted, resetProgress } = useQuestProgress()

const clearQuests = () => {
  if (confirm('Are you sure? This will remove all progress')) {
    resetProgress()
    toast('Progress reset')
    for (const url of imageUrls) {
      URL.revokeObjectURL(url)
    }
    for (const q of quests.value) {
      q.completed = false
    }

  }

}

onMounted(async () => {
  const data = await $fetch('/data/quests.json')
  const records = await getAllImages()
  console.log({ records })

  for (const q of data.quests) {
    const completed = isQuestCompleted(q.id)

    if (completed) {
      completed.completedAt = formatDate(completed.completedAt)
      completed.image = await getImage(completed.imageId)
      console.log(completed.image, q.id, completed)


      const url = createImageUrl(completed.image.blob)
      completed.image.url = url
      imageUrls.push(url)
    }

    q.completed = completed
  }
  quests.value = data.quests
  ready.value = true

})

onUnmounted(() => {
  for (const url of imageUrls) {
    URL.revokeObjectURL(url)
  }

  imageUrls.length = 0
})


const completedCount = computed(() =>
  quests.value.filter(q => q.completed).length
)
</script>

<template>
  <main class="container" v-if="ready">
    <h1>Quests</h1>

    <header class="quests-bar">
      <div class="progress-wrap">
        <p>Completed {{ completedCount }} of {{ quests.length }}</p>
        <progress :value="completedCount" :max="quests.length" />
      </div>
      <button class="outline secondary" @click="clearQuests">Clear quests</button>
    </header>

    <section class="quests">
      <div v-for="q in quests" :key="q.id" class="quest" :class="{ complete: q.completed }" :data-rarity="q.rarity">
        <span class="rarity">{{ q.rarity }}</span>
        <h3 class="title">{{ q.title }}</h3>

        <template v-if="q.completed">
          <img v-if="q.completed.image?.url" :src="q.completed.image.url" :alt="q.title" />
          <span class="stamp">{{ formatDate(q.completed.completedAt) }}</span>
        </template>

        <small class="id">#{{ q.id }}</small>
      </div>
    </section>
  </main>
</template>

<style scoped>
.quests-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.quests-bar .progress-wrap {
  flex: 1;
  max-width: 360px;
}

.quests-bar .progress-wrap p {
  margin: 0 0 0.35rem;
  font-family: var(--font-hand);
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1;
}

.quests-bar progress {
  height: 0.7rem;
  margin: 0;
}

.quests-bar button {
  margin: 0;
  width: auto;
  white-space: nowrap;
}

/* ---------- The board ---------- */
.quests {
  --paper: #fbf9f3;
  --ink: #2b2a33;
  --board: #2f5d55;
  --board-line: rgba(255, 255, 255, 0.07);
  --stamp: #c4351c;
  --rule: #b9d3e6;

  display: grid;
  grid-template-columns: repeat(auto-fill, 230px);
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

/* ---------- Shared card base ---------- */
.quests .quest {
  --tilt: -1.5deg;
  --dy: 0px;
  --tape: rgba(238, 190, 70, 0.78);
  --tape-tilt: -4deg;
  --tag: #7d838c;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;
  padding: 1rem 0.9rem 0.7rem;
  background: var(--paper);
  color: var(--ink);
  border-radius: 2px;
  transform: translateY(var(--dy)) rotate(var(--tilt));
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.25),
    0 6px 10px -2px rgba(0, 0, 0, 0.3),
    0 18px 28px -8px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s cubic-bezier(0.3, 1.4, 0.5, 1);
}

.quests .quest:hover {
  transform: translateY(-6px) rotate(0deg) scale(1.05);
  z-index: 5;
}

.quests .quest .title {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 1.65rem;
  font-weight: 600;
  line-height: 1.05;
  color: var(--ink);
}

/* Rarity: a little tag, coloured by data-rarity */
.quests .quest .rarity {
  align-self: flex-start;
  padding: 0.05rem 0.55rem;
  border-radius: 999px;
  background: var(--tag);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.quests .quest[data-rarity="common"] {
  --tag: #7d838c;
}

.quests .quest[data-rarity="uncommon"] {
  --tag: #3f8f5a;
}

.quests .quest[data-rarity="rare"] {
  --tag: #3a78b8;
}

.quests .quest[data-rarity="epic"] {
  --tag: #8a4fb8;
}

.quests .quest[data-rarity="legendary"] {
  --tag: #c8901a;
}

.quests .quest .id {
  margin-top: auto;
  align-self: flex-end;
  font-family: var(--font-type);
  font-size: 0.68rem;
  color: rgba(43, 42, 51, 0.5);
}

/* ---------- Open quest: ruled index card + pushpin ---------- */
.quests .quest:not(.complete) {
  padding-left: 1.6rem;
  background-color: var(--paper);
  background-image:
    linear-gradient(90deg, transparent 1.15rem, rgba(196, 53, 28, 0.45) 1.15rem 1.2rem, transparent 1.2rem),
    repeating-linear-gradient(transparent 0 1.55rem, var(--rule) 1.55rem 1.6rem);
}

/* pushpin */
.quests .quest:not(.complete)::before {
  content: "";
  position: absolute;
  top: -9px;
  left: 50%;
  width: 18px;
  height: 18px;
  translate: -50% 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ff8a73 0 18%, var(--stamp) 55%, #7d1c0c 100%);
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.4);
}

/* empty photo slot, so open and finished cards are the same height */
.quests .quest:not(.complete)::after {
  content: "photo goes here";
  display: grid;
  place-items: center;
  height: 186px;
  border: 2px dashed rgba(43, 42, 51, 0.28);
  border-radius: 3px;
  color: rgba(43, 42, 51, 0.4);
  font-family: var(--font-hand);
  font-size: 1.3rem;
  order: 2;
}

.quests .quest:not(.complete) .id {
  order: 3;
}

/* ---------- Completed quest: taped photo print ---------- */
.quests .quest.complete {
  padding: 0.75rem 0.75rem 0.6rem;
}

.quests .quest.complete::before {
  content: "";
  position: absolute;
  top: -13px;
  left: 50%;
  width: 92px;
  height: 28px;
  translate: -50% 0;
  rotate: var(--tape-tilt);
  background:
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.28) 0 6px, transparent 6px 12px),
    var(--tape);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  clip-path: polygon(0 0, 4% 12%, 0 25%, 4% 38%, 0 50%, 4% 62%, 0 75%, 4% 88%, 0 100%,
      100% 100%, 96% 88%, 100% 75%, 96% 62%, 100% 50%, 96% 38%, 100% 25%, 96% 12%, 100% 0);
  pointer-events: none;
  z-index: 2;
}

.quests .quest.complete img {
  display: block;
  order: 1;
  width: 100%;
  height: 186px;
  max-width: 100%;
  object-fit: cover;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
  background: #ddd;
}

.quests .quest.complete .title {
  order: 0;
  text-align: center;
}

.quests .quest.complete .rarity {
  align-self: center;
}

.quests .quest.complete .stamp {
  order: 2;
  align-self: flex-end;
  padding: 0.1rem 0.4rem;
  font-family: var(--font-type);
  font-size: 0.72rem;
  color: var(--stamp);
  border: 1.5px solid var(--stamp);
  border-radius: 3px;
  opacity: 0.85;
  rotate: 2deg;
}

.quests .quest.complete .id {
  order: 3;
}

/* ---------- Hand-placed look ---------- */
.quests .quest:nth-child(6n + 1) {
  --tilt: -2.2deg;
  --dy: 4px;
  --tape: rgba(238, 190, 70, 0.78);
  --tape-tilt: -5deg;
}

.quests .quest:nth-child(6n + 2) {
  --tilt: 1.6deg;
  --dy: -6px;
  --tape: rgba(240, 130, 150, 0.75);
  --tape-tilt: 4deg;
}

.quests .quest:nth-child(6n + 3) {
  --tilt: -0.8deg;
  --dy: 8px;
  --tape: rgba(120, 190, 225, 0.75);
  --tape-tilt: -2deg;
}

.quests .quest:nth-child(6n + 4) {
  --tilt: 2.3deg;
  --dy: 0px;
  --tape: rgba(160, 205, 130, 0.78);
  --tape-tilt: 6deg;
}

.quests .quest:nth-child(6n + 5) {
  --tilt: -1.4deg;
  --dy: -4px;
  --tape: rgba(238, 190, 70, 0.78);
  --tape-tilt: 3deg;
}

.quests .quest:nth-child(6n + 6) {
  --tilt: 1deg;
  --dy: 6px;
  --tape: rgba(240, 130, 150, 0.75);
  --tape-tilt: -6deg;
}

/* ---------- Small screens & accessibility ---------- */
@media (max-width: 520px) {
  .quests-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .quests-bar .progress-wrap {
    max-width: none;
  }

  .quests {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
    padding: 2.25rem 1.1rem;
  }

  .quests .quest {
    width: 100%;
    max-width: 320px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .quests .quest {
    transition: none;
  }
}
</style>
