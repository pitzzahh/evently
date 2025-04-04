import type { DocumentMetaDetails } from "@/types/exports";

export type WebWorkerDocumentMetaDetails = Omit<DocumentMetaDetails, 'event_details' | 'participants'> & {
  _event_details: string;
  _participants: string;
  seperate_files?: boolean;
};