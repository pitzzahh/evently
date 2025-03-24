import type { EventDetails, Participant } from "@/db/models/types";
import type { TDocumentInformation } from "pdfmake/interfaces";

export type DocumentMetaDetails = {
  info: TDocumentInformation;
  event_details: EventDetails;
  participants: Participant[];
};