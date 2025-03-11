import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { toast } from "svelte-sonner";
import type {
  TDocumentDefinitions
} from 'pdfmake/interfaces';
import type { DocumentMetaDetails } from "@/types/exports";
import { createQrPngDataUrl } from '@svelte-put/qr';
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function generateQRCodesPDF(props: DocumentMetaDetails) {
  const { info, event_details, participants } = props;

  if (!participants || participants.length === 0) {
    toast.error("No participants found to generate QR codes");
    return;
  }

  // Calculate optimal number of columns (max 4)
  const calculateOptimalColumns = (totalItems: number): number => {
    if (totalItems <= 4) return totalItems;
    if (totalItems <= 8) return Math.min(4, Math.ceil(totalItems / 2));
    return 4; // Default to max columns for larger counts
  };

  const columnsPerRow = calculateOptimalColumns(participants.length);
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
            fit: [100, 100],
            alignment: 'center' // Center the image
          },
          {
            text: `${participant.first_name} ${participant.last_name}`,
            alignment: 'center',
            fontSize: 10,
            bold: true
          }
        ],
        margin: [10, 10, 10, 20],
        alignment: 'center' // Center the entire stack
      };
    });

    const cells = await Promise.all(qrCodePromises);

    cells.forEach((cell, index) => {
      currentRow.push(cell);

      if (currentRow.length === columnsPerRow || index === participants.length - 1) {
        // Fill remaining cells in the last row if needed
        while (currentRow.length < columnsPerRow) {
          currentRow.push({});
        }

        rows.push(currentRow);
        currentRow = [];
      }
    });

    // Create dynamic column widths array
    const columnWidths = Array(columnsPerRow).fill('*');

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
          text: 'Participants QR Codes',
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: columnWidths,
            body: rows
          },
          layout: {
            defaultBorder: false,
            paddingLeft: function () { return 5; },
            paddingRight: function () { return 5; },
            paddingTop: function () { return 5; },
            paddingBottom: function () { return 5; }
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
    pdfMake.createPdf(file).getDataUrl(async (dataUrl) => {
      const label = `${event_details.event_name}_QR_Codes`;
      const existingWebview = await WebviewWindow.getByLabel(label);
      if (existingWebview) {
        existingWebview.close();
      }

      const webview = new WebviewWindow(label, {
        url: dataUrl,
        title: `${event_details.event_name} QR Codes`,
      });

      webview.once('tauri://created', function () {
        toast.success("QR codes generated successfully");
      });
      webview.once('tauri://error', function (e) {
        console.error(e);
        toast.error("Failed to generate QR codes", {
          description: e.event
        });
      });
    });
    toast.success("QR codes generated successfully");
  } catch (error) {
    toast.error("Failed to generate QR codes");
    console.error("PDF generation error:", error);
  }
}
