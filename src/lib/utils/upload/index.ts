export async function uploadFile(api: string, options: {
  file: File, cloud_name: string, event_name: string, upload_preset: string
}) {
  const { file, cloud_name, event_name, upload_preset } = options;
  const url = `${api}/${cloud_name}/upload`;
  const fd = new FormData();
  fd.append('upload_preset', upload_preset);
  fd.append('file', file);
  fd.append('folder', event_name);
  return fetch(url, {
    method: 'POST',
    body: fd,
  })
    .then((response) => response.json())
    .then((data) => {
      const url = data.secure_url;
      const tokens = url.split('/');
      tokens.splice(-3, 0, 'w_150,c_scale');
      const img = new Image();
      img.src = tokens.join('/');
      img.alt = data.public_id;
    })
    .catch((error) => {
      console.error('Error uploading the file:', error);
    });
}
