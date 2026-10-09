<script setup lang="ts">

const { status, progress, results, elapsedMs, device, error, init, classify } = useVerifier()
const { isQuestCompleted, completeQuest } = useQuestProgress()
const { toast } = useToast()
const { burst } = useLeafBurst()


const route = useRoute()
const ID = route.params.id as string
const ACTION = route.query?.action as string

const label = ref('')

const item = ref()
const processedResults = ref(false)
const shouldLabel = ref(ACTION === 'label')
const quests = ref([])
const labelInput = ref()

onMounted(async () => {
  await init()
  item.value = await getImage(ID)
  label.value = item.value.label
  if (!item.value) { }
  item.value.url = createImageUrl(item.value.blob)
  const data = await $fetch('/data/quests.json')
  quests.value = data.value
  await nextTick()
  try {
    labelInput.value?.focus()
  } catch {
  }


})

onUnmounted(() => {
  revokeImageUrl(item.value.url)
})

watch(status, async (newStatus) => {
  if (newStatus === 'ready' && !processedResults.value) {
    classify(item.value.blob)
    processedResults.value = true
  }
})


const firstResult = computed(() =>
  results.value.find(item => item.pass === true)
)

watch(firstResult, async (newResults) => {
  let prob = Math.floor(newResults.prob * 100)
  const completed = isQuestCompleted(newResults.id)
  // if (prob > 50 && !completed) {
  if (prob > 50) {
    completeQuest(newResults.id, ID)
    burst({ message: 'Quest Complete', duration: 3 })
  }
})

async function updateLabel() {

  await updateImage(ID, { label: label.value })
  item.value.label = label.value
  shouldLabel.value = false

  toast(`Renamed ${label.value}`);
  console.log('UPDATE LABEL', label.value)
}

const percentage = (n: number) => `${(n * 100).toFixed(1)}%`

</script>

<template>
  <main class="container">

    <div v-if="status === 'loading'" class="note hidden">
      Loading model… {{ progress }}% <span class="hint">(first load downloads weights, then it's cached)</span>
    </div>

    <p v-else-if="status === 'error'" class="note err">Error: {{ error }}</p>
    <p v-else class="note hidden">Model ready on <b>{{ device }} [{{ status }}]</b></p>

    <span v-if="item">
      <span v-if="!item.label || shouldLabel">
        <form @submit.prevent="updateLabel">
          <fieldset role="group">
            <input type="text" v-model="label" ref="labelInput" placeholder="Enter a label for this image" required />
            <input type="submit" value="Save" />
          </fieldset>
        </form>
      </span>
      <span v-else>
        <h1>{{ item.label }}
          <small @click="shouldLabel = true">[rename]</small>
        </h1>
      </span>
      <img :src="item.url" />
    </span>

    <section v-if="results.length">
      <p class="note">Scored {{ results.length }} quests in {{ elapsedMs }} ms
        {{ status }}
      </p>

      <article v-if="firstResult" class="quest" :class="{ pass: firstResult.pass }">
        <header>
          <strong>{{ firstResult.id }} </strong>
          <span class="rarity">{{ firstResult.rarity }} </span>
          <span class="verdict">{{ firstResult.pass ? '✅ match' : '❌ no match' }} </span>
        </header>

        <ul>
          <li v-for="l in firstResult.ranked.slice(0, 1)" :key="l.label">
            <span class="val">{{ Math.floor(l.prob * 100) }}%</span>
          </li>
        </ul>
      </article>
      <article v-else>
        No match
      </article>
    </section>

  </main>
</template>

<style scoped>
h1 small {
  display: block;
  font-weight: normal;
  font-size: 40%;
}

h1 small:hover {
  cursor: pointer;
}
</style>
