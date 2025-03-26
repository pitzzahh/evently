import { google } from 'googleapis';

export async function getGoogleAuthClient(
  client_email?: string,
  client_id?: string,
  private_key?: string,
) {

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
