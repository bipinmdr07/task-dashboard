<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { FilterStatus, SortBy } from '~/stores/usePreferencesStore'
import Button from '~/components/ui/button/Button.vue'

const prefsStore = usePreferencesStore()
const taskStore = useTasksStore()

const { sortBy, sortDirection, filterStatus } = storeToRefs(prefsStore)
const { completedCount } = storeToRefs(taskStore)

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Row 1: filter tabs + sort controls -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <!-- All / Active / Completed tabs -->
      <div role="tablist" aria-label="Filter tasks" class="flex shrink-0 rounded-lg border p-1 gap-1">
        <Button v-for="f in FILTERS" :key="f.value" role="tab" size="sm"
          :variant="filterStatus === f.value ? 'default' : 'ghost'" :aria-selected="filterStatus === f.value"
          @click="prefsStore.setFilter(f.value)">
          {{ f.label }}
        </Button>
      </div>

      <!-- Sort controls + clear completed -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-muted-foreground whitespace-nowrap">Sort by</span>
        <select :value="sortBy" aria-label="Sort by"
          class="rounded-md border bg-background px-3 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @change="prefsStore.setSortBy(($event.target as HTMLSelectElement).value as SortBy)">
          <option value="createdAt">Date</option>
          <option value="title">Title</option>
          <option value="completed">Status</option>
        </select>
        <Button size="sm" variant="outline" class="px-3 gap-1.5 whitespace-nowrap"
          :aria-label="`Sort direction: ${sortDirection}`" @click="prefsStore.toggleSortDirection()">
          <span>{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
          <span class="text-muted-foreground">{{ sortDirection === 'asc' ? 'Asc' : 'Desc' }}</span>
        </Button>
        <Button v-if="completedCount > 0" size="sm" variant="ghost"
          class="text-muted-foreground hover:text-destructive whitespace-nowrap" @click="taskStore.clearCompleted()">
          Clear completed
        </Button>
      </div>
    </div>
  </div>
</template>
