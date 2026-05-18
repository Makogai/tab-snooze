<script setup lang="ts">
import { useNavigation, type ViewId } from '../composables/useNavigation';

const { currentView, setView } = useNavigation();

const items: { id: ViewId; label: string }[] = [
  { id: 'home', label: 'Snooze' },
  { id: 'snoozed', label: 'List' },
  { id: 'settings', label: 'Settings' },
  { id: 'info', label: 'Info' }
];

function onNav(view: ViewId) {
  setView(view);
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Main">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="nav-btn"
      :class="{ 'is-active': currentView === item.id }"
      :aria-current="currentView === item.id ? 'page' : undefined"
      @click="onNav(item.id)"
    >
      <svg v-if="item.id === 'home'" class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3v4M12 17v4M7 8l3 3M14 13l3 3M17 8l-3 3M10 13l-3 3"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
        <circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.75" />
      </svg>
      <svg v-else-if="item.id === 'snoozed'" class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
      <svg v-else-if="item.id === 'settings'" class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.75" />
      </svg>
      <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75" />
        <path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      </svg>
      {{ item.label }}
    </button>
  </nav>
</template>
