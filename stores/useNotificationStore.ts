import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration: number
  dismissible: boolean
  confetti?: boolean
}

export interface NotifyOptions {
  duration?: number
  dismissible?: boolean
  confetti?: boolean
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const maxVisible = ref(3)

  let _nextId = 0
  // One timer handle per notification id — cleared on any removal to prevent stale callbacks
  const _timers = new Map<number, ReturnType<typeof setTimeout>>()

  function clearTimerFor(id: number) {
    const timer = _timers.get(id)
    if (timer === undefined) return
    clearTimeout(timer)
    _timers.delete(id)
  }

  function dismiss(id: number) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) notifications.value.splice(index, 1)
    clearTimerFor(id)
  }

  function notify(
    type: Notification['type'],
    message: string,
    options?: NotifyOptions,
  ) {
    const id = _nextId++
    const duration = options?.duration ?? 3000
    const dismissible = options?.dismissible ?? true
    const confetti = options?.confetti ?? false

    notifications.value.push({ id, type, message, duration, dismissible, confetti })

    // Evict oldest entries until we are within the visible cap
    while (notifications.value.length > maxVisible.value) {
      const evicted = notifications.value.shift()!
      clearTimerFor(evicted.id)
    }

    _timers.set(id, setTimeout(() => dismiss(id), duration))
  }

  function clearAll() {
    for (const timer of _timers.values()) clearTimeout(timer)
    _timers.clear()
    notifications.value = []
  }

  return {
    notifications,
    maxVisible,
    notify,
    dismiss,
    clearAll,
  }
})
