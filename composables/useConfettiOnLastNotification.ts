import { watch, type Ref } from 'vue'
import type { Notification } from '~/stores/useNotificationStore'

/**
 * Watches the toast list: if the newest item wants confetti, fire it once per id
 * so dismissals and re-renders don't replay the animation.
 */
export function useConfettiOnLastNotification(notifications: Ref<Notification[]>) {
  const firedIds = new Set<number>()
  // deep: true so Pinia's notify() (array push) is observed; shallow watch only
  // runs when the array reference changes, which the store never does.
  watch(notifications, (list) => {
    const latest = list[list.length - 1]
    if (!latest?.confetti || firedIds.has(latest.id)) return
    firedIds.add(latest.id)
    // canvas-confetti is a browser-only ESM default export — skip quietly if the chunk fails
    import('canvas-confetti')
      .then(({ default: confetti }) => {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.85 } })
      })
      .catch(() => { })
  }, { deep: true })
}
