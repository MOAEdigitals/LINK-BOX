import { MetadataResult, PlatformType } from '../types';

export function detectPlatform(urlStr: string): PlatformType {
  try {
    const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    const host = url.hostname.toLowerCase();
    if (host.includes('tiktok.com')) return 'tiktok';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
    if (host.includes('instagram.com')) return 'instagram';
    if (host.includes('facebook.com') || host.includes('fb.watch')) return 'facebook';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'x';
    if (host.includes('reddit.com')) return 'reddit';
    if (host.includes('pinterest.com')) return 'pinterest';
    if (host.includes('vimeo.com')) return 'vimeo';
    if (host.includes('threads.net')) return 'threads';
    if (host.includes('linkedin.com')) return 'linkedin';
    return 'web';
  } catch {
    return 'web';
  }
}

export function getYouTubeVideoId(urlStr: string): string | null {
  try {
    const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1).split('?')[0];
    }
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/shorts/')) {
        return url.pathname.replace('/shorts/', '').split('?')[0];
      }
      if (url.pathname.startsWith('/embed/')) {
        return url.pathname.replace('/embed/', '').split('?')[0];
      }
      return url.searchParams.get('v');
    }
  } catch {}
  return null;
}

export function getCleanUrl(urlStr: string): string {
  let cleaned = urlStr.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

export async function fetchMetadata(rawUrl: string): Promise<MetadataResult> {
  const url = getCleanUrl(rawUrl);
  const platform = detectPlatform(url);

  let hostname = 'web';
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '');
  } catch {}

  const defaultResult: MetadataResult = {
    url,
    title: hostname,
    description: '',
    thumbnail: '',
    siteName: hostname,
    platform,
    favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
  };

  // Immediate high quality fallback thumbnail for YouTube
  if (platform === 'youtube') {
    const ytId = getYouTubeVideoId(url);
    if (ytId) {
      defaultResult.thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      defaultResult.title = `YouTube Video (${ytId})`;
    }
  }

  // Try fetching from our server metadata endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        url: data.url || url,
        title: data.title || defaultResult.title,
        description: data.description || '',
        thumbnail: data.thumbnail || defaultResult.thumbnail,
        siteName: data.siteName || hostname,
        platform: data.platform || platform,
        author: data.author || '',
        favicon: data.favicon || defaultResult.favicon,
      };
    }
  } catch (err) {
    console.warn('Backend metadata fetch error or timeout, using local fallback:', err);
  }

  // Client-side oEmbed fallback for YouTube if server is unavailable
  if (platform === 'youtube') {
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) defaultResult.title = data.title;
        if (data.thumbnail_url) defaultResult.thumbnail = data.thumbnail_url;
        if (data.author_name) defaultResult.author = data.author_name;
      }
    } catch {}
  }

  return defaultResult;
}
