interface ToastInstance {
  id: number
  message: string
  duration?: number
  type?: 'success' | 'error' | 'info'
}

const toasts = ref<ToastInstance[]>([])
let toastIdCounter = 0

export function useToast() {
  function toast(
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    duration?: number,
  ) {
    const id = toastIdCounter++
    toasts.value.push({
      id,
      message,
      type,
      duration,
    })
  }

  function success(message: string, duration?: number) {
    toast(message, 'success', duration)
  }

  function error(message: string, duration?: number) {
    toast(message, 'error', duration)
  }

  function info(message: string, duration?: number) {
    toast(message, 'info', duration)
  }

  function closeToast(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts: readonly(toasts),
    toast,
    success,
    error,
    info,
    closeToast,
  }
}

