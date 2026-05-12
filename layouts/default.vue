<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <main class="container mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>
  </div>
</template>
