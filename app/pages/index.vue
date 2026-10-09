<script setup lang="ts">
const { status, progress, results, elapsedMs, device, error, init, classify } = useVerifier()
const { getCompletedQuests, removeQuest } = useQuestProgress()
const { toast } = useToast()
const cache = ref([])

const completedQuests = ref(0)
const totalQuests = ref(0)

const deleteItem = (async (id) => {
  if (!confirm('Are you sure?')) {
    return
  }

  const image = images.value.find(image => image.id === id)
  const completedQuests = getCompletedQuests()
  for (let n in completedQuests) {
    let quest = completedQuests[n]
    if (quest && quest.imageId === id) {
      removeQuest(n)
    }
  }

  if (!image) { return }

  await deleteImage(id)
  revokeImageUrl(image.url)

  images.value = images.value.filter(
    image => image.id !== id
  )
  toast('Image removed')
})

const images = ref<
  (ImageRecord & { url: string })[]
>([])

onMounted(async () => {
  // loads (and hence caches) verification models
  init()

  completedQuests.value = getCompletedQuests()
  const data = await $fetch('/data/quests.json')
  totalQuests.value = data.quests.length


  // we should have 5 items in transformers cache
  // these handle the classification
  cache.value = await getTransformersCache()

  const records = await getAllImages()
  await ensurePersistence()

  images.value = records.map(image => ({
    ...image,
    url: createImageUrl(image.blob),
  }))
})

onUnmounted(() => {
  for (const image of images.value) {
    revokeImageUrl(image.url)
  }
})

</script>

<template>
  <main class="container">

    <p v-if="status === 'loading' && cache?.length !== 5" class="note">
      Loading model… {{ progress }}% <span class="hint">(first load downloads weights, then it's cached)</span>
    </p>
    <p v-else-if="status === 'error'" class="note err">Error: {{ error }}</p>
    <p v-else class="note hidden">Model ready <b>{{ device }}</b></p>

    <Scrapbook :items="images" :handleDelete="deleteItem" />

  </main>
</template>

<style scoped>
.note {
  color: #666;
  font-size: 0.9rem;
}

.hint {
  opacity: 0.7;
}

.err {
  color: #b00020;
}

.pick {
  display: block;
  padding: 0.9rem;
  border: 2px dashed #c77b30;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  margin: 1rem 0;
}

.pick.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.pick input {
  display: none;
}

.preview {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.quest {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 0.7rem;
  margin-bottom: 0.7rem;
}

.quest.pass {
  border-color: #3a9d5d;
  background: #f1faf4;
}

.quest header {
  display: flex;
  gap: 0.6rem;
  align-items: baseline;
}

.rarity {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
}

.verdict {
  margin-left: auto;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}

li {
  display: grid;
  grid-template-columns: 9rem 1fr 3.5rem;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
  margin: 0.2rem 0;
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.label.target {
  font-weight: 600;
}

.bar {
  background: #eee;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  background: #c77b30;
}

.val {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.scrapbook .item {
  display: flex;
  position: relative;
  transition: all .2s linear;
}

.scrapbook .item:hover {
  transform: scale(1.1);
}

.scrapbook .item a {
  text-decoration: none;
}

.scrapbook .item button.delete {
  position: absolute;
  top: .5rem;
  right: .5rem;
  background: transparent;
  color: #c20;
  box-shadow: none;
  display: inline-block;
}

.scrapbook .item button.delete:hover {
  position: absolute;
  top: .5rem;
  left: .5rem;
  background: #fff;
  color: #c20;
  box-shadow: var(--shadow-lg);
}

.scrapbook .item img {
  max-width: 200px;
}


.scrapbook .item .label {
  width: auto;
  background: var(--color-dark);
  padding: .5rem 1rem;
  color: #fff;
}
</style>
