<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  class?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  id?: string
  modelValue?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

defineEmits<{
  'update:modelValue': [value: string]
  keydown: [event: KeyboardEvent]
}>()
</script>

<template>
  <input
    :id="id"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-describedby="props['aria-describedby']"
    :aria-invalid="props['aria-invalid']"
    :class="cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    @keydown="$emit('keydown', $event)"
  />
</template>
