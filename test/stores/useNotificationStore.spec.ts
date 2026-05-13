import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotificationStore } from '~/stores/useNotificationStore'

describe('useNotificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('notify appends a notification with type and message', () => {
    const store = useNotificationStore()
    store.notify('info', 'Hello')
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0]).toMatchObject({ type: 'info', message: 'Hello' })
  })

  it('notify uses default duration and dismissible', () => {
    const store = useNotificationStore()
    store.notify('success', 'Done')
    expect(store.notifications[0]?.duration).toBe(3000)
    expect(store.notifications[0]?.dismissible).toBe(true)
  })

  it('notify passes confetti when provided', () => {
    const store = useNotificationStore()
    store.notify('success', 'Party', { confetti: true })
    expect(store.notifications[0]?.confetti).toBe(true)
  })

  it('notify assigns incrementing ids', () => {
    const store = useNotificationStore()
    store.notify('info', 'a')
    store.notify('info', 'b')
    expect(store.notifications[0]?.id).toBe(0)
    expect(store.notifications[1]?.id).toBe(1)
  })

  it('evicts oldest when above maxVisible', () => {
    const store = useNotificationStore()
    store.maxVisible = 2
    store.notify('info', 'first')
    store.notify('info', 'second')
    store.notify('info', 'third')
    expect(store.notifications).toHaveLength(2)
    expect(store.notifications.map(n => n.message)).toEqual(['second', 'third'])
  })

  it('auto-dismiss removes the notification after duration', () => {
    vi.useFakeTimers()
    const store = useNotificationStore()
    store.notify('info', 'short', { duration: 1000 })
    expect(store.notifications).toHaveLength(1)
    vi.advanceTimersByTime(1000)
    expect(store.notifications).toHaveLength(0)
  })

  it('dismiss removes the notification by id', () => {
    vi.useFakeTimers()
    const store = useNotificationStore()
    store.notify('info', 'x')
    const id = store.notifications[0]!.id
    store.dismiss(id)
    expect(store.notifications).toHaveLength(0)
  })

  it('dismiss clears pending auto-dismiss timer', () => {
    vi.useFakeTimers()
    const store = useNotificationStore()
    store.notify('info', 'x', { duration: 5000 })
    const id = store.notifications[0]!.id
    store.dismiss(id)
    vi.runAllTimers()
    expect(store.notifications).toHaveLength(0)
  })

  it('clearAll empties notifications and clears timers', () => {
    vi.useFakeTimers()
    const store = useNotificationStore()
    store.notify('info', 'a')
    store.notify('info', 'b')
    store.clearAll()
    expect(store.notifications).toHaveLength(0)
    vi.runAllTimers()
    expect(store.notifications).toHaveLength(0)
  })

  it('eviction clears timer for removed notification', () => {
    vi.useFakeTimers()
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const store = useNotificationStore()
    store.maxVisible = 2
    store.notify('info', 'old')
    store.notify('info', 'mid')
    clearSpy.mockClear()
    store.notify('info', 'new')
    expect(clearSpy).toHaveBeenCalled()
  })
})
