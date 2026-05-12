<script setup lang="ts">
import TaskInput from '~/components/TaskInput.vue'
import TaskList from '~/components/TaskList.vue'
import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardDescription from '~/components/ui/card/CardDescription.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import Alert from '~/components/ui/alert/Alert.vue'
import AlertTitle from '~/components/ui/alert/AlertTitle.vue'
import AlertDescription from '~/components/ui/alert/AlertDescription.vue'
import Button from '~/components/ui/button/Button.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import { AlertCircle } from 'lucide-vue-next'

useHead({ title: 'Tasks — Task Dashboard' })

const {
  tasks,
  completedCount,
  pendingCount,
  apiError,
  seeded,
  addTask,
  toggleTask,
  deleteTask,
  dismissError,
  mergeSeedTasks,
  setApiError,
} = useTasks()

const taskTotalLabel = computed(() =>
  `${tasks.value.length} task${tasks.value.length === 1 ? '' : 's'} total`,
)

interface JsonPlaceholderTodo {
  id: number
  title: string
  completed: boolean
  userId: number
}

onMounted(async () => {
  if (seeded.value) return
  try {
    const data = await $fetch<JsonPlaceholderTodo[]>(
      'https://jsonplaceholder.typicode.com/todos?_limit=5',
    )
    mergeSeedTasks(data)
  } catch {
    setApiError('Could not load initial tasks from the server. You can still add tasks manually.')
  }
})
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

    <!-- API error banner -->
    <Alert v-if="apiError" variant="warning">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Couldn't load seed tasks</AlertTitle>
      <AlertDescription class="mt-1 flex items-center justify-between gap-4">
        <span>{{ apiError }}</span>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Dismiss error"
          class="shrink-0"
          @click="dismissError"
        >
          Dismiss
        </Button>
      </AlertDescription>
    </Alert>

    <!-- Add task card -->
    <Card>
      <CardContent class="pt-6">
        <TaskInput @add="addTask" />
      </CardContent>
    </Card>

    <!-- Task list card -->
    <Card>
      <CardHeader>
        <CardTitle>All Tasks</CardTitle>
        <CardDescription>{{ taskTotalLabel }}</CardDescription>
      </CardHeader>
      <CardContent class="px-3 pb-3">
        <TaskList
          :tasks="tasks"
          @toggle="toggleTask"
          @delete="deleteTask"
        />
      </CardContent>
    </Card>
  </div>
</template>
