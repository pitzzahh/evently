import { generateQrCodeEmail } from "@/components/custom/email";
import type { Participant } from "@/db/models/types";
import { sendEmail } from "@/utils/email";
import { generateQRCodes } from "@/utils/exports/pdf";
import { generateFullName } from "@/utils/text";
import { createQrSvgString } from "@svelte-put/qr";

onmessage = async (message: MessageEvent<string>) => {
  const {
    participants,
    PLUNK_API,
    PLUNK_SK,
    event_details
  } = JSON.parse(message.data as unknown as string) as {
    participants: Participant[];
    PLUNK_API: string;
    PLUNK_SK: string;
    event_details: {
      event_name: string,
      event_date: string,
      event_location: string
    }
  };

  if (!PLUNK_API || !PLUNK_SK) {
    postMessage({
      status: 401,
      message: "Missing PLUNK_API or PLUNK_SK environment variable"
    });
  }

  const participants_with_qr_codes = participants
    .sort((a, b) => a.first_name.localeCompare(b.first_name))
    .map((participant) => ({
      ...participant,
      qr: createQrSvgString({
        data: participant.id,
        width: 150,
        height: 150,
        shape: 'circle',
      })
    }))

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
          subject: `Your QR Code for ${event_details.event_name}`,
          body: generateQrCodeEmail({
            participant: {
              first_name: participant.first_name,
              middle_name: participant.middle_name,
              last_name: participant.last_name,
              qr: participant.qr
            },
            ...event_details
          })
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
      return postMessage({
        status: 200,
        message: `Successfully sent QR codes to all ${successCount} participants`
      });
    } else {
      return postMessage({
        status: 500,
        message: `Sent QR codes to ${successCount} participants, failed for ${failCount} participants`
      });
    }
  })();

};