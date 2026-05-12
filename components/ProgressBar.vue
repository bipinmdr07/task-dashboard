<script setup lang="ts">
import Progress from '~/components/ui/progress/Progress.vue'

interface Props {
  value: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Completion progress',
})
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between text-sm">
      <span class="font-medium text-foreground">{{ label }}</span>
      <span class="tabular-nums font-semibold text-primary">{{ value }}%</span>
    </div>
    <Progress
      :model-value="value"
      :aria-label="label"
      class="h-3"
    />
    <p class="text-xs text-muted-foreground">
      {{ value === 100 ? 'All tasks complete — great work!' : value === 0 ? 'No tasks completed yet' : `${value}% of tasks completed` }}
    </p>
  </div>
</template>
