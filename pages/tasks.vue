<script setup lang="ts">
import TaskInput from '~/components/TaskInput.vue'
import TaskList from '~/components/TaskList.vue'
import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardDescription from '~/components/ui/card/CardDescription.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import Button from '~/components/ui/button/Button.vue'

useHead({ title: 'Tasks — Task Dashboard' })

const {
  tasks,
  completedCount,
  pendingCount,
  addTask,
  toggleTask,
  deleteTask,
} = useTasks()

type TaskFilter = 'all' | 'active' | 'completed'

const taskFilter = ref<TaskFilter>('all')

const displayedTasks = computed(() => {
  if (taskFilter.value === 'active') return tasks.value.filter(t => !t.completed)
  if (taskFilter.value === 'completed') return tasks.value.filter(t => t.completed)
  return tasks.value
})

const taskTotalLabel = computed(() => {
  const total = tasks.value.length
  const shown = displayedTasks.value.length
  if (taskFilter.value !== 'all' && shown !== total)
    return `Showing ${shown} of ${total} task${total === 1 ? '' : 's'}`
  return `${total} task${total === 1 ? '' : 's'} total`
})

// Message shown when the filter returns nothing but tasks do exist
const filteredEmptyMessage = computed<string | undefined>(() => {
  if (displayedTasks.value.length === 0 && tasks.value.length > 0) {
    return taskFilter.value === 'active' ? 'No active tasks' : 'No completed tasks'
  }
  return undefined
})

const FILTERS: { label: string; value: TaskFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Tasks</h1>
        <p class="text-muted-foreground">Manage your task list.</p>
      </div>
      <div class="flex gap-2">
        <Badge variant="success">{{ completedCount }} done</Badge>
        <Badge variant="pending">{{ pendingCount }} pending</Badge>
      </div>
    </div>

    <!-- Add task card -->
    <Card>
      <CardContent class="pt-6">
        <TaskInput @add="addTask" />
      </CardContent>
    </Card>

    <!-- Task list card -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>{{ taskTotalLabel }}</CardDescription>
          </div>

          <!-- All / Active / Completed filter -->
          <div
            role="tablist"
            aria-label="Filter tasks"
            class="flex rounded-lg border p-1 gap-1"
          >
            <Button
              v-for="f in FILTERS"
              :key="f.value"
              role="tab"
              size="sm"
              :variant="taskFilter === f.value ? 'default' : 'ghost'"
              :aria-selected="taskFilter === f.value"
              @click="taskFilter = f.value"
            >
              {{ f.label }}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent class="px-3 pb-3">
        <TaskList
          :tasks="displayedTasks"
          :filtered-empty-message="filteredEmptyMessage"
          @toggle="toggleTask"
          @delete="deleteTask"
        />
      </CardContent>
    </Card>
  </div>
</template>
