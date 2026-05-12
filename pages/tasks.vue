<script setup lang="ts">
import TaskInput from '~/components/TaskInput.vue'
import TaskList from '~/components/TaskList.vue'
import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardDescription from '~/components/ui/card/CardDescription.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import Badge from '~/components/ui/badge/Badge.vue'

useHead({ title: 'Tasks — Task Dashboard' })

const {
  tasks,
  completedCount,
  pendingCount,
  addTask,
  toggleTask,
  deleteTask,
} = useTasks()

const taskTotalLabel = computed(() =>
  `${tasks.value.length} task${tasks.value.length === 1 ? '' : 's'} total`,
)
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
