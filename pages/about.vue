<script setup lang="ts">
import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardDescription from '~/components/ui/card/CardDescription.vue'
import CardContent from '~/components/ui/card/CardContent.vue'

useHead({ title: 'About — Task Dashboard' })

const techStack = [
  { name: 'Nuxt 3', description: 'Full-stack Vue framework with file-based routing and SSR' },
  { name: 'Vue 3', description: 'Composition API with <script setup> and reactive state' },
  { name: 'TypeScript', description: 'Strict typing throughout composables and components' },
  { name: 'Tailwind CSS', description: 'Utility-first CSS with a cohesive design token system' },
  { name: 'shadcn-vue', description: 'Accessible, customisable UI primitives (Vue port)' },
  { name: 'JSONPlaceholder', description: 'Public REST API used to seed the initial task list' },
]
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8">
    <!-- Hero -->
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">About Task Dashboard</h1>
      <p class="text-muted-foreground leading-relaxed">
        A focused personal task manager built to demonstrate core Nuxt 3 concepts — file-based routing, reactive composables, component-driven UI, and external API integration — all within a polished, accessible interface.
      </p>
    </div>

    <!-- Features card -->
    <Card>
      <CardHeader>
        <CardTitle>What it does</CardTitle>
        <CardDescription>A quick tour of the core features</CardDescription>
      </CardHeader>
      <CardContent>
        <ul class="space-y-2 text-sm text-foreground">
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-primary">✓</span>
            <span>Add, complete, and delete tasks with live reactive updates across all pages</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-primary">✓</span>
            <span>Dashboard overview with completion counts and a visual progress bar</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-primary">✓</span>
            <span>Tasks seeded from JSONPlaceholder on first load, with graceful error handling</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-primary">✓</span>
            <span>Animated task list with enter/leave transitions for a polished feel</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-primary">✓</span>
            <span>Fully keyboard-navigable and accessible (labels, aria-current, roles)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-primary">✓</span>
            <span>Responsive layout — works great on both desktop and mobile</span>
          </li>
        </ul>
      </CardContent>
    </Card>

    <!-- Tech stack card -->
    <Card>
      <CardHeader>
        <CardTitle>Tech Stack</CardTitle>
        <CardDescription>Built with modern tooling</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="tech in techStack"
            :key="tech.name"
            class="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0"
          >
            <span class="text-sm font-semibold text-foreground">{{ tech.name }}</span>
            <span class="text-sm text-muted-foreground">{{ tech.description }}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
