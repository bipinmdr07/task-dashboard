<script setup lang="ts">
import { cn } from '~/lib/utils'
import { Check } from 'lucide-vue-next'

interface Props {
  checked?: boolean
  disabled?: boolean
  id?: string
  class?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

const props = withDefaults(defineProps<Props>(), {
  checked: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()

function toggle() {
  if (!props.disabled) {
    emit('update:checked', !props.checked)
  }
}
</script>

<template>
  <button
    :id="id"
    role="checkbox"
    :aria-checked="checked"
    :aria-label="props['aria-label']"
    :aria-labelledby="props['aria-labelledby']"
    :disabled="disabled"
    type="button"
    :class="cn(
      'peer h-5 w-5 shrink-0 rounded-sm border border-primary ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-colors',
      checked
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-background',
      props.class,
    )"
    @click="toggle"
  >
    <span class="flex items-center justify-center">
      <Check v-if="checked" class="h-3 w-3 text-white" stroke-width="3" />
    </span>
  </button>
</template>
