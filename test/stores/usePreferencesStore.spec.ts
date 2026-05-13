import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePreferencesStore } from '~/stores/usePreferencesStore'

describe('usePreferencesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('setSortBy updates sortBy', () => {
    const store = usePreferencesStore()
    store.setSortBy('title')
    expect(store.sortBy).toBe('title')
  })

  it('setSortDirection updates sortDirection', () => {
    const store = usePreferencesStore()
    store.setSortDirection('asc')
    expect(store.sortDirection).toBe('asc')
  })

  it('toggleSortDirection flips asc to desc', () => {
    const store = usePreferencesStore()
    store.setSortDirection('asc')
    store.toggleSortDirection()
    expect(store.sortDirection).toBe('desc')
  })

  it('toggleSortDirection flips desc to asc', () => {
    const store = usePreferencesStore()
    store.setSortDirection('desc')
    store.toggleSortDirection()
    expect(store.sortDirection).toBe('asc')
  })

  it('setFilter updates filterStatus', () => {
    const store = usePreferencesStore()
    store.setFilter('active')
    expect(store.filterStatus).toBe('active')
  })

  it('setTheme updates theme', () => {
    const store = usePreferencesStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
  })

  it('toggleSidebar flips sidebarCollapsed', () => {
    const store = usePreferencesStore()
    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(true)
  })

  it('hydrateFromStorage ignores non-object', () => {
    const store = usePreferencesStore()
    store.setSortBy('title')
    store.hydrateFromStorage(null)
    expect(store.sortBy).toBe('title')
  })

  it('hydrateFromStorage ignores wrong version', () => {
    const store = usePreferencesStore()
    store.setSortBy('title')
    store.hydrateFromStorage({ v: 2, sortBy: 'completed', sortDirection: 'asc' })
    expect(store.sortBy).toBe('title')
  })

  it('hydrateFromStorage applies valid sortBy', () => {
    const store = usePreferencesStore()
    store.hydrateFromStorage({
      v: 1,
      sortBy: 'completed',
      sortDirection: 'desc',
    })
    expect(store.sortBy).toBe('completed')
  })

  it('hydrateFromStorage applies valid sortDirection', () => {
    const store = usePreferencesStore()
    store.hydrateFromStorage({ v: 1, sortBy: 'title', sortDirection: 'asc' })
    expect(store.sortDirection).toBe('asc')
  })

  it('hydrateFromStorage applies optional filterStatus', () => {
    const store = usePreferencesStore()
    store.hydrateFromStorage({
      v: 1,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      filterStatus: 'completed',
    })
    expect(store.filterStatus).toBe('completed')
  })

  it('hydrateFromStorage applies optional theme', () => {
    const store = usePreferencesStore()
    store.hydrateFromStorage({
      v: 1,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      theme: 'light',
    })
    expect(store.theme).toBe('light')
  })

  it('hydrateFromStorage applies sidebarCollapsed when boolean', () => {
    const store = usePreferencesStore()
    store.hydrateFromStorage({
      v: 1,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      sidebarCollapsed: true,
    })
    expect(store.sidebarCollapsed).toBe(true)
  })

  it('hydrateFromStorage skips invalid sortBy string', () => {
    const store = usePreferencesStore()
    store.setSortBy('title')
    store.hydrateFromStorage({
      v: 1,
      sortBy: 'not-a-field' as 'title',
      sortDirection: 'desc',
    })
    expect(store.sortBy).toBe('title')
  })

  it('hydrateFromStorage skips invalid sortDirection string', () => {
    const store = usePreferencesStore()
    store.setSortDirection('asc')
    store.hydrateFromStorage({
      v: 1,
      sortBy: 'title',
      sortDirection: 'sideways' as 'asc',
    })
    expect(store.sortDirection).toBe('asc')
  })

  it('hydrateFromStorage skips invalid filterStatus string', () => {
    const store = usePreferencesStore()
    store.setFilter('all')
    store.hydrateFromStorage({
      v: 1,
      sortBy: 'title',
      sortDirection: 'desc',
      filterStatus: 'maybe' as 'all',
    })
    expect(store.filterStatus).toBe('all')
  })

  it('hydrateFromStorage skips invalid theme string', () => {
    const store = usePreferencesStore()
    store.setTheme('system')
    store.hydrateFromStorage({
      v: 1,
      sortBy: 'title',
      sortDirection: 'desc',
      theme: 'neon' as 'system',
    })
    expect(store.theme).toBe('system')
  })

  it('hydrateFromStorage skips sidebarCollapsed when not boolean', () => {
    const store = usePreferencesStore()
    store.hydrateFromStorage({
      v: 1,
      sortBy: 'title',
      sortDirection: 'desc',
      sidebarCollapsed: 'yes' as unknown as boolean,
    })
    expect(store.sidebarCollapsed).toBe(false)
  })

  it('getStorageSnapshot reflects current state and version', () => {
    const store = usePreferencesStore()
    store.setSortBy('title')
    store.setSortDirection('asc')
    store.setFilter('active')
    store.setTheme('dark')
    store.sidebarCollapsed = true
    expect(store.getStorageSnapshot()).toEqual({
      v: 1,
      sortBy: 'title',
      sortDirection: 'asc',
      filterStatus: 'active',
      theme: 'dark',
      sidebarCollapsed: true,
    })
  })
})
