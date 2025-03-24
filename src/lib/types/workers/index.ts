import type { DocumentMetaDetails } from "@/types/exports";

export type WebWorkerDocumentMetaDetails = Omit<DocumentMetaDetails, 'event_details' | 'participants'> & {
  event_details: string;
  participants: string;
  seperate_files?: boolean;
};