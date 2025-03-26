import { formatDateTime } from "@/utils/format";

/**
 * Generates an ID card image for an event participant
 * @param eventName Name of the event
 * @param participantName Name of the participant
 * @param qrDataUrl Data URL string of the QR code to use on the ID card
 * @returns A Promise that resolves to a data URL containing the ID card image
 */
export async function generateEventIdCard(
  eventName: string,
  participantName: string,
  qrDataUrl: string
): Promise<string> {
  // ID card dimensions (portrait orientation)
  const width = 600;
  const height = 900;

  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // Set gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#FFDEE9');
  gradient.addColorStop(1, '#B5FFFC');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add rounded border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(20, 10);
  ctx.arcTo(width - 10, 10, width - 10, height - 10, 20);
  ctx.arcTo(width - 10, height - 10, 10, height - 10, 20);
  ctx.arcTo(10, height - 10, 10, 10, 20);
  ctx.arcTo(10, 10, width - 10, 10, 20);
  ctx.closePath();
  ctx.stroke();

  // Add event name with improved typography
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 50px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(eventName, width / 2, 100);

  // Add separator line with shadow
  ctx.beginPath();
  ctx.moveTo(50, 130);
  ctx.lineTo(width - 50, 130);
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#999999';
  ctx.shadowBlur = 5;
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow

  // QR code size
  const qrSize = 350;

  // Draw QR code from data URL
  const qrImage = new Image();
  await new Promise((resolve, reject) => {
    qrImage.onload = resolve;
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });
  ctx.drawImage(qrImage, (width - qrSize) / 2, 150, qrSize, qrSize);

  // Add participant name with better styling
  ctx.fillStyle = '#222222';
  ctx.font = '30px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(participantName, width / 2, 550 + qrSize / 2);

  // Add "PARTICIPANT" label with uppercase and spacing
  ctx.fillStyle = '#444444';
  ctx.font = '24px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('PARTICIPANT', width / 2, 590 + qrSize / 2);

  // Add current date with subtle styling
  ctx.font = 'italic 18px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#555555';
  ctx.fillText(`Issued: ${formatDateTime(new Date())}`, width / 2, height - 40);

  // Return the image as data URL
  return canvas.toDataURL('image/png');
}

/**
 * Generates an ID card image and downloads it
 * @param eventName Name of the event
 * @param participantName Name of the participant
 * @param qrDataUrl Data URL string of the QR code to use on the ID card
 * @returns A Promise that resolves when the download is initiated
 */
export async function downloadEventIdCard(
  eventName: string,
  participantName: string,
  qrDataUrl: string
): Promise<void> {
  try {
    const dataUrl = await generateEventIdCard(eventName, participantName, qrDataUrl);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${participantName.replace(/\s+/g, '_')}_id_card.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to download ID card:', error);
    throw new Error('Failed to download ID card', { cause: error });
  }
}

/**
 * Renders an ID card image into a provided HTML element
 * @param container HTML element to render the image into
 * @param eventName Name of the event
 * @param participantName Name of the participant
 * @param qrDataUrl Data URL string of the QR code to use on the ID card
 * @returns A Promise that resolves when the image is rendered
 */
export async function renderEventIdCard(
  container: HTMLElement,
  eventName: string,
  participantName: string,
  qrDataUrl: string
): Promise<void> {
  try {
    const dataUrl = await generateEventIdCard(eventName, participantName, qrDataUrl);

    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `${participantName}'s ID Card for ${eventName}`;
    img.style.maxWidth = '100%';
    container.innerHTML = '';
    container.appendChild(img);
  } catch (error) {
    console.error('Failed to render ID card:', error);
    throw new Error('Failed to render ID card', { cause: error });
  }
}

/**
 * Helper function to load a QR code image from a URL
 * @param imageUrl URL of the QR code image
 * @returns Promise that resolves to the loaded image
 */
export function loadQRImage(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load QR code image from URL: ${imageUrl}`));
    img.src = imageUrl;
  });
}
