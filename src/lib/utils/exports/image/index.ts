/**
 * Simple QR Code generator without external libraries
 * Note: This is a basic implementation and supports only alphanumeric data of limited length
 */
class QRCodeGenerator {
  private static readonly errorCorrectionLevel = 'M'; // M = 15% recovery capacity
  private static readonly typeNumber = 4; // 1 to 40, determines size

  static generate(data: string, size: number = 200): string {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Generate QR code matrix (simplified version - in a real implementation, 
    // we would use proper QR code algorithms)
    const matrix = this.generateMatrix(data);
    const blockSize = size / matrix.length;

    // Draw QR code
    ctx.fillStyle = '#000000';
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix.length; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
        }
      }
    }

    return canvas.toDataURL('image/png');
  }

  // This is a very simplified version of QR code generation
  // In a production environment, you would use a proper QR code library
  private static generateMatrix(data: string): boolean[][] {
    // Simple hash function to create a predictable pattern based on input data
    const hash = Array.from(data).reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);

    // Create a basic pattern (not a valid QR code, just a visual representation)
    const size = 21; // Smallest QR code size
    const matrix: boolean[][] = Array(size).fill(0).map(() => Array(size).fill(false));

    // Add finder patterns (the three large squares in corners)
    // Top-left finder pattern
    this.drawFinderPattern(matrix, 0, 0);
    // Top-right finder pattern
    this.drawFinderPattern(matrix, size - 7, 0);
    // Bottom-left finder pattern
    this.drawFinderPattern(matrix, 0, size - 7);

    // Fill with a pattern based on the hash of data
    let seedValue = hash;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Skip areas with finder patterns
        if ((row < 7 && col < 7) ||
          (row < 7 && col >= size - 7) ||
          (row >= size - 7 && col < 7)) {
          continue;
        }

        // Pseudorandom pattern based on data hash
        seedValue = (seedValue * 1103515245 + 12345) & 0x7fffffff;
        matrix[row][col] = (seedValue % 2) === 1;
      }
    }

    return matrix;
  }

  private static drawFinderPattern(matrix: boolean[][], top: number, left: number): void {
    // Outer square
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (row === 0 || row === 6 || col === 0 || col === 6) {
          matrix[top + row][left + col] = true;
        }
      }
    }

    // Inner square
    for (let row = 2; row < 5; row++) {
      for (let col = 2; col < 5; col++) {
        matrix[top + row][left + col] = true;
      }
    }
  }
}

/**
 * Generates an ID card image for an event participant
 * @param eventName Name of the event
 * @param participantName Name of the participant
 * @param qrImage Pre-loaded QR code image to use on the ID card
 * @returns A Promise that resolves to a data URL containing the ID card image
 */
export async function generateEventIdCard(
  eventName: string,
  participantName: string,
  qrImage: HTMLImageElement
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

  // Set background color
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Add border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Add event name at the top
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(eventName, width / 2, 80);

  // Add separator line
  ctx.beginPath();
  ctx.moveTo(50, 110);
  ctx.lineTo(width - 50, 110);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();

  // QR code size
  const qrSize = 350;

  // Draw QR code (already loaded externally)
  ctx.drawImage(qrImage, (width - qrSize) / 2, 150, qrSize, qrSize);

  // Add participant name below QR code
  ctx.fillStyle = '#000000';
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(participantName, width / 2, 550 + qrSize / 2);

  // Add "PARTICIPANT" label
  ctx.fillStyle = '#555555';
  ctx.font = '20px Arial';
  ctx.fillText('PARTICIPANT', width / 2, 580 + qrSize / 2);

  // Add current date at the bottom
  const currentDate = new Date().toLocaleDateString();
  ctx.font = '18px Arial';
  ctx.fillStyle = '#777777';
  ctx.fillText(`Issued: ${currentDate}`, width / 2, height - 50);

  // Return the image as data URL
  return canvas.toDataURL('image/png');
}

/**
 * Generates an ID card image and downloads it
 * @param eventName Name of the event
 * @param participantName Name of the participant
 * @param qrImage Pre-loaded QR code image to use on the ID card
 * @returns A Promise that resolves when the download is initiated
 */
export async function downloadEventIdCard(
  eventName: string,
  participantName: string,
  qrImage: HTMLImageElement
): Promise<void> {
  try {
    const dataUrl = await generateEventIdCard(eventName, participantName, qrImage);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${participantName.replace(/\s+/g, '_')}_id_card.png`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to download ID card:', error);
    throw error; // Re-throw to allow caller to handle the error
  }
}

/**
 * Renders an ID card image into a provided HTML element
 * @param container HTML element to render the image into
 * @param eventName Name of the event
 * @param participantName Name of the participant
 * @param qrImage Pre-loaded QR code image to use on the ID card
 * @returns A Promise that resolves when the image is rendered
 */
export async function renderEventIdCard(
  container: HTMLElement,
  eventName: string,
  participantName: string,
  qrImage: HTMLImageElement
): Promise<void> {
  try {
    const dataUrl = await generateEventIdCard(eventName, participantName, qrImage);

    // Create image element
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `${participantName}'s ID Card for ${eventName}`;
    img.style.maxWidth = '100%';

    // Clear container and append image
    container.innerHTML = '';
    container.appendChild(img);
  } catch (error) {
    console.error('Failed to render ID card:', error);
    throw error;
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
