<script setup lang="ts">
import TaskItem from '~/components/TaskItem.vue'
import type { Task } from '~/composables/useTasks'

interface Props {
  tasks: Task[]
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: [id: number]
  delete: [id: number]
}>()
</script>

<template>
  <div>
    <!-- Empty state -->
    <div
      v-if="tasks.length === 0"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <div class="mb-3 text-4xl">✨</div>
      <p class="font-medium text-foreground">No tasks yet — add one above!</p>
      <p class="mt-1 text-sm text-muted-foreground">Your completed tasks will also appear here.</p>
    </div>

    <!-- Task list with transitions -->
    <TransitionGroup
      v-else
      name="task"
      tag="ul"
      class="relative space-y-0.5"
    >
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="emit('toggle', $event)"
        @delete="emit('delete', $event)"
      />
    </TransitionGroup>
  </div>
</template>
