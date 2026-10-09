<script setup lang="ts">


useHead({
  // Wrapping these in arrow functions ensures they recalculate on language switch
  title: 'Walktober',
  htmlAttrs: {
    "data-theme": "light",
  },
  bodyAttrs: {
    class: "layout-main",
  },
  link: [{
    rel: 'icon',
    type: 'image/svg+xml',
    href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍂</text></svg>'
  }]
})
const { toasts, closeToast } = useToast()

// Confirmation Modal Setup
const dialogRef = ref<HTMLDialogElement | null>(null)
const { isOpen, options, confirm, cancel } = useConfirm()

watch(isOpen, (newValue) => {
  if (newValue) dialogRef.value?.showModal()
  else dialogRef.value?.close()
})


</script>

<template>
  <div class="app-shell">

    <Header />

    <slot />

    <TransitionGroup name="slide" tag="div" class="toast-container">
      <UiToast v-for="toast in toasts" :key="toast.id" :message="toast.message" :type="toast.type"
        :duration="toast.duration" @close="closeToast(toast.id)" />
    </TransitionGroup>

    <LeafBurstOverlay />

    <Teleport to="body">
      <dialog ref="dialogRef" class="confirm-modal">
        <article>
          <span class="cancel" @click="cancel">
            <ClientOnly>
              <Icon name="fa7-solid:close" />
            </ClientOnly>
          </span>
          <header><strong>{{ options.title }}</strong></header>
          <p>{{ options.message }}</p>
          <footer>
            <button class="secondary" @click="cancel">{{ options.cancelText }}</button>
            <button class="confirm" @click="confirm">{{ options.confirmText }}</button>
          </footer>
        </article>
      </dialog>
    </Teleport>

    <AddPhoto />

    <Footer />
  </div>

</template>

<style>
.toast-container {
  top: 5px;
  right: 5px;
  position: fixed;
  z-index: 2000;
}

dialog.confirm-modal {
  border: none;
  background: transparent;
  /* The article provides the background */
  padding: 0;
}

dialog.confirm-modal::backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

/* Ensure Pico CSS styles apply inside the Top Layer */
dialog.confirm-modal article {
  position: relative;
  width: 90vw;
  max-width: 400px;
  margin: 0;
  background: var(--card-background-color, white);
}

dialog.confirm-modal button.confirm {
  background-color: darkred;
  color: #fff;
}

dialog.confirm-modal .cancel {
  position: absolute;
  top: 7px;
  right: 7px;
}

dialog.confirm-modal .cancel:hover {
  cursor: pointer;
  color: darkred;
}


/* Slide animation */
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  /* large enough to fit content */
  opacity: 1;
}
</style>
