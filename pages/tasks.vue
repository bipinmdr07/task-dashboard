<script setup lang="ts">
import { storeToRefs } from 'pinia'
import TaskInput from '~/components/TaskInput.vue'
import TaskList from '~/components/TaskList.vue'
import FilterBar from '~/components/FilterBar.vue'
import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardDescription from '~/components/ui/card/CardDescription.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import Badge from '~/components/ui/badge/Badge.vue'

useHead({ title: 'Tasks — Task Dashboard' })

const taskStore = useTasksStore()
const { completedCount, pendingCount, loading, error } = storeToRefs(taskStore)
const { addTask, toggleTask, deleteTask, renameTask, clearError } = taskStore

const { displayedTasks, taskTotalLabel, filteredEmptyMessage } = useTaskSorting()
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

    <!-- Error banner -->
    <div v-if="error" role="alert"
      class="flex items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <span>{{ error }}</span>
      <button type="button" aria-label="Dismiss error"
        class="shrink-0 rounded p-0.5 transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @click="clearError">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Add task card -->
    <Card>
      <CardContent class="pt-6">
        <TaskInput :disabled="loading" @add="addTask" />
      </CardContent>
    </Card>

    <!-- Task list card -->
    <Card>
      <CardHeader>
        <div class="flex flex-col gap-3">
          <!-- Title + count -->
          <div class="min-w-0">
            <CardTitle>Tasks</CardTitle>
            <CardDescription>{{ taskTotalLabel }}</CardDescription>
          </div>
          <!-- Filter tabs + sort controls -->
          <FilterBar />
        </div>
      </CardHeader>
      <CardContent class="px-3 pb-3">
        <!-- Loading skeleton -->
        <div v-if="loading" class="space-y-1 py-2">
          <div v-for="n in 5" :key="n" class="h-12 animate-pulse rounded-lg bg-muted" />
        </div>

        <TaskList v-else :tasks="displayedTasks" :filtered-empty-message="filteredEmptyMessage" @toggle="toggleTask"
          @rename="renameTask" @delete="deleteTask" />
      </CardContent>
    </Card>
  </div>
</template>
