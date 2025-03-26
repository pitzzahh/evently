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

export async function findFolder(auth: GoogleAuth, folder_name: string) {
  try {
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.list({
      q: `name='${folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, createdTime, modifiedTime)',
      spaces: 'drive'
    });
    const folders = response.data.files;
    if (folders && folders.length > 0) {
      console.log('Folder found:', folders[0].id);
      return folders[0];
    } else {
      console.log('Folder not found');
      return null;
    }
  } catch (error) {
    console.error('Error finding folder:', error);
    throw new Error('Failed to search for folder in Google Drive', { cause: error });
  }
}

export async function getOrCreateFolder(auth: GoogleAuth, folder_name: string) {
  try {
    const existingFolder = await findFolder(auth, folder_name);
    if (existingFolder) {
      return existingFolder;
    }
    const folderId = await createFolder(auth, folder_name);
    return { id: folderId, name: folder_name };
  } catch (error) {
    console.error('Error getting or creating folder:', error);
    throw new Error('Failed to get or create folder in Google Drive', { cause: error });
  }
}

export async function findFile(auth: GoogleAuth, file_name: string, folderId?: string) {
  try {
    const drive = google.drive({ version: 'v3', auth });
    let query = `name='${file_name}' and trashed=false`;
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
      spaces: 'drive'
    });
    const files = response.data.files;
    if (files && files.length > 0) {
      console.log('File found:', files[0].id);
      return files[0];
    } else {
      console.log('File not found');
      return null;
    }
  } catch (error) {
    console.error('Error finding file:', error);
    throw new Error('Failed to search for file in Google Drive', { cause: error });
  }
}