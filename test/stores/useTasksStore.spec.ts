import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotificationStore } from '~/stores/useNotificationStore'
import { useTasksStore } from '~/stores/useTasksStore'

const API_DATE_BASE = new Date('2025-01-01T00:00:00Z').getTime()

describe('useTasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('hydrateFromStorage ignores null', () => {
    const store = useTasksStore()
    store.hydrateFromStorage(null)
    expect(store.tasks).toHaveLength(0)
  })

  it('hydrateFromStorage ignores wrong version', () => {
    const store = useTasksStore()
    store.tasks = [{ id: 1, title: 'x', completed: false, createdAt: new Date() }]
    store.hydrateFromStorage({ v: 2, tasks: [] })
    expect(store.tasks).toHaveLength(1)
  })

  it('hydrateFromStorage ignores tasks that are not an array', () => {
    const store = useTasksStore()
    store.tasks = [{ id: 1, title: 'x', completed: false, createdAt: new Date() }]
    // deliberate invalid shape — hydrate must reject non-array tasks
    store.hydrateFromStorage({ v: 1, tasks: 'nope' } as unknown)
    expect(store.tasks).toHaveLength(1)
  })

  it('hydrateFromStorage restores tasks and Date instances', () => {
    const store = useTasksStore()
    const iso = '2024-06-01T12:00:00.000Z'
    store.hydrateFromStorage({
      v: 1,
      tasks: [{ id: 1, title: 'A', completed: true, createdAt: iso }],
    })
    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0]!.createdAt).toEqual(new Date(iso))
  })

  it('getStorageSnapshot serialises createdAt as ISO', () => {
    const store = useTasksStore()
    const d = new Date('2024-01-02T03:04:05.000Z')
    store.tasks = [{ id: 1, title: 'T', completed: false, createdAt: d }]
    expect(store.getStorageSnapshot()).toEqual({
      v: 1,
      tasks: [{ id: 1, title: 'T', completed: false, createdAt: d.toISOString() }],
    })
  })

  it('isEmpty is true when there are no tasks', () => {
    const store = useTasksStore()
    expect(store.isEmpty).toBe(true)
  })

  it('isEmpty is false when tasks exist', () => {
    const store = useTasksStore()
    store.tasks = [{ id: 1, title: 'x', completed: false, createdAt: new Date() }]
    expect(store.isEmpty).toBe(false)
  })

  it('completionPercentage is zero with no tasks', () => {
    const store = useTasksStore()
    expect(store.completionPercentage).toBe(0)
  })

  it('completionPercentage rounds completed share', () => {
    const store = useTasksStore()
    store.tasks = [
      { id: 1, title: 'a', completed: true, createdAt: new Date() },
      { id: 2, title: 'b', completed: false, createdAt: new Date() },
    ]
    expect(store.completionPercentage).toBe(50)
  })

  it('completedTasks and pendingTasks reflect completion', () => {
    const store = useTasksStore()
    store.tasks = [
      { id: 1, title: 'a', completed: true, createdAt: new Date() },
      { id: 2, title: 'b', completed: false, createdAt: new Date() },
    ]
    expect(store.completedTasks.every(t => t.completed)).toBe(true)
    expect(store.pendingTasks.every(t => !t.completed)).toBe(true)
  })

  it('completedCount and pendingCount match tasks', () => {
    const store = useTasksStore()
    store.tasks = [
      { id: 1, title: 'a', completed: true, createdAt: new Date() },
      { id: 2, title: 'b', completed: false, createdAt: new Date() },
    ]
    expect(store.completedCount).toBe(1)
    expect(store.pendingCount).toBe(1)
  })

  it('tasksByDate orders newest createdAt first', () => {
    const store = useTasksStore()
    const older = new Date('2020-01-01T00:00:00Z')
    const newer = new Date('2021-01-01T00:00:00Z')
    store.tasks = [
      { id: 1, title: 'old', completed: false, createdAt: older },
      { id: 2, title: 'new', completed: false, createdAt: newer },
    ]
    expect(store.tasksByDate.map(t => t.id)).toEqual([2, 1])
  })

  it('clearError clears error', () => {
    const store = useTasksStore()
    store.error = 'oops'
    store.clearError()
    expect(store.error).toBeNull()
  })

  it('fetchTasks toggles loading around the request', async () => {
    const store = useTasksStore()
    let resolveFetch!: (value: unknown) => void
    const deferred = new Promise<unknown>(resolve => {
      resolveFetch = resolve
    })
    vi.stubGlobal('$fetch', vi.fn(() => deferred))
    const done = store.fetchTasks()
    expect(store.loading).toBe(true)
    resolveFetch([])
    await done
    expect(store.loading).toBe(false)
  })

  it('fetchTasks maps API todos to stable createdAt', async () => {
    const store = useTasksStore()
    vi.stubGlobal(
      '$fetch',
      vi.fn().mockResolvedValue([{ id: 2, title: 'Api', completed: false }]),
    )
    await store.fetchTasks()
    expect(store.tasks[0]!.createdAt.getTime()).toBe(API_DATE_BASE + 2 * 3_600_000)
  })

  it('fetchTasks sets error and notifies on failure', async () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('network')))
    await store.fetchTasks()
    expect(store.error).toBe(
      'Failed to load tasks. Please check your connection and try again.',
    )
    expect(spy).toHaveBeenCalledWith(
      'error',
      'Failed to load tasks. Please check your connection and try again.',
    )
  })

  it('fetchTasks appends HTTP status when $fetch rejects with statusCode', async () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    vi.stubGlobal(
      '$fetch',
      vi.fn().mockRejectedValue(Object.assign(new Error('Bad Gateway'), { statusCode: 502 })),
    )
    await store.fetchTasks()
    expect(store.error).toBe(
      'Failed to load tasks. Please check your connection and try again. (Error 502)',
    )
    expect(spy).toHaveBeenCalledWith(
      'error',
      'Failed to load tasks. Please check your connection and try again. (Error 502)',
    )
  })

  it('fetchTasks treats non-array JSON as an error', async () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ not: 'an array' }))
    await store.fetchTasks()
    expect(store.error).toBe(
      'Could not load tasks — the server returned an unexpected response.',
    )
    expect(spy).toHaveBeenCalledWith(
      'error',
      'Could not load tasks — the server returned an unexpected response.',
    )
    expect(store.tasks).toHaveLength(0)
  })

  it('addTask ignores whitespace-only title', () => {
    const store = useTasksStore()
    store.addTask('   ')
    expect(store.tasks).toHaveLength(0)
  })

  it('addTask trims title and prepends task', () => {
    const store = useTasksStore()
    store.addTask('  hello  ')
    expect(store.tasks[0]!.title).toBe('hello')
  })

  it('addTask assigns max id plus one', () => {
    const store = useTasksStore()
    store.tasks = [{ id: 5, title: 'x', completed: false, createdAt: new Date() }]
    store.addTask('next')
    expect(store.tasks[0]!.id).toBe(6)
  })

  it('addTask notifies success', () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.addTask('hi')
    expect(spy).toHaveBeenCalledWith('success', 'Task added')
  })

  it('toggleTask flips completed', () => {
    const store = useTasksStore()
    store.tasks = [{ id: 1, title: 't', completed: false, createdAt: new Date() }]
    store.toggleTask(1)
    expect(store.tasks[0]!.completed).toBe(true)
  })

  it('toggleTask is a no-op for unknown id', () => {
    const store = useTasksStore()
    store.tasks = [{ id: 1, title: 't', completed: false, createdAt: new Date() }]
    store.toggleTask(99)
    expect(store.tasks[0]!.completed).toBe(false)
  })

  it('deleteTask removes task', () => {
    const store = useTasksStore()
    store.tasks = [{ id: 1, title: 't', completed: false, createdAt: new Date() }]
    store.deleteTask(1)
    expect(store.tasks).toHaveLength(0)
  })

  it('renameTask updates title and notifies', () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.tasks = [{ id: 1, title: 'old', completed: false, createdAt: new Date() }]
    store.renameTask(1, 'new')
    expect(store.tasks[0]!.title).toBe('new')
    expect(spy).toHaveBeenCalledWith('info', 'Task updated')
  })

  it('renameTask trims the title', () => {
    const store = useTasksStore()
    store.tasks = [{ id: 1, title: 'old', completed: false, createdAt: new Date() }]
    store.renameTask(1, '  neat  ')
    expect(store.tasks[0]!.title).toBe('neat')
  })

  it('renameTask is a no-op for unknown id', () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.tasks = [{ id: 1, title: 't', completed: false, createdAt: new Date() }]
    store.renameTask(99, 'x')
    expect(store.tasks[0]!.title).toBe('t')
    expect(spy).not.toHaveBeenCalled()
  })

  it('renameTask is a no-op when title is unchanged', () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.tasks = [{ id: 1, title: 'same', completed: false, createdAt: new Date() }]
    store.renameTask(1, 'same')
    expect(spy).not.toHaveBeenCalled()
  })

  it('renameTask ignores whitespace-only title', () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.tasks = [{ id: 1, title: 'keep', completed: false, createdAt: new Date() }]
    store.renameTask(1, '   ')
    expect(store.tasks[0]!.title).toBe('keep')
    expect(spy).not.toHaveBeenCalled()
  })

  it('clearCompleted does nothing when none completed', () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.tasks = [{ id: 1, title: 't', completed: false, createdAt: new Date() }]
    store.clearCompleted()
    expect(store.tasks).toHaveLength(1)
    expect(spy).not.toHaveBeenCalled()
  })

  it('clearCompleted removes completed tasks and notifies', () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.tasks = [
      { id: 1, title: 'a', completed: true, createdAt: new Date() },
      { id: 2, title: 'b', completed: false, createdAt: new Date() },
    ]
    store.clearCompleted()
    expect(store.tasks).toHaveLength(1)
    expect(spy).toHaveBeenCalledWith('success', '1 completed task cleared.')
  })

  it('clearCompleted pluralises notification for multiple completed', () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.tasks = [
      { id: 1, title: 'a', completed: true, createdAt: new Date() },
      { id: 2, title: 'b', completed: true, createdAt: new Date() },
    ]
    store.clearCompleted()
    expect(spy).toHaveBeenCalledWith('success', '2 completed tasks cleared.')
  })

  it('reorderTasks ignores out-of-range indices', () => {
    const store = useTasksStore()
    store.tasks = [
      { id: 1, title: 'a', completed: false, createdAt: new Date() },
      { id: 2, title: 'b', completed: false, createdAt: new Date() },
    ]
    store.reorderTasks(0, 5)
    expect(store.tasks.map(t => t.id)).toEqual([1, 2])
  })

  it('reorderTasks ignores same index', () => {
    const store = useTasksStore()
    store.tasks = [
      { id: 1, title: 'a', completed: false, createdAt: new Date() },
      { id: 2, title: 'b', completed: false, createdAt: new Date() },
    ]
    store.reorderTasks(1, 1)
    expect(store.tasks.map(t => t.id)).toEqual([1, 2])
  })

  it('reorderTasks moves item to new index', () => {
    const store = useTasksStore()
    store.tasks = [
      { id: 1, title: 'a', completed: false, createdAt: new Date() },
      { id: 2, title: 'b', completed: false, createdAt: new Date() },
      { id: 3, title: 'c', completed: false, createdAt: new Date() },
    ]
    store.reorderTasks(0, 2)
    expect(store.tasks.map(t => t.id)).toEqual([2, 3, 1])
  })

  it('notifies once when all tasks become complete', async () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.tasks = [
      { id: 1, title: 'a', completed: false, createdAt: new Date() },
      { id: 2, title: 'b', completed: false, createdAt: new Date() },
    ]
    store.toggleTask(1)
    store.toggleTask(2)
    await nextTick()
    const allDoneCalls = spy.mock.calls.filter(
      c =>
        c[0] === 'success'
        && c[1] === 'All done!'
        && (c[2] as { confetti?: boolean } | undefined)?.confetti === true,
    )
    expect(allDoneCalls).toHaveLength(1)
  })

  it('does not fire "All done!" when hydrating fully completed tasks from storage', async () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.hydrateFromStorage({
      v: 1,
      tasks: [
        { id: 1, title: 'a', completed: true, createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 2, title: 'b', completed: true, createdAt: '2024-01-01T00:00:00.000Z' },
      ],
    })
    await nextTick()
    const allDoneCalls = spy.mock.calls.filter(
      c => c[0] === 'success' && c[1] === 'All done!',
    )
    expect(allDoneCalls).toHaveLength(0)
  })

  it('does not fire "All done!" when fetchTasks returns all-completed tasks', async () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    vi.stubGlobal(
      '$fetch',
      vi.fn().mockResolvedValue([
        { id: 1, title: 'a', completed: true },
        { id: 2, title: 'b', completed: true },
      ]),
    )
    await store.fetchTasks()
    await nextTick()
    const allDoneCalls = spy.mock.calls.filter(
      c => c[0] === 'success' && c[1] === 'All done!',
    )
    expect(allDoneCalls).toHaveLength(0)
  })

  it('fires "All done!" when deleting the last pending task', async () => {
    const store = useTasksStore()
    const notif = useNotificationStore()
    const spy = vi.spyOn(notif, 'notify')
    store.tasks = [
      { id: 1, title: 'a', completed: true, createdAt: new Date() },
      { id: 2, title: 'b', completed: false, createdAt: new Date() },
    ]
    store.deleteTask(2)
    await nextTick()
    const allDoneCalls = spy.mock.calls.filter(
      c =>
        c[0] === 'success'
        && c[1] === 'All done!'
        && (c[2] as { confetti?: boolean } | undefined)?.confetti === true,
    )
    expect(allDoneCalls).toHaveLength(1)
  })
})
