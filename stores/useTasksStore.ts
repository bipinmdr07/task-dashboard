import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useNotificationStore } from '~/stores/useNotificationStore'

export interface Task {
  id: number
  title: string
  completed: boolean
  createdAt: Date
}

/** Key used by the client plugin when reading/writing localStorage. */
export const TASK_STORAGE_KEY = 'task-dashboard:tasks'

// On-disk shape — createdAt is ISO so JSON round-trips cleanly
interface StoredTask {
  id: number
  title: string
  completed: boolean
  createdAt: string
}

export interface TasksStoragePayload {
  v: 1
  tasks: StoredTask[]
}

interface ApiTodo {
  id: number
  title: string
  completed: boolean
}

// Stable base so each API task id maps to a deterministic createdAt
const API_DATE_BASE = new Date('2025-01-01T00:00:00Z').getTime()

/** Used by hydrate so bad localStorage never replaces good in-memory state. */
function isTasksStoragePayload(raw: unknown): raw is TasksStoragePayload {
  if (!raw || typeof raw !== 'object') return false
  const obj = raw as Partial<TasksStoragePayload>
  return obj.v === 1 && Array.isArray(obj.tasks)
}

/** Turns API rows into app tasks with stable createdAt for sorting. */
function apiTodosToTasks(todos: ApiTodo[]): Task[] {
  return todos.map(t => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
    createdAt: new Date(API_DATE_BASE + t.id * 3_600_000),
  }))
}

/** ISO strings from disk become real Dates in the store. */
function tasksFromStoragePayload(payload: TasksStoragePayload): Task[] {
  return payload.tasks.map(t => ({
    ...t,
    createdAt: new Date(t.createdAt),
  }))
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // --- Getters ---

  const completedTasks = computed(() => tasks.value.filter(t => t.completed))
  const pendingTasks = computed(() => tasks.value.filter(t => !t.completed))
  const completedCount = computed(() => completedTasks.value.length)
  const pendingCount = computed(() => pendingTasks.value.length)

  const completionPercentage = computed(() => {
    if (tasks.value.length === 0) return 0
    return Math.round((completedCount.value / tasks.value.length) * 100)
  })

  // Fire once when the user completes every task — transition to 100% only
  watch(completionPercentage, (pct, prev) => {
    if (pct === 100 && prev !== 100 && tasks.value.length > 0) {
      useNotificationStore().notify('success', 'All done!', { confetti: true })
    }
  })

  // Sorted copy — newest createdAt first
  const tasksByDate = computed(() =>
    [...tasks.value].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  )

  const isEmpty = computed(() => tasks.value.length === 0)

  // --- Actions ---

  function clearError() {
    error.value = null
  }

  async function fetchTasks() {
    loading.value = true
    clearError()
    try {
      const todos = await $fetch<ApiTodo[]>(
        'https://jsonplaceholder.typicode.com/todos?_limit=20',
      )
      tasks.value = apiTodosToTasks(todos)
    } catch {
      const message = 'Failed to load tasks. Please check your connection and try again.'
      error.value = message
      useNotificationStore().notify('error', message)
    } finally {
      loading.value = false
    }
  }

  function addTask(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    const maxId = tasks.value.reduce((max, t) => Math.max(max, t.id), 0)
    tasks.value.unshift({
      id: maxId + 1,
      title: trimmed,
      completed: false,
      createdAt: new Date(),
    })
    useNotificationStore().notify('success', 'Task added')
  }

  function toggleTask(id: number) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return
    task.completed = !task.completed
    useNotificationStore().notify(
      'info',
      task.completed ? `"${task.title}" marked complete.` : `"${task.title}" marked incomplete.`,
    )
  }

  function deleteTask(id: number) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return
    tasks.value.splice(index, 1)
    useNotificationStore().notify('info', 'Task removed')
  }

  function clearCompleted() {
    const count = completedCount.value
    if (count === 0) return
    tasks.value = tasks.value.filter(t => !t.completed)
    useNotificationStore().notify('success', `${count} completed task${count === 1 ? '' : 's'} cleared.`)
  }

  function reorderTasks(fromIndex: number, toIndex: number) {
    const len = tasks.value.length
    if (
      fromIndex < 0 || fromIndex >= len ||
      toIndex < 0 || toIndex >= len ||
      fromIndex === toIndex
    ) return
    const [item] = tasks.value.splice(fromIndex, 1)
    tasks.value.splice(toIndex, 0, item)
  }

  // --- Storage helpers (used by the persistence plugin) ---

  /**
   * Loads a previously serialised snapshot into the store.
   * Ignores payloads that are not valid v1 so corrupt storage never wipes tasks.
   */
  function hydrateFromStorage(raw: unknown): void {
    if (!isTasksStoragePayload(raw)) return
    tasks.value = tasksFromStoragePayload(raw)
  }

  /** Plain object for JSON.stringify in the persistence plugin. */
  function getStorageSnapshot(): TasksStoragePayload {
    return {
      v: 1,
      tasks: tasks.value.map(t => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        createdAt: t.createdAt.toISOString(),
      })),
    }
  }

  return {
    tasks,
    loading,
    error,
    completedTasks,
    pendingTasks,
    completedCount,
    pendingCount,
    completionPercentage,
    tasksByDate,
    isEmpty,
    clearError,
    fetchTasks,
    addTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    reorderTasks,
    hydrateFromStorage,
    getStorageSnapshot,
  }
})
