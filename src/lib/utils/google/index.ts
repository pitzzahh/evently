import { google } from 'googleapis';

export async function getGoogleAuth(credentials: {
  client_email: string | undefined;
  client_id: string | undefined;
  private_key: string | undefined;
}, scopes: string | string[] | undefined) {
  if (!credentials.client_email || !credentials.client_id || !credentials.private_key) {
    throw new Error('Missing credentials for Google API authentication');
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes
  });
}
