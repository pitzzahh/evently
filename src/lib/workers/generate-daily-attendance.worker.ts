import type { DocumentMetaDetails } from "@/types/exports";
import { generateDailyAttendanceReportPDF } from "@/utils/exports/pdf";

export type ModifiedDocumentMetaDetails = Omit<DocumentMetaDetails, 'event_details' | 'participants'> & {
  event_details: string;
  participants: string;
};

onmessage = async (message: MessageEvent<ModifiedDocumentMetaDetails>) => {
  postMessage(await generateDailyAttendanceReportPDF({
    ...message.data,
    event_details: JSON.parse(message.data.event_details) as DocumentMetaDetails['event_details'],
    participants: JSON.parse(message.data.participants) as DocumentMetaDetails['participants'],
  }));
};

export { };