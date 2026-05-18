<script setup lang="ts">
import { useSnooze } from '../composables/useSnooze';

const { snoozed, loading, error, wakeLabel, relative, wakeNow, cancel, loadSnoozed } = useSnooze();
</script>

<template>
  <div class="view" data-view="snoozed">
    <p class="panel-title">Snoozed tabs</p>
    <p class="panel-lead">Wake early or cancel — nothing is stored in the cloud.</p>

    <p v-if="loading" class="panel-muted">Loading…</p>
    <p v-else-if="error" class="status-error" role="alert">{{ error }}</p>
    <p v-else-if="snoozed.length === 0" class="panel-muted">No snoozed tabs. Snooze one from the Snooze tab.</p>

    <ul v-else class="snooze-list">
      <li v-for="item in snoozed" :key="item.id" class="snooze-item">
        <img
          v-if="item.favIconUrl"
          class="snooze-item-favicon"
          :src="item.favIconUrl"
          width="18"
          height="18"
          alt=""
        />
        <span v-else class="snooze-item-favicon snooze-item-favicon--placeholder" aria-hidden="true" />
        <div class="snooze-item-body">
          <p class="snooze-item-title">{{ item.title }}</p>
          <p class="snooze-item-meta">{{ wakeLabel(item.snoozeUntil) }} · {{ relative(item.snoozeUntil) }}</p>
        </div>
        <div class="snooze-item-actions">
          <button type="button" class="btn btn-ghost btn-ghost--sm" @click="wakeNow(item.id)">Wake</button>
          <button type="button" class="btn btn-ghost btn-ghost--sm" @click="cancel(item.id)">Cancel</button>
        </div>
      </li>
    </ul>

    <button v-if="snoozed.length" type="button" class="btn-link" @click="loadSnoozed()">Refresh</button>
  </div>
</template>
