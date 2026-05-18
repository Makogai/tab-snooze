<script setup lang="ts">
import { provideNavigation } from './composables/useNavigation';
import { provideTheme } from './composables/useTheme';
import BottomNav from './components/BottomNav.vue';
import HomeView from './views/HomeView.vue';
import SnoozedView from './views/SnoozedView.vue';
import SettingsView from './views/SettingsView.vue';
import InfoView from './views/InfoView.vue';

const { currentView } = provideNavigation();
provideTheme();

const logoUrl = chrome.runtime.getURL('assets/images/logo512.png');
</script>

<template>
  <div class="app">
    <header class="header">
      <img class="logo" :src="logoUrl" width="40" height="40" alt="Tab Snooze" />
      <div>
        <h1 class="brand-title">Tab Snooze</h1>
        <p class="brand-tagline">Close now, reopen later</p>
      </div>
    </header>

    <main class="card card-body">
      <HomeView v-show="currentView === 'home'" />
      <SnoozedView v-show="currentView === 'snoozed'" />
      <SettingsView v-show="currentView === 'settings'" />
      <InfoView v-show="currentView === 'info'" />
    </main>

    <BottomNav />
  </div>
</template>
