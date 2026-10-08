<script setup lang="ts">
const props = defineProps<{
  message: string | null
  duration?: number
  type?: 'success' | 'error' | 'info'
}>()

const emit = defineEmits<{
  close: []
}>()

watch(
  () => props.message,
  (newMessage) => {
    if (newMessage) {
      setTimeout(() => {
        emit('close')
      }, props.duration || 3000)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="message" :class="['toast', type]" @click="emit('close')">
    <span class="exit">
      <span class="exit" @click="emit('close')">
        <Icon name="fa7-solid:close" />
      </span>
    </span>
    <Icon class="toast-icon" name="fa7-solid:circle-info" v-if="type === 'info'" />
    <Icon class="toast-icon" name="fa7-solid:check-circle" v-if="type === 'success'" />
    <Icon class="toast-icon" name="fa7-solid:xmark-circle" v-if="type === 'error'" />
    {{ message }}
  </div>
</template>

<style scoped>
.toast {
  position: relative;
  color: black;
  padding: 12px 24px 12px 32px;
  border: 2px solid rgba(0, 0, 0, 0.5);
  /* border-left: 7px solid rgba(0, 0, 0, 0.5); */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-sm);
  margin: 5px 0;
  pointer-events: auto;
  transition: all .3s ease-in;
  font-size: 90%;
}

.toast.fade-out {
  opacity: 0;
  transform: scale(.2);
}

.toast .exit {
  position: absolute;
  top: 1px;
  right: 1px;
  opacity: .7;
  font-size: 80%;
}

.toast .exit:hover {
  cursor: pointer;
  opacity: 1;
}

.toast-icon {
  position: absolute;
  top: 30%;
  left: 2px;
  font-size: 120%;
  opacity: .3;
}

.toast.success {
  background: lightblue;
  color: darkblue;
  border-color: darkblue;
}

.toast.info {
  background: white;
  border-color: #333;
}

.toast.error {
  color: darkred;
  background: pink;
  border-color: darkred;
}

.toast.error .toast-icon {
  opacity: 1;
}
</style>
