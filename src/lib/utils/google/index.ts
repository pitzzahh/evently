import { google } from 'googleapis';

export async function getGoogleAuthClient(
  client_email?: string | null,
  client_id?: string | null,
  private_key?: string | null,
) {

  if (!client_email || !client_id || !private_key) {
    throw new Error('Google credentials are not provided');
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email,
      client_id,
      private_key
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ],
  });
}
