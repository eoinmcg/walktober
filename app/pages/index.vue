<script setup lang="ts">
const { status, progress, results, elapsedMs, device, error, init, classify } = useVerifier()
const { toast } = useToast()

const deleteItem = (async (id) => {
  if (!confirm('Are you sure?')) {
    return
  }

  const image = images.value.find(image => image.id === id)

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

    <p>Quests: </p>

    <p v-if="status === 'loading'" class="note">
      Loading model… {{ progress }}% <span class="hint">(first load downloads weights, then it's cached)</span>
    </p>
    <p v-else-if="status === 'error'" class="note err">Error: {{ error }}</p>
    <p v-else class="note">Model ready on <b>{{ device }}</b></p>


    <NuxtLink type="button" to="/photo">
      Add photo
    </NuxtLink>

    <section class="scrapbook">
      <div class="card item" v-for="i in images">
        <NuxtLink :to="`/item/${i.id}`">
          <img :src="i.url" />
          <span class="date">{{ formatDate(i.createdAt) }}</span>
          <button class="delete" @click.stop.prevent="deleteItem(i.id)">Delete</button>
          View
        </NuxtLink>
      </div>
    </section>

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

.scrapbook .card {
  display: grid;
  position: relative;
}


.scrapbook .card button.delete {
  position: absolute;
  top: .5rem;
  right: .5rem;
}

.scrapbook .item img {
  max-width: 200px;
}
</style>
