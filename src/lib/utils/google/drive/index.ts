import type { GoogleAuthHeaders } from '../index';
import { buildGoogleApiUrl } from '../index';

interface DriveFile {
  id: string;
  name: string;
  mimeType?: string;
  createdTime?: string;
  modifiedTime?: string;
}

interface ListFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export async function uploadFileToGoogleDrive(authHeaders: GoogleAuthHeaders, data: {
  file: Blob,
  file_name: string,
  mime_type: 'image/bmp' | 'image/jpeg' | 'image/x-png',
  parentFolderId?: string
}) {
  try {
    if (!authHeaders) {
      throw new Error('Google auth headers are not provided');
    }

    const metadata: any = {
      name: data.file_name,
      mimeType: data.mime_type
    };

    if (data.parentFolderId) {
      metadata.parents = [data.parentFolderId];
    }

    const boundary = 'boundary' + Math.random().toString().substr(2);
    const delimiter = `--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    let requestBody = delimiter;
    requestBody += 'Content-Type: application/json\r\n\r\n';
    requestBody += JSON.stringify(metadata) + '\r\n';
    requestBody += delimiter;
    requestBody += `Content-Type: ${data.mime_type}\r\n\r\n`;

    const requestBodyBlob = new Blob([requestBody], { type: 'text/plain' });
    const endBlob = new Blob([closeDelimiter], { type: 'text/plain' });
    const multipartBody = new Blob([requestBodyBlob, data.file, endBlob], { type: 'multipart/related; boundary=' + boundary });

    const uploadUrl = buildGoogleApiUrl('/upload/drive/v3/files', { uploadType: 'multipart', fields: 'id' });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Upload failed with status ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    console.log('File uploaded successfully:', result.id);
    return result.id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file to Google Drive', { cause: error });
  }
}

export async function createFolder(authHeaders: GoogleAuthHeaders, folder_name: string, parentFolderId?: string) {
  try {
    if (!authHeaders) {
      throw new Error('Google auth headers are not provided');
    }

    const metadata: any = {
      name: folder_name,
      mimeType: 'application/vnd.google-apps.folder'
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const createUrl = buildGoogleApiUrl('/drive/v3/files', { fields: 'id' });

    const response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Create folder failed with status ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    console.log('Folder created successfully:', result.id);
    return result.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error('Failed to create folder in Google Drive', { cause: error });
  }
}

export async function findFolder(authHeaders: GoogleAuthHeaders, folder_name: string, parentFolderId?: string) {
  try {
    if (!authHeaders) {
      throw new Error('Google auth headers are not provided');
    }

    let query = `name='${folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }

    const listUrl = buildGoogleApiUrl('/drive/v3/files', {
      q: query,
      fields: 'files(id, name, createdTime, modifiedTime)',
      spaces: 'drive'
    });

    const response = await fetch(listUrl, {
      method: 'GET',
      headers: authHeaders
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Find folder failed with status ${response.status}: ${errorData}`);
    }

    const result = await response.json() as ListFilesResponse;
    const folders = result.files;

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

export async function getOrCreateFolder(authHeaders: GoogleAuthHeaders, folder_name: string, parentFolderId?: string) {
  try {
    if (!authHeaders) {
      throw new Error('Google auth headers are not provided');
    }

    const existingFolder = await findFolder(authHeaders, folder_name, parentFolderId);
    if (existingFolder) {
      return existingFolder;
    }

    const folderId = await createFolder(authHeaders, folder_name, parentFolderId);
    return { id: folderId, name: folder_name };
  } catch (error) {
    console.error('Error getting or creating folder:', error);
    throw new Error('Failed to get or create folder in Google Drive', { cause: error });
  }
}

export async function findFile(authHeaders: GoogleAuthHeaders, file_name: string, folderId?: string) {
  try {
    if (!authHeaders) {
      throw new Error('Google auth headers are not provided');
    }

    let query = `name='${file_name}' and trashed=false`;
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const listUrl = buildGoogleApiUrl('/drive/v3/files', {
      q: query,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
      spaces: 'drive'
    });

    const response = await fetch(listUrl, {
      method: 'GET',
      headers: authHeaders
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Find file failed with status ${response.status}: ${errorData}`);
    }

    const result = await response.json() as ListFilesResponse;
    const files = result.files;

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

export async function createPublicRawImageUrl(authHeaders: GoogleAuthHeaders, file_id: string) {
  try {
    if (!authHeaders) {
      throw new Error('Google auth headers are not provided');
    }

    const permissionUrl = buildGoogleApiUrl(`/drive/v3/files/${file_id}/permissions`);

    const response = await fetch(permissionUrl, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Create permission failed with status ${response.status}: ${errorData}`);
    }

    const rawUrl = `https://drive.google.com/uc?export=view&id=${file_id}`;
    console.log('Public raw image URL created:', rawUrl);
    return rawUrl;
  } catch (error) {
    console.error('Error creating public raw image URL:', error);
    throw new Error('Failed to create public URL for image in Google Drive', { cause: error });
  }
}