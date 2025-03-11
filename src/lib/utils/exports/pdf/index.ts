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
  const { info, event_details, participants } = props;

  if (!participants || participants.length === 0) {
    toast.error("No participants found to generate QR codes");
    return;
  }

  // Create rows for a 2-column table
  const rows: any[] = [];
  let currentRow: any[] = [];

  participants.forEach((participant, index) => {
    // Generate QR code content (usually participant ID or other unique identifier)
    const qrValue = `${participant.id}`;

    // Create a cell with QR code and participant name
    const cell = {
      stack: [
        {
          qr: qrValue,
          fit: 120,
          alignment: 'center',
          margin: [0, 5, 0, 5]
        },
        {
          text: `${participant.first_name} ${participant.last_name}`,
          alignment: 'center',
          fontSize: 10,
          bold: true
        }
      ],
      margin: [10, 10, 10, 20]
    };

    currentRow.push(cell);

    // Create a new row after every 2 cells or for the last participant
    if (currentRow.length === 2 || index === participants.length - 1) {
      // If we have only one cell in the last row, add an empty cell
      if (currentRow.length === 1) {
        currentRow.push({});
      }

      rows.push(currentRow);
      currentRow = [];
    }
  });

  // Create the PDF document definition
  const file: TDocumentDefinitions = {
    info: info,
    pageSize: 'LEGAL',
    pageMargins: [20, 40, 20, 40],
    content: [
      {
        text: event_details.event_name,
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 5]
      },
      {
        text: `Location: ${event_details.location || 'N/A'}`,
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Participant QR Codes',
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', '*'],
          body: rows
        },
        layout: {
          defaultBorder: false,
        }
      }
    ],
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5]
      }
    },
    footer: function (currentPage, pageCount) {
      return {
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: 'center',
        fontSize: 8,
        margin: [0, 10, 0, 0]
      };
    }
  };

  // Generate and download the PDF
  try {
    pdfMake.createPdf(file).download(`${event_details.event_name}_QR_Codes.pdf`);
    toast.success("QR codes generated successfully");
  } catch (error) {
    toast.error("Failed to generate QR codes");
    console.error("PDF generation error:", error);
  }
}