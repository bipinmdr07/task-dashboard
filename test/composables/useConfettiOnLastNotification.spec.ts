import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useConfettiOnLastNotification } from '~/composables/useConfettiOnLastNotification'
import type { Notification } from '~/stores/useNotificationStore'

const { mockConfetti } = vi.hoisted(() => ({
  mockConfetti: vi.fn(),
}))

vi.mock('canvas-confetti', () => ({
  default: mockConfetti,
}))

describe('useConfettiOnLastNotification', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockConfetti.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fires confetti when newest notification requests it', async () => {
    const Host = defineComponent({
      setup() {
        const notifications = ref<Notification[]>([])
        useConfettiOnLastNotification(notifications)
        return { notifications }
      },
      template: '<div />',
    })
    const wrapper = mount(Host)
    wrapper.vm.notifications = [
      {
        id: 0,
        type: 'success',
        message: 'yay',
        duration: 3000,
        dismissible: true,
        confetti: true,
      },
    ]
    await nextTick()
    await flushPromises()
    expect(mockConfetti).toHaveBeenCalledTimes(1)
  })

  it('does not refire confetti for the same notification id', async () => {
    const Host = defineComponent({
      setup() {
        const notifications = ref<Notification[]>([])
        useConfettiOnLastNotification(notifications)
        return { notifications }
      },
      template: '<div />',
    })
    const wrapper = mount(Host)
    const n: Notification = {
      id: 0,
      type: 'success',
      message: 'yay',
      duration: 3000,
      dismissible: true,
      confetti: true,
    }
    wrapper.vm.notifications = [n]
    await nextTick()
    await flushPromises()
    wrapper.vm.notifications = []
    await nextTick()
    wrapper.vm.notifications = [n]
    await nextTick()
    await flushPromises()
    expect(mockConfetti).toHaveBeenCalledTimes(1)
  })

  it('skips confetti when newest notification has no confetti flag', async () => {
    const Host = defineComponent({
      setup() {
        const notifications = ref<Notification[]>([])
        useConfettiOnLastNotification(notifications)
        return { notifications }
      },
      template: '<div />',
    })
    const wrapper = mount(Host)
    wrapper.vm.notifications = [
      {
        id: 0,
        type: 'info',
        message: 'hi',
        duration: 3000,
        dismissible: true,
      },
    ]
    await nextTick()
    await flushPromises()
    expect(mockConfetti).not.toHaveBeenCalled()
  })
})
