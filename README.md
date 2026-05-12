# Task Dashboard

A lightweight personal task manager built with Nuxt 3, Vue 3, and Tailwind CSS. Tasks live entirely in your browser — no backend, no account required.

## Features

- **Add, complete, and delete tasks** from a clean card-based UI
- **Filter view** between All / Active / Completed tasks
- **Dashboard overview** with live completion stats and a progress bar
- **Dark mode toggle** in the header — respects your system preference on first visit and remembers your choice across reloads via a cookie
- **Local persistence** — tasks are saved to `localStorage` and restored instantly on page load, with a versioned schema so corrupt data never wipes your list

## Tech Stack

| Layer | Library |
|---|---|
| Framework | [Nuxt 3](https://nuxt.com) |
| UI | [Vue 3](https://vuejs.org) (Composition API, `<script setup>`) |
| Styling | [Tailwind CSS](https://tailwindcss.com) with CSS custom properties for theming |
| Dark mode | [@nuxtjs/color-mode](https://color-mode.nuxtjs.org) |
| Icons | [lucide-vue-next](https://lucide.dev) |
| Primitives | [Radix Vue](https://www.radix-vue.com) |
| Animations | [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) |

## Project Structure

```
├── assets/css/main.css        # Global CSS — Tailwind base + light/dark theme tokens
├── components/
│   ├── AppHeader.vue          # Sticky header with nav links and dark mode toggle
│   ├── TaskInput.vue          # Add-task form
│   ├── TaskItem.vue           # Single task row (checkbox, label, delete)
│   ├── TaskList.vue           # Animated task list with empty state
│   ├── SummaryCard.vue        # Stat card used on the dashboard
│   ├── ProgressBar.vue        # Completion progress bar
│   └── ui/                    # Low-level primitives (Button, Badge, Card, …)
├── composables/
│   └── useTasks.ts            # Reactive task state, counts, and CRUD operations
├── layouts/
│   └── default.vue            # Page shell wrapping AppHeader + <slot />
├── pages/
│   ├── index.vue              # Dashboard — summary cards, progress, recent tasks
│   ├── tasks.vue              # Full task list with filters
│   └── about.vue              # About page
├── plugins/
│   └── task-persistence.client.ts  # Hydrates tasks from localStorage on startup; watches for changes to persist them
└── nuxt.config.ts
```

## Getting Started

**Prerequisites:** Node.js ≥ 18, pnpm

```bash
# Install dependencies
pnpm install

# Start the dev server at http://localhost:3000
pnpm dev

# Type-check
pnpm typecheck

# Production build
pnpm build
pnpm preview
```

## How Theming Works

All colours are defined as HSL CSS custom properties in `assets/css/main.css`. Tailwind's semantic colour aliases (`bg-background`, `text-foreground`, `bg-card`, etc.) point at these variables, so swapping the theme is a single class change on `<html>`.

`@nuxtjs/color-mode` handles that class toggle:

- On first visit it reads the OS preference (`prefers-color-scheme`).
- Clicking the Sun / Moon button in the header flips between `light` and `dark` and writes the preference to a cookie.
- The module injects an inline script before paint, so there is no flash of the wrong theme on hard reload.

## How Task Persistence Works

`useTasks` holds a module-level reactive singleton so state survives client-side navigation without re-fetching. The client-only plugin (`task-persistence.client.ts`) runs once on startup:

1. Reads `task-dashboard:tasks` from `localStorage` and calls `hydrateTasksFromStorage` to populate the singleton before any component renders.
2. Starts a deep `watch` on the task list and writes a versioned JSON snapshot on every mutation.

The payload is versioned (`{ v: 1, tasks: [...] }`), so future schema changes can migrate data gracefully.
