import type { Participant } from "@/db/models/types";
import { sendEmail } from "@/utils/email";
import { generateQRCodes } from "@/utils/exports/pdf";
import { generateFullName } from "@/utils/text";

onmessage = async (message: MessageEvent<string>) => {
  const {
    participants,
    PLUNK_API,
    PLUNK_SK
  } = JSON.parse(message.data as unknown as string) as {
    participants: Participant[];
    PLUNK_API: string;
    PLUNK_SK: string;
  };

  if (!PLUNK_API || !PLUNK_SK) {
    throw new Error("Missing PLUNK_API or PLUNK_SK environment variable");
  }

  const participants_with_qr_codes = generateQRCodes(participants);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  (async () => {
    let successCount = 0;
    let failCount = 0;
    for (const participant of participants_with_qr_codes) {
      const full_name = generateFullName(
        {
          first_name: participant.first_name,
          middle_name: participant.middle_name,
          last_name: participant.last_name
        },
        {
          include_last_name: true
        }
      );
      try {
        await sendEmail({
          to: participant.email!,
          subject: `Your QR Code for ${participant.event_id}`,
          body: `Hello ${full_name},\n\nHere is your QR code for the event:\n${participant.qr}`
        }, {
          PLUNK_API,
          PLUNK_SK
        });
        successCount++;
        console.log(`Successfully sent email to ${full_name}`);
      } catch (error) {
        failCount++;
        console.error(`Failed to send email to ${full_name}:`, error);
      }
      await delay(5000);
    }

    if (failCount === 0) {
      postMessage({
        message: `Successfully sent QR codes to all ${successCount} participants`
      });
    } else {
      throw new Error(`Sent QR codes to ${successCount} participants, failed for ${failCount} participants`);
    }
  })();

};