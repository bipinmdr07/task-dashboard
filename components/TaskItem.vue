<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import Checkbox from '~/components/ui/checkbox/Checkbox.vue'
import Button from '~/components/ui/button/Button.vue'
import Input from '~/components/ui/input/Input.vue'
import type { Task } from '~/stores/useTasksStore'

interface Props {
  task: Task
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [id: number]
  rename: [id: number, title: string]
  delete: [id: number]
}>()

const editing = ref(false)
const draftTitle = ref('')
const titleInputRef = ref<InstanceType<typeof Input> | null>(null)

watch(
  () => props.task.title,
  title => {
    if (!editing.value) draftTitle.value = title
  },
)

function startEdit() {
  draftTitle.value = props.task.title
  editing.value = true
  nextTick(() => {
    const el = titleInputRef.value?.$el
    if (el instanceof HTMLInputElement) {
      el.focus()
      el.select()
    }
  })
}

function cancelEdit() {
  editing.value = false
  draftTitle.value = props.task.title
}

function commitEdit() {
  if (!editing.value) return
  const trimmed = draftTitle.value.trim()
  editing.value = false
  if (!trimmed || trimmed === props.task.title) return
  emit('rename', props.task.id, trimmed)
}

function onTitleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    commitEdit()
  }
  else if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
  }
}

function onTitleBlur() {
  if (!editing.value) return
  commitEdit()
}
</script>

<template>
  <li class="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50">
    <Checkbox :checked="task.completed"
      :aria-label="`Mark '${task.title}' as ${task.completed ? 'incomplete' : 'complete'}`"
      @update:checked="emit('toggle', task.id)" />
    <Input v-if="editing" ref="titleInputRef" v-model="draftTitle" type="text" class="h-8 flex-1 py-1 text-sm"
      :aria-label="`Edit title: ${task.title}`" @keydown="onTitleKeydown" @blur="onTitleBlur" />
    <span v-else :class="[
      'flex-1 text-sm leading-snug',
      task.completed
        ? 'line-through text-muted-foreground opacity-60'
        : 'text-foreground',
    ]">
      {{ task.title }}
    </span>
    <Button v-if="!task.completed && !editing" variant="ghost" size="icon" :aria-label="`Edit task: ${task.title}`"
      class="h-8 w-8 shrink-0 hover:bg-accent hover:text-accent-foreground" @click="startEdit">
      <Pencil :size="16" />
    </Button>
    <Button v-if="!task.completed" variant="ghost" size="icon" :aria-label="`Delete task: ${task.title}`"
      class="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive" @click="emit('delete', task.id)">
      <Trash2 :size="16" />
    </Button>
  </li>
</template>
