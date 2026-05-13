<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import NotificationToastStack from '~/components/NotificationToastStack.vue'
import Button from '~/components/ui/button/Button.vue'
import { useNotificationStore } from '~/stores/useNotificationStore'

const err = useError()

const is404 = computed(() => err.value?.statusCode === 404)

const headline = computed(() =>
  is404.value ? 'Page not found' : 'Something went wrong',
)

/** Safe line for the page body — never dump stack traces in production. */
const detail = computed(() => {
  const e = err.value
  if (!e) return ''
  const raw = e.statusMessage || e.message
  if (typeof raw !== 'string' || !raw.trim()) return ''
  if (import.meta.dev) return raw
  return raw.length > 120 ? `${raw.slice(0, 117)}…` : raw
})

onMounted(() => {
  const e = err.value
  if (!e) return
  try {
    const toastMsg = is404.value
      ? 'That page could not be found.'
      : 'Something went wrong. Please try again.'
    useNotificationStore().notify('error', toastMsg)
  } catch (e: unknown) {
    // If Pinia isn't available here we still want the page itself to render
    console.warn('[error.vue] Could not show error toast', e)
  }
})

async function goHome() {
  await clearError({ redirect: '/' })
}

async function goTasks() {
  await clearError({ redirect: '/tasks' })
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <main class="container mx-auto px-4 py-8 sm:px-6">
      <div class="mx-auto max-w-lg">
        <!-- 404: same rhythm as list/dashboard empty states (big icon, then title, then hint) -->
        <div v-if="is404" class="flex flex-col items-center justify-center py-12 text-center">
          <div class="mb-3 text-4xl" aria-hidden="true">
            🔍
          </div>
          <p class="text-sm font-medium text-muted-foreground">
            404
          </p>
          <p class="mt-1 font-medium text-foreground">
            {{ headline }}
          </p>
          <p v-if="detail" class="mt-1 text-sm text-muted-foreground">
            {{ detail }}
          </p>
          <p v-else class="mt-1 text-sm text-muted-foreground">
            The link may be broken or the page was removed.
          </p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" @click="goHome">
              Back to home
            </Button>
            <Button type="button" variant="outline" @click="goTasks">
              Go to tasks
            </Button>
          </div>
        </div>

        <!-- Other errors: same empty-state pattern with a different icon -->
        <div v-else class="flex flex-col items-center justify-center py-12 text-center">
          <div class="mb-3 text-4xl" aria-hidden="true">
            ⚠️
          </div>
          <p class="text-sm font-medium text-muted-foreground">
            {{ err?.statusCode ? `Error ${err.statusCode}` : 'Error' }}
          </p>
          <p class="mt-1 font-medium text-foreground">
            {{ headline }}
          </p>
          <p v-if="detail" class="mt-1 text-sm text-muted-foreground">
            {{ detail }}
          </p>
          <p v-else class="mt-1 text-sm text-muted-foreground">
            Please try again, or head back to the dashboard.
          </p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" @click="goHome">
              Back to home
            </Button>
            <Button type="button" variant="outline" @click="goTasks">
              Go to tasks
            </Button>
          </div>
        </div>
      </div>
    </main>

    <NotificationToastStack />
  </div>
</template>
