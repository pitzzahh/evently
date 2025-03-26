import { google } from 'googleapis';

export async function getGoogleAuth(credentials: {
  api_key: string | undefined;
}, scopes: string | string[] | undefined) {
  if (!credentials.api_key) {
    throw new Error('Missing credentials for Google API authentication');
  }
  return new google.auth.GoogleAuth({
    apiKey: credentials.api_key,
    scopes
  });
}
