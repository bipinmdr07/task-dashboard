import { watch, type Ref } from 'vue'
import type { Notification } from '~/stores/useNotificationStore'

/**
 * Watches the toast list: if the newest item wants confetti, fire it once per id
 * so dismissals and re-renders don't replay the animation.
 */
export function useConfettiOnLastNotification(notifications: Ref<Notification[]>) {
  const firedIds = new Set<number>()
  watch(notifications, (list) => {
    const latest = list[list.length - 1]
    if (!latest?.confetti || firedIds.has(latest.id)) return
    firedIds.add(latest.id)
    // canvas-confetti is a browser-only ESM default export
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.85 } })
    })
  }, { deep: false })
}
