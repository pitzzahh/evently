import type { DocumentMetaDetails } from "@/types/exports";
import { generateDailyAttendanceReportPDF } from "@/utils/exports/pdf";

export type ModifiedDocumentMetaDetails = Omit<DocumentMetaDetails, 'event_details' | 'participants'> & {
  event_details: string;
  participants: string;
};

onmessage = (message: MessageEvent<ModifiedDocumentMetaDetails>) => {
  console.log(JSON.stringify(message, null, 2));
  const data = {
    ...message.data,
    event_details: JSON.parse(message.data.event_details) as DocumentMetaDetails['event_details'],
    participants: JSON.parse(message.data.participants) as DocumentMetaDetails['participants'],
  } as DocumentMetaDetails;
  console.log(data);
  postMessage(generateDailyAttendanceReportPDF(data));
};

export { };