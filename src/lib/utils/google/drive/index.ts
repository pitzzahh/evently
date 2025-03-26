import type { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

export async function uploadFileToGoogleDrive(auth: GoogleAuth, data: {
  file: Blob,
  file_name: string,
  mime_type: 'image/bmp' | 'image/jpeg' | 'image/x-png',
  parentFolderId?: string
}) {
  try {
    if (!auth) {
      throw new Error('Google auth is not provided');
    }
    const drive = google.drive({ version: 'v3', auth });

    const requestBody: any = {
      name: data.file_name,
      mimeType: data.mime_type
    };

    // Add file to specific folder if parentFolderId is provided
    if (data.parentFolderId) {
      requestBody.parents = [data.parentFolderId];
    }

    const response = await drive.files.create({
      requestBody,
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

export async function createFolder(auth: GoogleAuth, folder_name: string, parentFolderId?: string) {
  try {
    if (!auth) {
      throw new Error('Google auth is not provided');
    }
    const drive = google.drive({ version: 'v3', auth });

    const requestBody: any = {
      name: folder_name,
      mimeType: 'application/vnd.google-apps.folder'
    };

    // Add folder to specific parent folder if parentFolderId is provided
    if (parentFolderId) {
      requestBody.parents = [parentFolderId];
    }

    const response = await drive.files.create({
      requestBody,
      fields: 'id'
    });
    console.log('Folder created successfully:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error('Failed to create folder in Google Drive', { cause: error });
  }
}

export async function findFolder(auth: GoogleAuth, folder_name: string, parentFolderId?: string) {
  try {
    if (!auth) {
      throw new Error('Google auth is not provided');
    }
    const drive = google.drive({ version: 'v3', auth });

    let query = `name='${folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    // Add parent folder constraint if parentFolderId is provided
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
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

export async function getOrCreateFolder(auth: GoogleAuth, folder_name: string, parentFolderId?: string) {
  try {
    if (!auth) {
      throw new Error('Google auth is not provided');
    }
    const existingFolder = await findFolder(auth, folder_name, parentFolderId);
    if (existingFolder) {
      return existingFolder;
    }
    const folderId = await createFolder(auth, folder_name, parentFolderId);
    return { id: folderId, name: folder_name };
  } catch (error) {
    console.error('Error getting or creating folder:', error);
    throw new Error('Failed to get or create folder in Google Drive', { cause: error });
  }
}

export async function findFile(auth: GoogleAuth, file_name: string, folderId?: string) {
  try {
    if (!auth) {
      throw new Error('Google auth is not provided');
    }
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

export async function createPublicRawImageUrl(auth: GoogleAuth, file_id: string) {
  try {
    if (!auth) {
      throw new Error('Google auth is not provided');
    }
    const drive = google.drive({ version: 'v3', auth });
    await drive.permissions.create({
      fileId: file_id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    const rawUrl = `https://drive.google.com/uc?export=view&id=${file_id}`;
    console.log('Public raw image URL created:', rawUrl);
    return rawUrl;
  } catch (error) {
    console.error('Error creating public raw image URL:', error);
    throw new Error('Failed to create public URL for image in Google Drive', { cause: error });
  }
}