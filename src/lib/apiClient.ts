/**
 * API Client with safe JSON response parsing and exponential backoff retry for 429 rate limits.
 */

import { getIdToken } from 'firebase/auth';
import { auth } from './firebase';

const API_BASE = 'https://yash-ansh.vercel.app';

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

/**
 * Safely parse HTTP response without throwing "Unexpected token '<'" on HTML error pages.
 */
export async function safeParseResponse<T = any>(res: Response): Promise<ApiResponse<T>> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  let rawText = '';
  try {
    rawText = await res.text();
  } catch (readErr) {
    rawText = '';
  }

  if (isJson && rawText.trim().length > 0) {
    try {
      const data = JSON.parse(rawText);
      return {
        ok: res.ok,
        status: res.status,
        data,
        error: !res.ok ? (data.error || data.message || `Request failed with status ${res.status}`) : undefined
      };
    } catch (parseErr) {
      console.warn('Failed to parse JSON response despite JSON content-type:', parseErr);
    }
  }

  const trimmed = rawText.trim();
  if (trimmed.startsWith('<') || trimmed.toLowerCase().includes('<!doctype')) {
    const cleanMsg = `Server returned an HTML error page (HTTP ${res.status} ${res.statusText || 'Service Unavailable'}). Please try again.`;
    return {
      ok: false,
      status: res.status,
      data: { error: cleanMsg, text: cleanMsg } as any,
      error: cleanMsg
    };
  }

  const fallbackMsg = trimmed || `Server error (HTTP ${res.status})`;
  return {
    ok: res.ok,
    status: res.status,
    data: { error: fallbackMsg, text: fallbackMsg } as any,
    error: fallbackMsg
  };
}

/**
 * Perform a fetch request with automatic exponential backoff on 429 rate limits (max 3 retries).
 */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<ApiResponse<T>> {
  const isLocalDevelopment = typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const apiBase = isLocalDevelopment ? '' : API_BASE;
  const fullUrl = url.startsWith('http') ? url : `${apiBase}${url}`;
  let attempt = 0;
  let delayMs = 1000;

  while (true) {
    attempt++;
    try {
      const headers = new Headers(options.headers);
      if (auth.currentUser) {
        headers.set('Authorization', `Bearer ${await getIdToken(auth.currentUser)}`);
      }
      const res = await fetch(fullUrl, { ...options, headers });
      const parsed = await safeParseResponse<T>(res);

      const isRateLimit = res.status === 429 || (parsed.data && typeof parsed.data === 'object' && (parsed.data as any).isRateLimit);
      const isServerRateLimit = parsed.data && typeof parsed.data === 'object' && (parsed.data as any).retryable === false;

      if (isRateLimit && !isServerRateLimit && attempt <= maxRetries) {
        console.warn(`[API Client] 429 Rate limit hit on ${fullUrl}. Retry ${attempt}/${maxRetries} after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2;
        continue;
      }

      return parsed;
    } catch (err: any) {
      if (options.signal?.aborted) {
        throw err;
      }

      if (attempt <= maxRetries) {
        console.warn(`[API Client] Fetch network error on ${fullUrl}. Retry ${attempt}/${maxRetries} after ${delayMs}ms...`, err);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2;
        continue;
      }

      const errMsg = err?.message || 'Network request failed';
      return {
        ok: false,
        status: 0,
        data: { error: errMsg } as any,
        error: errMsg
      };
    }
  }
}
