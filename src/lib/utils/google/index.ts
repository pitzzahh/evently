import { google } from 'googleapis';

export async function getGoogleAuth(api_key: string | null, scopes: string | string[] | undefined) {
  if (!api_key) {
    throw new Error('Missing API Key for Google API authentication');
  }
  return new google.auth.GoogleAuth({
    apiKey: api_key,
    scopes
  });
}
