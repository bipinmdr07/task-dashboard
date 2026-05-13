import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { SortBy } from '~/stores/usePreferencesStore'
import type { Task } from '~/stores/useTasksStore'
import { useTasksStore } from '~/stores/useTasksStore'
import { usePreferencesStore } from '~/stores/usePreferencesStore'

/** Raw ascending comparison for the chosen field (direction applied by the caller). */
function compareTasksByField(a: Task, b: Task, sortBy: SortBy): number {
  switch (sortBy) {
    case 'title':
      return a.title.localeCompare(b.title)
    case 'completed':
      // false (pending) before true (done) in natural order
      return Number(a.completed) - Number(b.completed)
    case 'createdAt':
    default:
      return a.createdAt.getTime() - b.createdAt.getTime()
  }
}

export function useTaskSorting() {
  const taskStore = useTasksStore()
  const prefsStore = usePreferencesStore()

  const { tasks } = storeToRefs(taskStore)
  const { sortBy, sortDirection, filterStatus } = storeToRefs(prefsStore)

  const sortedTasks = computed(() => {
    const copy = [...tasks.value]
    const dir = sortDirection.value === 'asc' ? 1 : -1

    copy.sort((a, b) => {
      const cmp = compareTasksByField(a, b, sortBy.value)
      // Stable tie-breaker by id so ordering is deterministic
      return cmp === 0 ? (a.id - b.id) * dir : cmp * dir
    })

    return copy
  })

  // Apply the active filter on top of the sorted list
  const displayedTasks = computed(() => {
    if (filterStatus.value === 'active') return sortedTasks.value.filter(t => !t.completed)
    if (filterStatus.value === 'completed') return sortedTasks.value.filter(t => t.completed)
    return sortedTasks.value
  })

  const taskTotalLabel = computed(() => {
    const total = tasks.value.length
    const shown = displayedTasks.value.length
    if (filterStatus.value !== 'all' && shown !== total)
      return `Showing ${shown} of ${total} task${total === 1 ? '' : 's'}`
    return `${total} task${total === 1 ? '' : 's'} total`
  })

  const filteredEmptyMessage = computed<string | undefined>(() => {
    if (displayedTasks.value.length === 0 && tasks.value.length > 0) {
      return filterStatus.value === 'active' ? 'No active tasks' : 'No completed tasks'
    }
    return undefined
  })

  return { sortedTasks, displayedTasks, taskTotalLabel, filteredEmptyMessage }
}
