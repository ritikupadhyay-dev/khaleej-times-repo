export const proxyIfNeeded = (url: string): string => {
    if (!url) return url;
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (url.includes('/functions/v1/image-proxy')) return url;
    if (url.startsWith('http')) {
      return `https://mfnnkzsgdntnswynzdxm.supabase.co/functions/v1/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

    // Sanitize URLs by replacing HTML entities
 export const sanitizeUrl = (url: string): string => {
    if (!url) return url;
    return url.replace(/&amp;/g, '&');
  };