export interface AppEnvironment {
  apiBaseUrl: string;
  apiKey: string;
}

function requiredValue(name: string, value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function readEnvironment(source: ImportMetaEnv): AppEnvironment {
  const apiBaseUrl = requiredValue('VITE_API_BASE_URL', source.VITE_API_BASE_URL);

  try {
    const url = new URL(apiBaseUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('unsupported protocol');
    }
  } catch {
    throw new Error('VITE_API_BASE_URL must be a valid HTTP(S) URL.');
  }

  return {
    apiBaseUrl,
    apiKey: requiredValue('VITE_API_KEY', source.VITE_API_KEY),
  };
}

export const appEnvironment = readEnvironment(import.meta.env);
