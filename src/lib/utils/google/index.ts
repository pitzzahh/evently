export type GoogleAuthHeaders = {
  Authorization?: string;
  'x-goog-api-key'?: string;
};

export async function getGoogleAuthHeaders(api_key: string | null): Promise<GoogleAuthHeaders> {
  if (!api_key) {
    throw new Error('Missing API Key for Google API authentication');
  }

  // For API key-based authentication
  return {
    'x-goog-api-key': api_key
  };
}

// Helper for constructing Google API URLs
export function buildGoogleApiUrl(path: string, queryParams?: Record<string, string>): string {
  const baseUrl = 'https://www.googleapis.com';
  const url = new URL(`${baseUrl}${path}`);

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.append(key, value);
    });
  }

  return url.toString();
}
