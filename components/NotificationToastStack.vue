<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConfettiOnLastNotification } from '~/composables/useConfettiOnLastNotification'
import { useNotificationStore, type Notification } from '~/stores/useNotificationStore'

type NotifType = Notification['type']

const store = useNotificationStore()
const { notifications } = storeToRefs(store)

useConfettiOnLastNotification(notifications)

// Per-type visual treatment using the project's CSS custom-property tokens
// Warning uses Tailwind's amber since the design system has no --warning token
const typeClasses: Record<NotifType, { border: string; icon: string; label: string }> = {
  success: { border: 'border-[hsl(var(--success))]', icon: 'text-[hsl(var(--success))]', label: 'Success' },
  error: { border: 'border-destructive', icon: 'text-destructive', label: 'Error' },
  info: { border: 'border-primary', icon: 'text-primary', label: 'Info' },
  warning: { border: 'border-amber-500', icon: 'text-amber-500', label: 'Warning' },
}

// Minimal SVG paths keyed by notification type
const iconPaths: Record<NotifType, string> = {
  success: 'M5 13l4 4L19 7',
  error: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
}
</script>

<template>
  <!-- Single polite live region wraps the whole stack -->
  <div aria-live="polite" aria-label="Notifications"
    class="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col-reverse items-center gap-2">
    <TransitionGroup enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-150 ease-in" leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0" move-class="transition-all duration-200">
      <output v-for="n in notifications" :key="n.id"
        class="pointer-events-auto flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg"
        :class="typeClasses[n.type].border">
        <!-- Type indicator icon -->
        <svg class="h-4 w-4 shrink-0" :class="typeClasses[n.type].icon" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          :aria-label="typeClasses[n.type].label">
          <path :d="iconPaths[n.type]" />
        </svg>

        <span class="text-sm text-foreground">{{ n.message }}</span>

        <!-- Dismiss button shown only when the notification allows it -->
        <button v-if="n.dismissible" type="button" aria-label="Dismiss"
          class="ml-1 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="store.dismiss(n.id)">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </output>
    </TransitionGroup>
  </div>
</template>
