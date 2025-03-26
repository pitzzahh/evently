import type { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

export async function uploadFileToGoogleDrive(auth: GoogleAuth, data: {
  file: Blob,
  mimeType: 'image/bmp' | 'image/jpeg' | 'image/x-png'
}) {
  const drive = google.drive({ version: 'v3', auth });
  const fileMetadata = {
    name: 'My File',
    mimeType: data.mimeType
  };
  const media = {
    mimeType: data.mimeType,
    body: data.file
  };
  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id'
    });
    console.log('File uploaded successfully:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file to Google Drive', { cause: error });
  }
}