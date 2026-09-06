type AppConfig = {
  API_BASE: string;
};

let config: AppConfig | null = null;

export async function loadConfig(): Promise<void> {
  try {
    // BASE_URL — это base из vite.config (VITE_BASE), например '/' или '/campaign'.
    // Убираем хвостовой слэш, чтобы корректно склеить с '/config.json' в обоих случаях.
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const res = await fetch(`${base}/config.json`);
    config = await res.json();
  } catch {
    config = { API_BASE: 'http://localhost:5000' };
  }
}

export function getApiBase(): string {
  return config?.API_BASE || 'http://localhost:5000';
}
