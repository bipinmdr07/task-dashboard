<script setup lang="ts">
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        warning:
          'border-yellow-500/50 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type AlertVariants = VariantProps<typeof alertVariants>

interface Props {
  variant?: AlertVariants['variant']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <div
    role="alert"
    :class="cn(alertVariants({ variant }), props.class)"
  >
    <slot />
  </div>
</template>
