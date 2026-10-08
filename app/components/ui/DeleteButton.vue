<script setup lang="ts">
const emit = defineEmits(['click'])
</script>

<template>
  <button class="delete" @click="emit('click')">
    <Icon name="fa7-solid:trash-alt" />
    <span class="label">Delete</span>
  </button>
</template>

<style>
button.delete {
  background: rgba(255, 255, 255, 0.05);
  color: #666;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-right: 1rem;
  width: 2rem;
  height: 2rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

button.delete:hover {
  transform: translateY(0);
  color: #fff;
}

button.delete span.label {
  display: none;
}
</style>
