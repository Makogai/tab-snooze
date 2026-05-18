<script setup lang="ts">
import ThemeSelector from '../components/ThemeSelector.vue';
</script>

<template>
  <div class="view" data-view="settings">
    <p class="panel-title">Settings</p>
    <p class="panel-lead">Appearance and behavior for Tab Snooze.</p>

    <p class="section-label">Appearance</p>
    <section class="settings-panel settings-panel--theme" aria-label="Appearance">
      <div class="theme-setting">
        <span class="theme-setting-text">
          <span class="toggle-label">Theme</span>
          <span class="toggle-hint">Defaults to your system setting</span>
        </span>
        <ThemeSelector />
      </div>
    </section>

    <div class="info-callout">
      <strong>How it works</strong>
      <p>
        Snoozing closes the tab and saves its URL locally. When the time is up, the tab reopens and you get a
        notification.
      </p>
    </div>
  </div>
</template>
