import type { SendEmailBody } from "@/types/email";
import type { DocumentMetaDetails } from "@/types/exports";
import { generateFullEventAttendanceReportExcel } from "@/utils/exports/excel";

onmessage = async (message: MessageEvent<SendEmailBody>) => {
  const email_props = message.data;

};