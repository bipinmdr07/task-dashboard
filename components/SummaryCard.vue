<script setup lang="ts">
import Card from '~/components/ui/card/Card.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import { cn } from '~/lib/utils'

interface Props {
  title: string
  value: number
  description?: string
  variant?: 'default' | 'success' | 'pending'
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const iconBgClass = computed(() => {
  if (props.variant === 'success') return 'bg-success/10 text-success'
  if (props.variant === 'pending') return 'bg-muted text-muted-foreground'
  return 'bg-primary/10 text-primary'
})

const valueClass = computed(() => {
  if (props.variant === 'success') return 'text-success'
  if (props.variant === 'pending') return 'text-muted-foreground'
  return 'text-foreground'
})
</script>

<template>
  <Card class="overflow-hidden transition-shadow hover:shadow-md">
    <CardContent class="p-6">
      <div class="flex items-start justify-between">
        <div class="space-y-1">
          <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
          <p :class="cn('text-3xl font-bold tabular-nums', valueClass)">{{ value }}</p>
          <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
        </div>
        <div
          v-if="icon"
          :class="cn('flex h-10 w-10 items-center justify-center rounded-lg text-lg', iconBgClass)"
        >
          {{ icon }}
        </div>
      </div>
    </CardContent>
  </Card>
</template>
