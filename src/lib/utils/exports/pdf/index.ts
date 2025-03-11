import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { toast } from "svelte-sonner";
import type {
  TDocumentDefinitions
} from 'pdfmake/interfaces';
import type { DocumentMetaDetails } from "@/types/exports";
import { createQrPngDataUrl } from '@svelte-put/qr';

export async function generateQRCodesPDF(props: DocumentMetaDetails) {
  const { info, event_details, participants } = props;

  if (!participants || participants.length === 0) {
    toast.error("No participants found to generate QR codes");
    return;
  }

  const rows: any[] = [];
  let currentRow: any[] = [];

  try {
    const qrCodePromises = participants.map(async (participant) => {
      return {
        stack: [
          {
            image: await createQrPngDataUrl({
              data: participant.id,
              width: 500,
              height: 500,
              shape: 'circle',
              backgroundFill: '#fff',
            }),
            fit: [100, 100]
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
    });

    const cells = await Promise.all(qrCodePromises);

    cells.forEach((cell, index) => {
      currentRow.push(cell);

      if (currentRow.length === 4 || index === participants.length - 1) {
        while (currentRow.length < 4) {
          currentRow.push({});
        }

        rows.push(currentRow);
        currentRow = [];
      }
    });

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
            widths: ['*', '*', '*', '*'],
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
    pdfMake.createPdf(file).download(`${event_details.event_name}_QR_Codes.pdf`);
    toast.success("QR codes generated successfully");
  } catch (error) {
    toast.error("Failed to generate QR codes");
    console.error("PDF generation error:", error);
  }
}
