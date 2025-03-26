import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

interface DriveFile {
  id: string;
  name: string;
  mimeType?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export async function uploadFileToGoogleDrive(authClient: GoogleAuth, data: {
  file: Blob,
  file_name: string,
  mime_type: 'image/bmp' | 'image/jpeg' | 'image/x-png',
  parentFolderId?: string
}) {
  try {
    if (!authClient) {
      throw new Error('Google auth client is not provided');
    }

    const drive = google.drive({ version: 'v3', auth: authClient });

    const metadata: any = {
      name: data.file_name,
      mimeType: data.mime_type
    };

    if (data.parentFolderId) {
      metadata.parents = [data.parentFolderId];
    }

    // Convert Blob to Buffer/Stream for the API
    const arrayBuffer = await data.file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const response = await drive.files.create({
      requestBody: metadata,
      media: {
        mimeType: data.mime_type,
        body: buffer
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

export async function createFolder(authClient: GoogleAuth, folder_name: string, parentFolderId?: string) {
  try {
    if (!authClient) {
      throw new Error('Google auth client is not provided');
    }

    const drive = google.drive({ version: 'v3', auth: authClient });

    const metadata: any = {
      name: folder_name,
      mimeType: 'application/vnd.google-apps.folder'
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const response = await drive.files.create({
      requestBody: metadata,
      fields: 'id'
    });

    console.log('Folder created successfully:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error('Failed to create folder in Google Drive', { cause: error });
  }
}

export async function findFolder(authClient: GoogleAuth, folder_name: string, parentFolderId?: string) {
  try {
    if (!authClient) {
      throw new Error('Google auth client is not provided');
    }

    const drive = google.drive({ version: 'v3', auth: authClient });

    let query = `name='${folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

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
      return folders[0] as DriveFile;
    } else {
      console.log('Folder not found');
      return null;
    }
  } catch (error) {
    console.error('Error finding folder:', error);
    throw new Error('Failed to search for folder in Google Drive', { cause: error });
  }
}

export async function getOrCreateFolder(authClient: GoogleAuth, folder_name: string, parentFolderId?: string) {
  try {
    if (!authClient) {
      throw new Error('Google auth client is not provided');
    }

    const existingFolder = await findFolder(authClient, folder_name, parentFolderId);
    if (existingFolder) {
      return existingFolder;
    }

    const folderId = await createFolder(authClient, folder_name, parentFolderId);
    return { id: folderId, name: folder_name };
  } catch (error) {
    console.error('Error getting or creating folder:', error);
    throw new Error('Failed to get or create folder in Google Drive', { cause: error });
  }
}

export async function findFile(authClient: GoogleAuth, file_name: string, folderId?: string) {
  try {
    if (!authClient) {
      throw new Error('Google auth client is not provided');
    }

    const drive = google.drive({ version: 'v3', auth: authClient });

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
      return files[0] as DriveFile;
    } else {
      console.log('File not found');
      return null;
    }
  } catch (error) {
    console.error('Error finding file:', error);
    throw new Error('Failed to search for file in Google Drive', { cause: error });
  }
}

export async function createPublicRawImageUrl(authClient: GoogleAuth, file_id: string) {
  try {
    if (!authClient) {
      throw new Error('Google auth client is not provided');
    }

    const drive = google.drive({ version: 'v3', auth: authClient });

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