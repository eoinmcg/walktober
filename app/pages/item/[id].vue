<script setup lang="ts">
const route = useRoute()
const ID = route.params.id as string
const item = ref()

onMounted(async () => {
  item.value = await getImage(ID)
  item.value.url = createImageUrl(item.value.blob)
})


onUnmounted(() => {
  revokeImageUrl(item.value.url)
})

</script>

<template>
  <main class="container">
    <span v-if="item">
      <h1>OK??</h1>
      <img :src="item.url" />
      <date>{{ item.createdAt }}</date>
    </span>

  </main>
</template>
