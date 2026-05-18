export const STORAGE_KEY = 'snoozedTabs';

/** @typedef {object} SnoozedTab
 * @property {string} id
 * @property {string} url
 * @property {string} title
 * @property {string} [favIconUrl]
 * @property {number} snoozeUntil
 * @property {number} createdAt
 */

/** @param {string} id */
export function alarmNameForId(id) {
  return `tab-snooze-${id}`;
}

/** @returns {Promise<SnoozedTab[]>} */
export async function getSnoozedTabs() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
}

/** @param {SnoozedTab[]} tabs */
export async function saveSnoozedTabs(tabs) {
  await chrome.storage.local.set({ [STORAGE_KEY]: tabs });
}

/** @param {string} preset */
export function computeWakeTime(preset) {
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
    default:
      return now + 60 * 60 * 1000;
  }
}

/** @param {number} ms */
export function formatWakeLabel(ms) {
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

/** @param {number} ms */
export function formatRelative(ms) {
  const diff = ms - Date.now();
  if (diff < 0) return 'now';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `in ${hours}h`;
  const days = Math.round(hours / 24);
  return `in ${days}d`;
}
