<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  modelValue?: number
  class?: string
  'aria-label'?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
})

const clampedValue = computed(() => Math.min(100, Math.max(0, props.modelValue ?? 0)))
</script>

<template>
  <div
    :aria-label="props['aria-label'] ?? 'Progress'"
    :aria-valuenow="clampedValue"
    aria-valuemin="0"
    aria-valuemax="100"
    role="progressbar"
    :class="cn(
      'relative h-3 w-full overflow-hidden rounded-full bg-secondary',
      props.class,
    )"
  >
    <div
      class="h-full bg-primary transition-all duration-500 ease-out rounded-full"
      :style="{ width: `${clampedValue}%` }"
    />
  </div>
</template>
