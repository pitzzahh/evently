export async function uploadFile(api: string, options: {
  file: File, cloud_name: string, event_name: string, upload_preset: string
}) {
  const { file, cloud_name, event_name, upload_preset } = options;
  const url = `${api}/${cloud_name}/upload`;
  const fd = new FormData();
  fd.append('upload_preset', upload_preset);
  fd.append('file', file);
  fd.append('folder', event_name);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: fd,
    });

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error('Upload did not return a secure URL');
    }

    const originalUrl = data.secure_url;
    const tokens = originalUrl.split('/');
    tokens.splice(-3, 0, 'w_150,c_scale');
    const resizedUrl = tokens.join('/');

    return {
      url: originalUrl,
      resizedUrl: resizedUrl,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Error uploading the file:', error);
    throw error; // Re-throw to allow caller to handle the error
  }
}
