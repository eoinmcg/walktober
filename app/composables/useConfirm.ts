const isOpen = ref(false)
const options = ref({ title: '', message: '', confirmText: 'Confirm', cancelText: 'Cancel' })
let resolvePromise: (value: boolean) => void

export const useConfirm = () => {
  const ask = (config: { title: string; message: string; confirmText?: string; cancelText?: string }) => {
    options.value = { ...options.value, ...config }
    isOpen.value = true

    return new Promise<boolean>((res) => { resolvePromise = res })
  }

  const handleAction = (value: boolean) => {
    isOpen.value = false
    resolvePromise(value)
  }

  return {
    isOpen,
    options,
    ask,
    confirm: () => handleAction(true),
    cancel: () => handleAction(false)
  }
}

