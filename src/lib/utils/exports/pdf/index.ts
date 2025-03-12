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

  const calculateOptimalColumns = (totalItems: number): number => {
    if (totalItems <= 4) return totalItems;
    if (totalItems <= 8) return Math.min(4, Math.ceil(totalItems / 2));
    return 4;
  };

  const columnsPerRow = calculateOptimalColumns(participants.length);
  const rows: any[] = [];
  let currentRow: any[] = [];

  const new_part = await Promise.all(participants.map(async (participant) => {
    return {
      ...participant,
      qr: await createQrPngDataUrl({
        data: participant.id,
        width: 500,
        height: 500,
        shape: 'circle',
        backgroundFill: '#fff',
      })
    };
  }));

  try {
    const qrCodePromises = new_part.map(async (participant) => {
      return {
        stack: [
          {
            image: participant.qr,
            fit: [100, 100],
            alignment: 'center'
          },
          {
            text: `${participant.first_name} ${participant.last_name}`,
            style: 'participantText',
            alignment: 'center'
          }
        ],
        margin: [10, 10, 10, 20],
        alignment: 'center'
      };
    });

    const cells = await Promise.all(qrCodePromises);

    cells.forEach((cell, index) => {
      currentRow.push(cell);

      if (currentRow.length === columnsPerRow || index === participants.length - 1) {
        while (currentRow.length < columnsPerRow) {
          currentRow.push({});
        }
        rows.push(currentRow);
        currentRow = [];
      }
    });

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
            hLineWidth(i, node) {
              return (i === 0 || i === node.table.body.length) ? 0 : 1;
            },
            vLineWidth(i, node) {
              return (i === 0 || (node.table.widths && i === node.table.widths.length)) ? 0 : 1;
            },
            hLineColor() { return '#ccc'; },
            vLineColor() { return '#ccc'; },
            paddingLeft() { return 10; },
            paddingRight() { return 10; },
            paddingTop() { return 10; },
            paddingBottom() { return 10; }
          }
        }
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          margin: [0, 0, 0, 10],
          color: '#333',
          decoration: 'underline'
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
          color: '#555'
        },
        participantText: {
          fontSize: 12,
          bold: true,
          color: '#007ACC'
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
