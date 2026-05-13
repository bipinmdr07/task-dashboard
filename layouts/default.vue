<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AppHeader from '~/components/AppHeader.vue'
import NotificationToastStack from '~/components/NotificationToastStack.vue'

const { sidebarCollapsed } = storeToRefs(usePreferencesStore())
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <main class="container mx-auto px-4 sm:px-6 py-8 transition-all duration-200"
      :class="sidebarCollapsed ? 'max-w-full' : ''">
      <slot />
    </main>

    <NotificationToastStack />
  </div>
</template>
