import { generateQrCodeEmail } from "@/components/custom/email";
import type { Participant } from "@/db/models/types";
import type { HelperResponse } from "@/types/generic";
import { sendEmail } from "@/utils/email";
import { generateFullName } from "@/utils/text";

onmessage = async (message: MessageEvent<string>) => {
  let returned_data: HelperResponse<string | null>

  const {
    participants,
    PLUNK_API,
    PLUNK_SK,
    event_details
  } = JSON.parse(message.data as unknown as string) as {
    participants: (Participant & {
      qr: string;
      downloadable_qr: string;
    })[];
    PLUNK_API: string;
    PLUNK_SK: string;
    event_details: {
      event_name: string,
      event_date: string,
      event_location: string
    }
  };

  if (!PLUNK_API || !PLUNK_SK) {
    returned_data = {
      status: 401,
      message: "Missing PLUNK_API or PLUNK_SK environment variable"
    }
    postMessage(returned_data);
  }
  console.log(participants);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  (async () => {
    let successCount = 0;
    let failCount = 0;
    for (const participant of participants) {
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
              qr: participant.qr,
              downloadable_qr: participant.downloadable_qr,
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
      returned_data = {
        status: 200,
        message: `Successfully sent QR codes to all ${successCount} ${successCount === 1 ? 'participant' : 'participants'}`
      };
      postMessage({
        status: 200,
        message: `Successfully sent QR codes to all ${successCount} ${successCount === 1 ? 'participant' : 'participants'}`,
        data: successCount
      });
    } else {
      postMessage({
        status: 500,
        message: `Sent QR codes to ${successCount} ${successCount === 1 ? 'participant' : 'participants'}, failed for ${failCount} ${failCount === 1 ? 'participant' : 'participants'}`
      });
    }
  })();

};