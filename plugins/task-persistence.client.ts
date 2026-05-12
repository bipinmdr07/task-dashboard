import {
  TASK_STORAGE_KEY,
  getTasksStorageSnapshot,
  hydrateTasksFromStorage,
  useTasks,
} from '~/composables/useTasks'

function persist() {
  try {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(getTasksStorageSnapshot()))
  } catch {
    // Storage quota exceeded or access denied — not fatal.
  }
}

export default defineNuxtPlugin(() => {
  // Restore persisted tasks before any reactive watchers fire so the UI
  // renders with the saved state on the very first frame.
  try {
    const raw = localStorage.getItem(TASK_STORAGE_KEY)
    hydrateTasksFromStorage(raw ? JSON.parse(raw) : null)
  } catch {
    // Malformed JSON or storage access denied — start fresh, don't crash.
  }

  const { tasks } = useTasks()

  // Deep watch catches add / toggle / delete mutations inside the tasks array.
  watch(tasks, persist, { deep: true })
})
