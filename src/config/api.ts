import { auth } from './firebase';

export async function getApiBaseUrl(): Promise<string> {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
  // Remove trailing slash if present
  return envUrl.toString().trim().replace(/\/+$/, '');
}

export async function fetchWithAuth(path: string, init?: RequestInit): Promise<Response> {
  const baseUrl = await getApiBaseUrl();
  console.log('API base URL:', baseUrl); // DEBUG: print API base URL
  if (!baseUrl) {
    throw new Error('API base URL not configured in environment variables');
  }

  // Only allow relative paths, never full URLs
  let cleanPath = path;
  if (/^https?:\/\//.test(path)) {
    // If a full URL is passed, extract only the path part
    try {
      const urlObj = new URL(path);
      cleanPath = urlObj.pathname + urlObj.search;
    } catch {
      throw new Error('fetchWithAuth: path must be a relative path, not a full URL');
    }
  }
  // Remove duplicate slashes
  cleanPath = cleanPath.replace(/\/+$/, '').replace(/^\/+/, '/');

  const token = await auth.currentUser?.getIdToken(true);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const url = `${baseUrl}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`API request failed ${res.status} ${res.statusText}: ${errorText}`);
  }
  return res;
}
