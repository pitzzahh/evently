import type { Participant } from "@/db/models/types";
import type { SendEmailBody } from "@/types/email";
import type { DocumentMetaDetails } from "@/types/exports";
import { sendEmail } from "@/utils/email";
import { generateFullEventAttendanceReportExcel } from "@/utils/exports/excel";
import { generateQRCodes } from "@/utils/exports/pdf";
import { getEnv } from "@/utils/security";
import { generateFullName } from "@/utils/text";

onmessage = async (message: MessageEvent<Participant[]>) => {
  const participants = message.data;

  const PLUNK_API = await getEnv("PLUNK_API");
  const PLUNK_SK = await getEnv("PLUNK_SK");

  if (!PLUNK_API || !PLUNK_SK) {
    return postMessage({
      error: "Missing PLUNK_API or PLUNK_SK environment variable"
    });
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
        success: true,
        message: `Successfully sent QR codes to all ${successCount} participants`
      });
    } else {
      postMessage({
        success: false,
        message: `Sent QR codes to ${successCount} participants, failed for ${failCount} participants`
      });
    }
  })();

};