<script setup lang="ts">
import { ref } from 'vue'
import Button from '~/components/ui/button/Button.vue'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), { disabled: false })

const emit = defineEmits<{
  add: [title: string]
}>()

const inputValue = ref('')
const errorMessage = ref('')

function submit() {
  if (props.disabled) return
  const trimmed = inputValue.value.trim()
  if (!trimmed) {
    errorMessage.value = 'Task title cannot be empty.'
    return
  }
  errorMessage.value = ''
  emit('add', trimmed)
  inputValue.value = ''
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') submit()
}

function onInput() {
  if (errorMessage.value) errorMessage.value = ''
}
</script>

<template>
  <div class="space-y-2">
    <Label for="new-task-input" class="text-sm font-medium">New task</Label>
    <div class="flex gap-2">
      <div class="flex-1">
        <Input id="new-task-input" v-model="inputValue" type="text" placeholder="What needs to be done?"
          aria-describedby="new-task-error" :disabled="disabled" :aria-invalid="!!errorMessage || undefined"
          @keydown="onKeydown" @input="onInput" />
        <p v-if="errorMessage" id="new-task-error" class="mt-1.5 text-xs text-destructive" aria-live="polite">
          {{ errorMessage }}
        </p>
      </div>
      <Button type="button" variant="default" :disabled="disabled" @click="submit">
        Add
      </Button>
    </div>
  </div>
</template>
