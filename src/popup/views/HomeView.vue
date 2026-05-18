<script setup lang="ts">
import { computed } from 'vue';
import { useSnooze, type SnoozePreset } from '../composables/useSnooze';

const { PRESETS, activeTab, error, snoozeActive } = useSnooze();

const tabTitle = computed(() => activeTab.value?.title || 'No active tab');
const tabUrl = computed(() => activeTab.value?.url || '');
const canSnooze = computed(() => {
  const url = tabUrl.value;
  return url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://');
});

function onPreset(preset: SnoozePreset) {
  void snoozeActive(preset);
}
</script>

<template>
  <div class="view" data-view="home">
    <p class="section-label">Current tab</p>
    <div class="tab-preview">
      <img
        v-if="activeTab?.favIconUrl"
        class="tab-preview-favicon"
        :src="activeTab.favIconUrl"
        width="20"
        height="20"
        alt=""
      />
      <span v-else class="tab-preview-favicon tab-preview-favicon--placeholder" aria-hidden="true" />
      <div class="tab-preview-text">
        <p class="tab-preview-title">{{ tabTitle }}</p>
        <p v-if="tabUrl" class="tab-preview-url">{{ tabUrl }}</p>
      </div>
    </div>

    <p v-if="!canSnooze" class="panel-muted">This page cannot be snoozed.</p>

    <template v-else>
      <p class="section-label section-label--spaced">Snooze until</p>
      <div class="preset-grid">
        <button
          v-for="p in PRESETS"
          :key="p.id"
          type="button"
          class="btn btn-ghost preset-btn"
          @click="onPreset(p.id)"
        >
          {{ p.label }}
        </button>
      </div>
      <p class="panel-muted preset-hint">The tab closes now and reopens automatically.</p>
    </template>

    <p v-if="error" class="status-error" role="alert">{{ error }}</p>
  </div>
</template>
