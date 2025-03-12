import type { DocumentMetaDetails } from "@/types/exports";
import { generateDailyAttendanceReportPDF } from "@/utils/exports/pdf";

onmessage = (message: MessageEvent<DocumentMetaDetails>) => {
  console.log(message);
  postMessage(generateDailyAttendanceReportPDF(message.data));
};

export { };