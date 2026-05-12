export interface Task {
  id: number
  title: string
  completed: boolean
  createdAt: Date
}

interface JsonPlaceholderTodo {
  id: number
  title: string
  completed: boolean
  userId: number
}

interface TaskState {
  tasks: Task[]
  apiError: string | null
  seeded: boolean
}

// Module-level singleton so state persists across page navigation
const state = reactive<TaskState>({
  tasks: [],
  apiError: null,
  seeded: false,
})

export function useTasks() {
  const completedCount = computed(() => state.tasks.filter(t => t.completed).length)
  const pendingCount = computed(() => state.tasks.filter(t => !t.completed).length)
  const completionPercent = computed(() => {
    if (state.tasks.length === 0) return 0
    return Math.round((completedCount.value / state.tasks.length) * 100)
  })

  function addTask(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    // Place new IDs above the seeded range (seed IDs come from JSONPlaceholder, max 200)
    const maxId = state.tasks.reduce((max, t) => Math.max(max, t.id), 1000)
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

  function dismissError() {
    state.apiError = null
  }

  /**
   * Merges seed tasks from the API on first load only.
   * Skips if tasks already exist (e.g. user added tasks before seed completed).
   */
  function mergeSeedTasks(remoteTasks: JsonPlaceholderTodo[]) {
    if (state.seeded) return
    state.seeded = true
    if (state.tasks.length > 0) return
    state.tasks = remoteTasks.map(todo => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: new Date(),
    }))
  }

  function setApiError(message: string) {
    state.apiError = message
    state.seeded = true // Don't retry after error
  }

  return {
    tasks: computed(() => state.tasks),
    apiError: computed(() => state.apiError),
    seeded: computed(() => state.seeded),
    completedCount,
    pendingCount,
    completionPercent,
    addTask,
    toggleTask,
    deleteTask,
    dismissError,
    mergeSeedTasks,
    setApiError,
  }
}
