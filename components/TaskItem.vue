<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import Checkbox from '~/components/ui/checkbox/Checkbox.vue'
import Button from '~/components/ui/button/Button.vue'
import type { Task } from '~/stores/useTasksStore'

interface Props {
  task: Task
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [id: number]
  delete: [id: number]
}>()
</script>

<template>
  <li class="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50">
    <Checkbox :checked="task.completed"
      :aria-label="`Mark '${task.title}' as ${task.completed ? 'incomplete' : 'complete'}`"
      @update:checked="emit('toggle', task.id)" />
    <span :class="[
      'flex-1 text-sm leading-snug',
      task.completed
        ? 'line-through text-muted-foreground opacity-60'
        : 'text-foreground',
    ]">
      {{ task.title }}
    </span>
    <Button variant="ghost" size="icon" :aria-label="`Delete task: ${task.title}`"
      class="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100"
      @click="emit('delete', task.id)">
      <Trash2 class="h-4 w-4" />
    </Button>
  </li>
</template>
