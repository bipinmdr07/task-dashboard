export interface Task {
  id: number
  title: string
  completed: boolean
  createdAt: Date
}

export const TASK_STORAGE_KEY = 'task-dashboard:tasks'

// On-disk representation — createdAt is an ISO string so JSON round-trips cleanly
interface StoredTask {
  id: number
  title: string
  completed: boolean
  createdAt: string
}

interface StoragePayload {
  v: 1
  tasks: StoredTask[]
}

interface TaskState {
  tasks: Task[]
}

// Module-level singleton so state persists across page navigation
const state = reactive<TaskState>({
  tasks: [],
})

/**
 * Applies a previously serialised snapshot to the module singleton.
 * Silently no-ops on anything that doesn't look like a valid v1 payload so
 * corrupt storage never wipes the user's tasks.
 */
export function hydrateTasksFromStorage(raw: unknown): void {
  if (
    !raw ||
    typeof raw !== 'object' ||
    (raw as StoragePayload).v !== 1 ||
    !Array.isArray((raw as StoragePayload).tasks)
  ) return

  const payload = raw as StoragePayload
  state.tasks = payload.tasks.map(t => ({
    ...t,
    createdAt: new Date(t.createdAt),
  }))
}

/** Returns a plain object ready for JSON.stringify. */
export function getTasksStorageSnapshot(): StoragePayload {
  return {
    v: 1,
    tasks: state.tasks.map(t => ({
      id: t.id,
      title: t.title,
      completed: t.completed,
      createdAt: t.createdAt.toISOString(),
    })),
  }
}

export function useTasks() {
  // Single pass over the task list so both counts share one iteration
  const taskCounts = computed(() =>
    state.tasks.reduce(
      (acc, t) => {
        if (t.completed) acc.completed++
        else acc.pending++
        return acc
      },
      { completed: 0, pending: 0 },
    ),
  )
  const completedCount = computed(() => taskCounts.value.completed)
  const pendingCount = computed(() => taskCounts.value.pending)
  const completionPercent = computed(() => {
    if (state.tasks.length === 0) return 0
    return Math.round((taskCounts.value.completed / state.tasks.length) * 100)
  })

  function addTask(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    const maxId = state.tasks.reduce((max, t) => Math.max(max, t.id), 0)
    state.tasks.unshift({
      id: maxId + 1,
      title: trimmed,
      completed: false,
      createdAt: new Date(),
    })
  }

  function toggleTask(id: number) {
    const task = state.tasks.find(t => t.id === id)
    if (task) task.completed = !task.completed
  }

  function deleteTask(id: number) {
    const index = state.tasks.findIndex(t => t.id === id)
    if (index !== -1) state.tasks.splice(index, 1)
  }

  return {
    tasks: computed(() => state.tasks),
    completedCount,
    pendingCount,
    completionPercent,
    addTask,
    toggleTask,
    deleteTask,
  }
}
