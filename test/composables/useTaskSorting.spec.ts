import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTaskSorting } from '~/composables/useTaskSorting'
import { usePreferencesStore } from '~/stores/usePreferencesStore'
import { useTasksStore } from '~/stores/useTasksStore'

function seedTasks(store: ReturnType<typeof useTasksStore>) {
  const t0 = new Date('2024-01-01T00:00:00Z')
  const t1 = new Date('2024-01-02T00:00:00Z')
  store.tasks = [
    { id: 2, title: 'b', completed: true, createdAt: t1 },
    { id: 1, title: 'a', completed: false, createdAt: t0 },
  ]
}

describe('useTaskSorting', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('sorts by createdAt ascending with id tie-break', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    seedTasks(tasks)
    prefs.setSortBy('createdAt')
    prefs.setSortDirection('asc')
    const { sortedTasks } = useTaskSorting()
    expect(sortedTasks.value.map(t => t.id)).toEqual([1, 2])
  })

  it('sorts by createdAt descending with id tie-break', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    seedTasks(tasks)
    prefs.setSortBy('createdAt')
    prefs.setSortDirection('desc')
    const { sortedTasks } = useTaskSorting()
    expect(sortedTasks.value.map(t => t.id)).toEqual([2, 1])
  })

  it('sorts by title ascending', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    seedTasks(tasks)
    prefs.setSortBy('title')
    prefs.setSortDirection('asc')
    const { sortedTasks } = useTaskSorting()
    expect(sortedTasks.value.map(t => t.title)).toEqual(['a', 'b'])
  })

  it('sorts by title descending', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    seedTasks(tasks)
    prefs.setSortBy('title')
    prefs.setSortDirection('desc')
    const { sortedTasks } = useTaskSorting()
    expect(sortedTasks.value.map(t => t.title)).toEqual(['b', 'a'])
  })

  it('sorts by completed ascending then id', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    tasks.tasks = [
      { id: 2, title: 'b', completed: true, createdAt: new Date() },
      { id: 1, title: 'a', completed: false, createdAt: new Date() },
    ]
    prefs.setSortBy('completed')
    prefs.setSortDirection('asc')
    const { sortedTasks } = useTaskSorting()
    expect(sortedTasks.value.map(t => t.id)).toEqual([1, 2])
  })

  it('sorts by completed descending then id', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    tasks.tasks = [
      { id: 2, title: 'b', completed: false, createdAt: new Date() },
      { id: 1, title: 'a', completed: true, createdAt: new Date() },
    ]
    prefs.setSortBy('completed')
    prefs.setSortDirection('desc')
    const { sortedTasks } = useTaskSorting()
    expect(sortedTasks.value.map(t => t.id)).toEqual([1, 2])
  })

  it('displayedTasks shows only active when filter is active', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    seedTasks(tasks)
    prefs.setFilter('active')
    const { displayedTasks } = useTaskSorting()
    expect(displayedTasks.value.map(t => t.id)).toEqual([1])
  })

  it('displayedTasks shows only completed when filter is completed', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    seedTasks(tasks)
    prefs.setFilter('completed')
    const { displayedTasks } = useTaskSorting()
    expect(displayedTasks.value.map(t => t.id)).toEqual([2])
  })

  it('taskTotalLabel uses singular when one task', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    tasks.tasks = [{ id: 1, title: 'x', completed: false, createdAt: new Date() }]
    prefs.setFilter('all')
    const { taskTotalLabel } = useTaskSorting()
    expect(taskTotalLabel.value).toBe('1 task total')
  })

  it('taskTotalLabel uses plural for multiple tasks', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    seedTasks(tasks)
    prefs.setFilter('all')
    const { taskTotalLabel } = useTaskSorting()
    expect(taskTotalLabel.value).toBe('2 tasks total')
  })

  it('taskTotalLabel shows filtered counts when filter narrows', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    seedTasks(tasks)
    prefs.setFilter('active')
    const { taskTotalLabel } = useTaskSorting()
    expect(taskTotalLabel.value).toBe('Showing 1 of 2 tasks')
  })

  it('filteredEmptyMessage when no active tasks but tasks exist', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    tasks.tasks = [{ id: 1, title: 'x', completed: true, createdAt: new Date() }]
    prefs.setFilter('active')
    const { filteredEmptyMessage } = useTaskSorting()
    expect(filteredEmptyMessage.value).toBe('No active tasks')
  })

  it('filteredEmptyMessage when no completed tasks but tasks exist', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    tasks.tasks = [{ id: 1, title: 'x', completed: false, createdAt: new Date() }]
    prefs.setFilter('completed')
    const { filteredEmptyMessage } = useTaskSorting()
    expect(filteredEmptyMessage.value).toBe('No completed tasks')
  })

  it('filteredEmptyMessage is undefined when list not empty for filter', () => {
    const tasks = useTasksStore()
    const prefs = usePreferencesStore()
    seedTasks(tasks)
    prefs.setFilter('active')
    const { filteredEmptyMessage } = useTaskSorting()
    expect(filteredEmptyMessage.value).toBeUndefined()
  })
})
