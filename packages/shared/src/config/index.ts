type AppConfig = {
  API_BASE: string;
};

let config: AppConfig | null = null;

export async function loadConfig(): Promise<void> {
  try {
    const res = await fetch('/config.json');
    config = await res.json();
  } catch {
    config = { API_BASE: 'http://localhost:5000' };
  }
}

export function getApiBase(): string {
  return config?.API_BASE || 'http://localhost:5000';
}
