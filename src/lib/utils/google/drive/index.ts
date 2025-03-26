import type { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

export async function uploadFileToGoogleDrive(auth: GoogleAuth, data: {
  file: Blob,
  file_name: string,
  mime_type: 'image/bmp' | 'image/jpeg' | 'image/x-png'
}) {
  try {
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.create({
      requestBody: {
        name: data.file_name,
        mimeType: data.mime_type
      },
      media: {
        mimeType: data.mime_type,
        body: data.file
      },
      fields: 'id'
    });
    console.log('File uploaded successfully:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file to Google Drive', { cause: error });
  }
}

export async function createFolder(auth: GoogleAuth, folder_name: string) {
  try {
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.create({
      requestBody: {
        name: folder_name,
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    });
    console.log('Folder created successfully:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error('Failed to create folder in Google Drive', { cause: error });
  }
}