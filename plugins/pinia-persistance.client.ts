import { useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { TASK_STORAGE_KEY, useTasksStore } from '~/stores/useTasksStore'
import { PREFERENCES_STORAGE_KEY, usePreferencesStore } from '~/stores/usePreferencesStore'
import { useNotificationStore } from '~/stores/useNotificationStore'

let persistWarningShown = false

/** One warning per session so quota / private mode does not spam toasts. */
function warnPersistFailureOnce(cause?: unknown) {
  if (import.meta.dev && cause !== undefined) {
    console.warn('[pinia-persistence] localStorage setItem failed', cause)
  }
  if (persistWarningShown) return
  persistWarningShown = true
  try {
    useNotificationStore().notify(
      'warning',
      'Could not save locally (storage may be full or blocked).',
    )
  } catch (e: unknown) {
    // Store not ready — skip the toast but leave a trace for debugging
    console.warn('[pinia-persistence] Could not show persist warning', e)
  }
}

/** Parse one key; result is `null` when missing, invalid JSON, or no access — hydrate helpers treat that as "nothing saved". */
function readJsonFromLocalStorage(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return null
    return JSON.parse(raw)
  } catch (e: unknown) {
    // Missing key is handled above; this is bad JSON or storage access errors
    if (import.meta.dev) console.warn(`[pinia-persistence] Could not read ${key}`, e)
    return null
  }
}

function persistTasks(store: ReturnType<typeof useTasksStore>) {
  try {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(store.getStorageSnapshot()))
  } catch (e: unknown) {
    warnPersistFailureOnce(e)
  }
}

function persistPreferences(store: ReturnType<typeof usePreferencesStore>) {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(store.getStorageSnapshot()))
  } catch (e: unknown) {
    warnPersistFailureOnce(e)
  }
}

export default defineNuxtPlugin({
  name: 'pinia-persistance',
  // Run after Pinia is installed so the stores exist before we hydrate.
  enforce: 'post',
  setup() {
    const taskStore = useTasksStore()
    const prefsStore = usePreferencesStore()
    const colorMode = useColorMode()

    taskStore.hydrateFromStorage(readJsonFromLocalStorage(TASK_STORAGE_KEY))
    prefsStore.hydrateFromStorage(readJsonFromLocalStorage(PREFERENCES_STORAGE_KEY))

    // Apply the stored theme preference so color-mode reflects what the user chose last
    colorMode.preference = prefsStore.theme

    // Seed from the API on first visit (no saved tasks yet)
    if (taskStore.isEmpty) {
      taskStore.fetchTasks()
    }

    const debouncedPersistTasks = useDebounceFn(() => persistTasks(taskStore), 1000)
    const debouncedPersistPreferences = useDebounceFn(() => persistPreferences(prefsStore), 1000)

    const { tasks } = storeToRefs(taskStore)
    watch(tasks, debouncedPersistTasks, { deep: true })

    const { sortBy, sortDirection, filterStatus, theme } = storeToRefs(prefsStore)
    watch([sortBy, sortDirection, filterStatus, theme], debouncedPersistPreferences)

    // Also keep colorMode in sync whenever the preferences theme changes
    watch(theme, value => { colorMode.preference = value })

    // Final synchronous flush on page unload so rapid changes just before close aren't lost
    window.addEventListener('pagehide', () => {
      persistTasks(taskStore)
      persistPreferences(prefsStore)
    })
  },
})
