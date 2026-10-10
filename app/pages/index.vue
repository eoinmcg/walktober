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

    <p v-if="status === 'loading' && cache?.length !== 5" class="note hidden">
      Loading models... {{ progress }}% <span class="hint">(first load downloads weights, then it's cached)</span>
    </p>
    <p v-else-if="status === 'error'" class="note err">Error: {{ error }}</p>
    <p v-else class="note hidden">Model ready <b>{{ device }}</b></p>


    <span v-if="status === 'loading' && cache?.length !== 5" class="note">
      <p><strong>Just a sec...</strong></p>
      <p>
        Downloading models... {{ progress }}%
        <br />
        <span class="hint">
          (this only happens the first time you use Walktober)
        </span>
      </p>
    </span>

    <span v-else-if="status === 'error'" class="note err">
      <p>
        Error: {{ error }}
      </p>
    </span>

    <span v-else-if="images.length > 0">
      <Scrapbook :items="images" :handleDelete="deleteItem" />
    </span>

    <span v-else-if="images.length === 0" class="note">
      <p>
        Walktober is a small reason to go outside. Photograph what you notice,
        complete quests, and fill your scrapbook with the season. Then put your phone away.
      </p>
      <p>
        Take a pic of something notable on your autumnal ramblings. It is then converted into a sticker and added into
        your scrabook.
      </p>
      <p>
        <NuxtLink to="/photo" type="button">
          Get Started
        </NuxtLink>
      </p>
    </span>

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

.note {
  --paper: #fbf9f3;
  font-size: 120%;
  background: var(--paper);

}
</style>
