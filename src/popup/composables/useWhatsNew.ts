import { ref } from 'vue';

export interface WhatsNewContent {
  title: string;
  bullets: string[];
  hasMore: boolean;
}

export function useWhatsNew() {
  const content = ref<WhatsNewContent | null>(null);
  const loading = ref(false);
  const error = ref(false);

  async function loadLatestRelease() {
    loading.value = true;
    error.value = false;
    try {
      const idx = await (await fetch(chrome.runtime.getURL('changelog/index.json'))).json();
      const latestId = idx.versions?.[0];
      if (!latestId) throw new Error('no versions');
      const entry = await (
        await fetch(chrome.runtime.getURL(`changelog/${latestId}.json`))
      ).json();
      content.value = {
        title: entry.title || `Version ${entry.version}`,
        bullets: (entry.changes || []).slice(0, 4),
        hasMore: (entry.changes || []).length > 4
      };
    } catch {
      error.value = true;
      content.value = null;
    } finally {
      loading.value = false;
    }
  }

  return { content, loading, error, loadLatestRelease };
}
