<script setup lang="ts">
</script>

<template>

  <NuxtLayout>
    <NuxtPage :page-key="route => route.fullPath" />
  </NuxtLayout>
</template>

<style>
body {

  background: url('forest-sky.avif');
  background-size: cover;
}

main {
  margin: 2rem auto;
  width: 600px;
  background: rgba(255, 255, 255, .5);
  padding: .5rem 1rem;
}
</style>
