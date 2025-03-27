/**
 * Converts a data URL string to a File object
 * @param dataurl - The data URL string to convert
 * @param filename - The name to give to the generated file
 * @returns A File object created from the data URL
 */
export function dataURLtoFile(dataurl: string, filename: string) {
  let arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream',
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}