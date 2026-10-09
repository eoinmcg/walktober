<script setup lang="ts">


const cache = ref()

onMounted(async () => {

  cache.value = await getTransformersCache()
  console.log({ cache })

})

</script>

<template>
  <main class="container">
    <h1>Diagnostics</h1>
    <div class="card" v-if="cache">
      <h3>Cache <small>{{ cache.length }}</small></h3>
      <ul>
        <li v-for="item in cache">{{ item }}</li>
      </ul>
    </div>
  </main>
</template>
