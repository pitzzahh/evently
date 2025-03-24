import type { DocumentMetaDetails } from "@/types/exports";
import type { WebWorkerDocumentMetaDetails } from "@/types/workers";
import { generateFullEventAttendanceReportPDF } from "@/utils/exports/pdf";

onmessage = async (message: MessageEvent<WebWorkerDocumentMetaDetails>) => {
  postMessage(await generateFullEventAttendanceReportPDF({
    ...message.data,
    event_details: JSON.parse(message.data.event_details) as DocumentMetaDetails['event_details'],
    participants: JSON.parse(message.data.participants) as DocumentMetaDetails['participants'],
  }, false));
};