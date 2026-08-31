import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to detect platform
  function detectPlatform(urlStr: string) {
    try {
      const parsed = new URL(urlStr);
      const host = parsed.hostname.toLowerCase();
      if (host.includes('tiktok.com')) return 'tiktok';
      if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
      if (host.includes('instagram.com')) return 'instagram';
      if (host.includes('facebook.com') || host.includes('fb.watch')) return 'facebook';
      if (host.includes('twitter.com') || host.includes('x.com')) return 'x';
      if (host.includes('reddit.com')) return 'reddit';
      if (host.includes('pinterest.com')) return 'pinterest';
      if (host.includes('vimeo.com')) return 'vimeo';
      if (host.includes('linkedin.com')) return 'linkedin';
      if (host.includes('threads.net')) return 'threads';
      return 'web';
    } catch {
      return 'web';
    }
  }

  // Extract YouTube video ID
  function getYouTubeId(urlStr: string): string | null {
    try {
      const url = new URL(urlStr);
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

  // Metadata endpoint
  app.get('/api/metadata', async (req, res) => {
    const rawUrl = req.query.url;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    let targetUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const platform = detectPlatform(targetUrl);

    try {
      const urlObj = new URL(targetUrl);
      const siteName = urlObj.hostname.replace(/^www\./, '');
      let title = '';
      let description = '';
      let thumbnail = '';
      let author = '';
      let favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;

      // 1. Specialized handling: YouTube
      if (platform === 'youtube') {
        const ytId = getYouTubeId(targetUrl);
        if (ytId) {
          thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
        try {
          const oembedRes = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(4000) }
          );
          if (oembedRes.ok) {
            const data = await oembedRes.json() as any;
            title = data.title || title;
            author = data.author_name || author;
            if (data.thumbnail_url) thumbnail = data.thumbnail_url;
          }
        } catch {}
      }

      // 2. Specialized handling: TikTok
      else if (platform === 'tiktok') {
        try {
          const oembedRes = await fetch(
            `https://www.tiktok.com/oembed?url=${encodeURIComponent(targetUrl)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(4000) }
          );
          if (oembedRes.ok) {
            const data = await oembedRes.json() as any;
            title = data.title || title;
            author = data.author_name || author;
            if (data.thumbnail_url) thumbnail = data.thumbnail_url;
          }
        } catch {}
      }

      // 3. Specialized handling: Vimeo
      else if (platform === 'vimeo') {
        try {
          const oembedRes = await fetch(
            `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(targetUrl)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(4000) }
          );
          if (oembedRes.ok) {
            const data = await oembedRes.json() as any;
            title = data.title || title;
            author = data.author_name || author;
            if (data.thumbnail_url) thumbnail = data.thumbnail_url;
            if (data.description) description = data.description;
          }
        } catch {}
      }

      // 4. Specialized handling: Twitter / X
      else if (platform === 'x') {
        try {
          const oembedRes = await fetch(
            `https://publish.twitter.com/oembed?url=${encodeURIComponent(targetUrl)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(4000) }
          );
          if (oembedRes.ok) {
            const data = await oembedRes.json() as any;
            author = data.author_name || author;
            // Clean up html snippet title
            if (data.html) {
              const textMatch = data.html.match(/<p[^>]*>(.*?)<\/p>/i);
              if (textMatch) {
                title = textMatch[1].replace(/<[^>]+>/g, '');
              }
            }
          }
        } catch {}
      }

      // If title or thumbnail still missing, scrape OpenGraph HTML
      if (!title || !thumbnail || platform === 'instagram' || platform === 'facebook' || platform === 'reddit' || platform === 'pinterest' || platform === 'web' || platform === 'threads' || platform === 'linkedin') {
        try {
          const htmlRes = await fetch(targetUrl, {
            headers: {
              'User-Agent':
                'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php) Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(5000),
            redirect: 'follow',
          });

          if (htmlRes.ok) {
            const html = await htmlRes.text();

            // Extract OG / Twitter / standard title
            if (!title) {
              const ogTitle =
                html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i)?.[1] ||
                html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:title["']/i)?.[1] ||
                html.match(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i)?.[1] ||
                html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
              if (ogTitle) {
                title = decodeHtmlEntities(ogTitle.trim());
              }
            }

            // Extract OG / Twitter image
            if (!thumbnail) {
              const ogImage =
                html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i)?.[1] ||
                html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:image["']/i)?.[1] ||
                html.match(/<meta\s+property=["']og:image:secure_url["']\s+content=["'](.*?)["']/i)?.[1] ||
                html.match(/<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i)?.[1] ||
                html.match(/<meta\s+name=["']twitter:image:src["']\s+content=["'](.*?)["']/i)?.[1];
              if (ogImage) {
                try {
                  thumbnail = new URL(ogImage.trim(), targetUrl).href;
                } catch {
                  thumbnail = ogImage.trim();
                }
              }
            }

            // Extract description
            if (!description) {
              const ogDesc =
                html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i)?.[1] ||
                html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:description["']/i)?.[1] ||
                html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i)?.[1];
              if (ogDesc) {
                description = decodeHtmlEntities(ogDesc.trim());
              }
            }

            // Extract site name
            const ogSiteName =
              html.match(/<meta\s+property=["']og:site_name["']\s+content=["'](.*?)["']/i)?.[1] ||
              html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:site_name["']/i)?.[1];
            if (ogSiteName) {
              // use nicer site name
            }
          }
        } catch {}
      }

      // Default fallback title from path/domain if empty
      if (!title) {
        title = urlObj.pathname.length > 1
          ? decodeURIComponent(urlObj.pathname.split('/').filter(Boolean).pop() || siteName).replace(/[-_]/g, ' ')
          : siteName;
        // Capitalize words
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }

      res.json({
        url: targetUrl,
        title: title || siteName,
        description: description || '',
        thumbnail: thumbnail || '',
        siteName: siteName,
        platform: platform,
        author: author || '',
        favicon: favicon,
      });
    } catch (err: any) {
      // Return best effort even on parse error
      return res.json({
        url: targetUrl,
        title: targetUrl,
        description: '',
        thumbnail: '',
        siteName: 'web',
        platform: platform,
        author: '',
        favicon: '',
      });
    }
  });

  // Decode basic HTML entities
  function decodeHtmlEntities(str: string) {
    return str
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
  }

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Link Saver server running on port ${PORT}`);
  });
}

startServer();
