import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { toast } from "svelte-sonner";
import type {
  TDocumentDefinitions,
  TFontDictionary,
  Content,
  Alignment,
  Margins
} from 'pdfmake/interfaces';
import type { DocumentMetaDetails } from "@/types/exports";

export function generateQRCodesPDF(props: DocumentMetaDetails) {
  toast.warning("This feature is a work in progress. Please check back later.");
  const { info, event_details, participants } = props;
  const file: TDocumentDefinitions = {
    info: info,
    pageSize: 'LEGAL',
    pageMargins: [20, 40, 20, 80],
    content: [
      {
        text: 'QR Codes',
        style: 'header'
      },
      {
        text: 'This is a work in progress. Please check back later.',
        style: 'subheader'
      },
      {
        text: 'This is a work in progress. Please check back later.',
        style: 'subheader'
      }
    ],
  };
}