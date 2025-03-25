import { formatDateTime } from '@/utils/format';
import { generateFullName } from '@/utils/text';

export type SendQrCodeProps = {
  participant: {
    qr: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  event_name: string;
  event_date: string;
  event_location: string;
};

/**
 * Generates an HTML email template for event QR codes
 * @param {Object} props - The properties for the email
 * @param {Object} props.participant - Participant information
 * @param {string} props.participant.qr - QR code SVG string
 * @param {string} props.participant.first_name - First name
 * @param {string} props.participant.middle_name - Middle name (optional)
 * @param {string} props.participant.last_name - Last name
 * @param {string} props.event_name - Name of the event
 * @param {string} props.event_date - Date of the event
 * @param {string} props.event_location - Location of the event
 * @returns {string} - HTML email template as a string
 */
export function generateQrCodeEmail(props: SendQrCodeProps): string {
  const { participant, event_name, event_date, event_location } = props;

  const fullName = generateFullName(
    {
      first_name: participant.first_name,
      middle_name: participant.middle_name,
      last_name: participant.last_name
    },
    {
      include_last_name: true
    }
  );

  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${event_name} - QR Code</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif;">
  <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 15px; background-color: #ffffff; color: #333333;">
    <!-- Header -->
    <div style="text-align: center; padding: 15px 0; background-color: #f8f9fa; border-radius: 8px 8px 0 0;">
      <h1 style="color: #4a5568; margin: 0; font-size: 24px; font-weight: 600;">Event Attendance QR Code</h1>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 20px 15px; background-color: #ffffff;">
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hello <span style="font-weight: 600;">${fullName}</span>,
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Thank you for registering for <span style="font-weight: 600;">${event_name}</span>. Your QR code for attendance is attached below.
      </p>
      
      <div style="margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; color: #718096; margin-bottom: 10px;">Please present this QR code at the event entrance:</p>
        
        <!-- QR Code Container -->
        <div style="background-color: #ffffff; padding: 15px; display: inline-block; border: 2px solid #e2e8f0; border-radius: 8px;">
          <!-- PNG QR Code (using the participant.qr data URL) -->
          <img src="${participant.qr}" alt="QR Code" style="max-width: 200px; height: auto;" />
          <!-- Fallback if image doesn't render -->
          <div style="margin-top: 10px; font-size: 12px; color: #a0aec0;">
            If you cannot see the QR code, please contact the event organizer.
          </div>
        </div>
      </div>
      
      <!-- Event Details -->
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <h2 style="font-size: 18px; color: #4a5568; margin-top: 0; margin-bottom: 10px; font-weight: 600;">Event Details</h2>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr>
            <td style="padding: 8px 0; color: #718096; width: 100px;">Event:</td>
            <td style="padding: 8px 0; font-weight: 500;">${event_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;">Date:</td>
            <td style="padding: 8px 0; font-weight: 500;">${formatDateTime(new Date(event_date))}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;">Location:</td>
            <td style="padding: 8px 0; font-weight: 500;">${event_location}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
        Please arrive at least 15 minutes before the event starts. Your QR code will be scanned at the entrance to record your attendance.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 15px; background-color: #f8f9fa; color: #718096; font-size: 14px; border-radius: 0 0 8px 8px; margin-top: 15px;">
      <p style="margin: 0 0 10px 0;">If you have any questions, please contact the event organizer.</p>
      <p style="margin: 0;">© ${currentYear} ${event_name}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}