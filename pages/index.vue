<script setup lang="ts">
import SummaryCard from '~/components/SummaryCard.vue'
import ProgressBar from '~/components/ProgressBar.vue'
import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardDescription from '~/components/ui/card/CardDescription.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import Badge from '~/components/ui/badge/Badge.vue'

useHead({ title: 'Dashboard — Task Dashboard' })

const { tasks, completedCount, pendingCount, completionPercent } = useTasks()

const recentTasks = computed(() => tasks.value.slice(0, 5))
</script>

<template>
  <div class="space-y-8">
    <!-- Page header -->
    <div class="space-y-1">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      <p class="text-muted-foreground">Your task overview at a glance.</p>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard
        title="Total Tasks"
        :value="tasks.length"
        description="All tasks in your list"
        variant="default"
        icon="📋"
      />
      <SummaryCard
        title="Completed"
        :value="completedCount"
        description="Tasks marked as done"
        variant="success"
        icon="✅"
      />
      <SummaryCard
        title="Pending"
        :value="pendingCount"
        description="Still to be completed"
        variant="pending"
        icon="⏳"
      />
    </div>

    <!-- Progress card -->
    <Card>
      <CardHeader>
        <CardTitle>Overall Progress</CardTitle>
        <CardDescription>
          {{ completedCount }} of {{ tasks.length }} tasks complete
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProgressBar
          :value="completionPercent"
          label="Completion progress"
        />
      </CardContent>
    </Card>

    <!-- Recent tasks -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription class="mt-1">Your five most recent items</CardDescription>
          </div>
          <NuxtLink
            to="/tasks"
            class="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            View all →
          </NuxtLink>
        </div>
      </CardHeader>
      <CardContent>
        <!-- Empty state -->
        <div
          v-if="tasks.length === 0"
          class="flex flex-col items-center justify-center py-10 text-center"
        >
          <div class="mb-3 text-4xl">📭</div>
          <p class="font-medium text-foreground">No tasks yet</p>
          <p class="mt-1 text-sm text-muted-foreground">
            Head over to the
            <NuxtLink to="/tasks" class="text-primary hover:underline underline-offset-4">Tasks page</NuxtLink>
            to add your first task.
          </p>
        </div>

        <!-- Task preview list -->
        <ul v-else class="divide-y divide-border">
          <li
            v-for="task in recentTasks"
            :key="task.id"
            class="flex items-center justify-between gap-3 py-3"
          >
            <span
              :class="[
                'flex-1 truncate text-sm',
                task.completed
                  ? 'line-through text-muted-foreground opacity-60'
                  : 'text-foreground',
              ]"
            >
              {{ task.title }}
            </span>
            <Badge :variant="task.completed ? 'success' : 'pending'">
              {{ task.completed ? 'Done' : 'Pending' }}
            </Badge>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
