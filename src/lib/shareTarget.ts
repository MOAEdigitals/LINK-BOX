export interface SharedPayload {
  url?: string;
  title?: string;
  text?: string;
}

export function extractUrlFromText(text: string): string | null {
  if (!text) return null;
  // Match standard URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const match = text.match(urlRegex);
  if (match && match.length > 0) {
    // Remove any trailing punctuation like parenthesis, commas, dots
    return match[0].replace(/[),.;!]+$/, '');
  }
  return null;
}

export function checkShareTargetParams(): { url: string; title?: string } | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const rawUrl = params.get('url');
    const rawText = params.get('text');
    const rawTitle = params.get('title');

    let resolvedUrl: string | null = null;

    if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
      resolvedUrl = rawUrl;
    } else if (rawText) {
      resolvedUrl = extractUrlFromText(rawText);
    } else if (rawUrl) {
      resolvedUrl = extractUrlFromText(rawUrl);
    }

    if (resolvedUrl) {
      // Clear URL params without reloading to prevent re-opening modal on refresh
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      return {
        url: resolvedUrl,
        title: rawTitle || undefined,
      };
    }
  } catch (err) {
    console.error('Error parsing share target params:', err);
  }
  return null;
}
