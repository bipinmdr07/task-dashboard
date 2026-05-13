<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import NotificationToastStack from '~/components/NotificationToastStack.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <main class="container mx-auto px-4 sm:px-6 py-8 transition-all duration-200">
      <slot />
    </main>

    <NotificationToastStack />
  </div>
</template>
