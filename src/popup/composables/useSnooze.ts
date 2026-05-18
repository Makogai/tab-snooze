import { onMounted, onUnmounted, ref } from 'vue';

export type SnoozePreset = '15m' | '1h' | '3h' | 'evening' | 'tomorrow';

function computeWakeTime(preset: SnoozePreset): number {
  const now = Date.now();
  switch (preset) {
    case '15m':
      return now + 15 * 60 * 1000;
    case '1h':
      return now + 60 * 60 * 1000;
    case '3h':
      return now + 3 * 60 * 60 * 1000;
    case 'evening': {
      const d = new Date();
      d.setHours(18, 0, 0, 0);
      if (d.getTime() <= now) d.setDate(d.getDate() + 1);
      return d.getTime();
    }
    case 'tomorrow': {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d.getTime();
    }
  }
}

function formatWakeLabel(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today ${time}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();
  if (isTomorrow) return `Tomorrow ${time}`;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatRelative(ms: number): string {
  const diff = ms - Date.now();
  if (diff < 0) return 'now';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `in ${hours}h`;
  const days = Math.round(hours / 24);
  return `in ${days}d`;
}

export interface SnoozedTab {
  id: string;
  url: string;
  title: string;
  favIconUrl?: string;
  snoozeUntil: number;
  createdAt: number;
}

const PRESETS: { id: SnoozePreset; label: string }[] = [
  { id: '15m', label: '15 minutes' },
  { id: '1h', label: '1 hour' },
  { id: '3h', label: '3 hours' },
  { id: 'evening', label: 'This evening' },
  { id: 'tomorrow', label: 'Tomorrow 9:00' }
];

function sendMessage<T>(msg: object): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response?.ok) {
        reject(new Error(response?.error || 'Request failed'));
        return;
      }
      resolve(response as T);
    });
  });
}

export function useSnooze() {
  const snoozed = ref<SnoozedTab[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const activeTab = ref<chrome.tabs.Tab | null>(null);

  let tickTimer: ReturnType<typeof setInterval> | null = null;
  const now = ref(Date.now());

  async function refreshActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab.value = tab ?? null;
  }

  async function loadSnoozed() {
    loading.value = true;
    error.value = null;
    try {
      const res = await sendMessage<{ tabs: SnoozedTab[] }>({ type: 'LIST_SNOOZED' });
      snoozed.value = res.tabs.sort((a, b) => a.snoozeUntil - b.snoozeUntil);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Could not load snoozed tabs';
    } finally {
      loading.value = false;
    }
  }

  async function snoozeActive(preset: SnoozePreset) {
    error.value = null;
    const wakeAt = computeWakeTime(preset);
    try {
      await sendMessage({ type: 'SNOOZE_ACTIVE', wakeAt });
      window.close();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Could not snooze tab';
    }
  }

  async function wakeNow(id: string) {
    error.value = null;
    try {
      await sendMessage({ type: 'WAKE_NOW', id });
      await loadSnoozed();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Could not wake tab';
    }
  }

  async function cancel(id: string) {
    error.value = null;
    try {
      await sendMessage({ type: 'CANCEL_SNOOZE', id });
      await loadSnoozed();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Could not cancel';
    }
  }

  function wakeLabel(until: number) {
    return formatWakeLabel(until);
  }

  function relative(until: number) {
    return formatRelative(until);
  }

  onMounted(() => {
    void refreshActiveTab();
    void loadSnoozed();
    tickTimer = setInterval(() => {
      now.value = Date.now();
    }, 30_000);
  });

  onUnmounted(() => {
    if (tickTimer) clearInterval(tickTimer);
  });

  return {
    PRESETS,
    snoozed,
    loading,
    error,
    activeTab,
    now,
    loadSnoozed,
    snoozeActive,
    wakeNow,
    cancel,
    wakeLabel,
    relative
  };
}
