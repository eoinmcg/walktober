<script setup lang="ts">
const { status, progress, init } = useVerifier()
const { burst } = useLeafBurst()

// 1. Check localStorage immediately (synchronous check prevents initial flash)
const hasCachedBefore = import.meta.client ? localStorage.getItem('walktober_models_ready') === 'true' : false

const isLoading = ref(!hasCachedBefore)

useHead({
  title: computed(() => {
    if (isLoading.value && progress.value > 0) {
      return `Loading Walktober... (${progress.value}%)`
    }
    return 'Walktober'
  }),
  meta: [
    { name: 'description', content: 'A small reason to go outside. Photograph what you notice and complete quests.' },
    { name: 'theme-color', content: '#fbf9f3' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }
  ]
})
onMounted(async () => {
  // If we already trust localStorage, we can initialize models lazily/quietly in the background
  if (hasCachedBefore) {
    init()
    return
  }

  // Otherwise, run the normal first-time initialization
  init()

  const cache = await getTransformersCache()

  if (cache?.length === 5 && status.value !== 'loading') {
    isLoading.value = false
    localStorage.setItem('walktober_models_ready', 'true')
    showBurst()
  } else {
    const unwatch = watch(status, (newStatus) => {
      if (newStatus === 'ready') {
        isLoading.value = false
        localStorage.setItem('walktober_models_ready', 'true')
        showBurst()
        unwatch()
      } else if (newStatus === 'error') {
        // Stop loading screen on error so user sees the error state
        isLoading.value = false
        showBurst()
        unwatch()
      }
    })
  }
})

function showBurst() {
  burst()

}
</script>

<template>
  <div>
    <!-- Only show loader if we are not marked as ready in localStorage -->
    <div v-if="isLoading" class="global-loader">
      <img src="/logo.svg" width="64" />
      <div class="note">
        <h2>
          <span class="animate-flicker loading">🍂</span> Just a sec...
        </h2>


        <p>
          Downloading AI models... {{ progress }}%
          <br />
          <span class="hint">(this only happens the first time you use Walktober)</span>
        </p>
      </div>
    </div>

    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style scoped>
.global-loader {
  min-height: 100vh;
  background: #fbf9f3;
  padding: 2rem;
  text-align: center;
  color: darkgreen;
}

.global-loader img {
  opacity: .6;
  /* This filter approximates a dark red tint on a dark gray/black SVG */
  /* filter: invert(15%) sepia(90%) saturate(500%) hue-rotate(330deg) brightness(90%); */
}

/* Force all text elements inside the loader to use darkgreen */
.global-loader p,
.global-loader strong,
.global-loader span {
  color: var(--color-dark);
}


@keyframes flickerAnimation {
  0% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }

  100% {
    opacity: 1;
  }
}


.animate-flicker {
  animation: flickerAnimation 2s infinite;
}
</style>
