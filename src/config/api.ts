import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getApiBaseUrl(): Promise<string> {
  try {
    const urlDoc = await getDoc(doc(db, 'url', 'firebase'));
    const configured = urlDoc.exists() && (urlDoc.data() as any)?.url;
    const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
    const base = (configured || envUrl || '').toString().trim();
    return base.replace(/\/$/, '');
  } catch (e) {
    const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
    return envUrl.toString().trim().replace(/\/$/, '');
  }
}

export async function fetchWithAuth(path: string, init?: RequestInit): Promise<Response> {
  const baseUrl = await getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('API base URL not configured. Save it in Settings.');
  }

  const token = await auth.currentUser?.getIdToken(true);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`API request failed ${res.status} ${res.statusText}: ${errorText}`);
  }
  return res;
}
