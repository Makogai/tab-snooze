import { alarmNameForId, getSnoozedTabs, saveSnoozedTabs } from './core/snooze.js';

/** @param {chrome.tabs.Tab} tab */
function assertSnoozable(tab) {
  const url = tab.url || '';
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://')) {
    throw new Error('This page cannot be snoozed');
  }
}

async function updateBadge() {
  const tabs = await getSnoozedTabs();
  const count = tabs.length;
  await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
  await chrome.action.setBadgeBackgroundColor({ color: '#347cfc' });
}

/** @param {string} id */
async function cancelSnooze(id) {
  await chrome.alarms.clear(alarmNameForId(id));
  const tabs = (await getSnoozedTabs()).filter((t) => t.id !== id);
  await saveSnoozedTabs(tabs);
  await updateBadge();
}

/** @param {string} id */
async function wakeSnooze(id, { notify = true } = {}) {
  const tabs = await getSnoozedTabs();
  const item = tabs.find((t) => t.id === id);
  if (!item) return null;

  await chrome.tabs.create({ url: item.url, active: true });
  await cancelSnooze(id);

  if (notify) {
    try {
      await chrome.notifications.create(`wake-${id}`, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icons/icon128.png'),
        title: 'Tab Snooze',
        message: `Reopened: ${item.title}`
      });
    } catch {
      /* notifications optional */
    }
  }

  return item;
}

/** @param {number} tabId @param {number} wakeAt */
async function snoozeTab(tabId, wakeAt) {
  const tab = await chrome.tabs.get(tabId);
  assertSnoozable(tab);

  const id = crypto.randomUUID();
  /** @type {import('./core/snooze.js').SnoozedTab} */
  const item = {
    id,
    url: tab.url,
    title: tab.title || tab.url,
    favIconUrl: tab.favIconUrl,
    snoozeUntil: wakeAt,
    createdAt: Date.now()
  };

  const tabs = await getSnoozedTabs();
  tabs.push(item);
  await saveSnoozedTabs(tabs);
  await chrome.alarms.create(alarmNameForId(id), { when: wakeAt });
  await chrome.tabs.remove(tabId);
  await updateBadge();
  return item;
}

async function reconcileAlarms() {
  const tabs = await getSnoozedTabs();
  const now = Date.now();
  for (const item of [...tabs]) {
    if (item.snoozeUntil <= now) {
      await wakeSnooze(item.id, { notify: true });
    } else {
      await chrome.alarms.create(alarmNameForId(item.id), { when: item.snoozeUntil });
    }
  }
  await updateBadge();
}

chrome.runtime.onInstalled.addListener(() => {
  void reconcileAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  void reconcileAlarms();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith('tab-snooze-')) return;
  const id = alarm.name.slice('tab-snooze-'.length);
  void wakeSnooze(id, { notify: true });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  void (async () => {
    try {
      switch (msg.type) {
        case 'LIST_SNOOZED':
          sendResponse({ ok: true, tabs: await getSnoozedTabs() });
          break;
        case 'SNOOZE_ACTIVE': {
          const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!active?.id) throw new Error('No active tab');
          const item = await snoozeTab(active.id, msg.wakeAt);
          sendResponse({ ok: true, item });
          break;
        }
        case 'WAKE_NOW':
          await wakeSnooze(msg.id, { notify: false });
          sendResponse({ ok: true });
          break;
        case 'CANCEL_SNOOZE':
          await cancelSnooze(msg.id);
          sendResponse({ ok: true });
          break;
        default:
          sendResponse({ ok: false, error: 'Unknown message' });
      }
    } catch (err) {
      sendResponse({
        ok: false,
        error: err instanceof Error ? err.message : 'Something went wrong'
      });
    }
  })();
  return true;
});
