import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SortBy = 'createdAt' | 'title' | 'completed'
export type SortDirection = 'asc' | 'desc'
export type FilterStatus = 'all' | 'active' | 'completed'
export type Theme = 'light' | 'dark' | 'system'

export const PREFERENCES_STORAGE_KEY = 'task-dashboard:preferences'

// Runtime arrays let hydrateFromStorage validate without duplicating the union literals.
const VALID_SORT_BY: SortBy[] = ['createdAt', 'title', 'completed']
const VALID_SORT_DIRECTION: SortDirection[] = ['asc', 'desc']
const VALID_FILTER_STATUS: FilterStatus[] = ['all', 'active', 'completed']
const VALID_THEME: Theme[] = ['light', 'dark', 'system']

export interface PreferencesState {
  sortBy: SortBy
  sortDirection: SortDirection
  filterStatus: FilterStatus
  theme: Theme
}

// Snapshot shape written to localStorage — v1 is kept; new fields are optional
// so payloads written by older versions still hydrate without errors.
export interface PreferencesStoragePayload {
  v: 1
  sortBy: SortBy
  sortDirection: SortDirection
  filterStatus?: FilterStatus
  theme?: Theme
}

export const usePreferencesStore = defineStore('preferences', () => {
  const sortBy = ref<SortBy>('createdAt')
  const sortDirection = ref<SortDirection>('desc')
  const filterStatus = ref<FilterStatus>('all')
  const theme = ref<Theme>('system')

  function setSortBy(value: SortBy) {
    sortBy.value = value
  }

  function setSortDirection(value: SortDirection) {
    sortDirection.value = value
  }

  function toggleSortDirection() {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  }

  function setFilter(value: FilterStatus) {
    filterStatus.value = value
  }

  function setTheme(value: Theme) {
    theme.value = value
  }

  /**
   * Merges a stored snapshot back into the store. Fields that fail validation
   * are skipped so the ref keeps its default — future additions never cause errors.
   */
  function hydrateFromStorage(raw: unknown): void {
    if (!raw || typeof raw !== 'object' || (raw as PreferencesStoragePayload).v !== 1) return
    const payload = raw as Partial<PreferencesStoragePayload>
    if (payload.sortBy && (VALID_SORT_BY as string[]).includes(payload.sortBy)) {
      sortBy.value = payload.sortBy
    }
    if (payload.sortDirection && (VALID_SORT_DIRECTION as string[]).includes(payload.sortDirection)) {
      sortDirection.value = payload.sortDirection
    }
    if (payload.filterStatus && (VALID_FILTER_STATUS as string[]).includes(payload.filterStatus)) {
      filterStatus.value = payload.filterStatus
    }
    if (payload.theme && (VALID_THEME as string[]).includes(payload.theme)) {
      theme.value = payload.theme
    }
  }

  /** Plain object ready for JSON.stringify in the persistence plugin. */
  function getStorageSnapshot(): PreferencesStoragePayload {
    return {
      v: 1,
      sortBy: sortBy.value,
      sortDirection: sortDirection.value,
      filterStatus: filterStatus.value,
      theme: theme.value,
    }
  }

  return {
    sortBy,
    sortDirection,
    filterStatus,
    theme,
    setSortBy,
    setSortDirection,
    toggleSortDirection,
    setFilter,
    setTheme,
    hydrateFromStorage,
    getStorageSnapshot,
  }
})
