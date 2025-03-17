import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { createQrSvgString } from '@svelte-put/qr';
import type { CustomTableLayout, TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';
import type { DocumentMetaDetails } from "@/types/exports";
import { formatDateToTimeOption } from "@/utils/format";
import { COLLECTIONS } from "@/db";
import type { HelperResponse } from "@/types/generic";
import { getPopulatedAttendanceRecords } from "@routes/events/participants/(utils)";

export async function generateQRCodesPDF(props: DocumentMetaDetails): Promise<HelperResponse<string | null>> {
  const { info, event_details, participants } = props;

  if (!participants || participants.length === 0) {
    return { status: 400, message: "No participants found to generate QR codes" };
  }
  try {
    const calculateOptimalColumns = (totalItems: number): number => {
      if (totalItems <= 4) return totalItems;
      if (totalItems <= 8) return Math.min(4, Math.ceil(totalItems / 2));
      return 4;
    };

    const columnsPerRow = calculateOptimalColumns(participants.length);

    const new_participants = participants
      .sort((a, b) => a.first_name.localeCompare(b.first_name))
      .map((participant) => ({
        ...participant,
        qr: createQrSvgString({
          data: participant.id,
          width: 500,
          height: 500,
          shape: 'circle',
        })
      }));

    const rows: any[][] = new_participants.reduce((acc: any[][], participant, index) => {
      const cell = {
        stack: [
          {
            svg: participant.qr,
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

      if (index % columnsPerRow === 0) {
        acc.push([]);
      }
      acc[acc.length - 1].push(cell);

      // Ensure each row has the correct number of columns
      if (acc[acc.length - 1].length === columnsPerRow) {
        acc.push([]);
      }

      return acc;
    }, []);
    // Remove the last empty row if it exists
    if (rows[rows.length - 1].length === 0) {
      rows.pop();
    }

    // Ensure all rows have the correct number of columns
    rows.forEach(row => {
      while (row.length < columnsPerRow) {
        row.push({ text: '', border: [false, false, false, false] });
      }
    });

    const columnWidths = Array(columnsPerRow).fill('*');

    const document_definition: TDocumentDefinitions = {
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
    return await generatePDFFile(document_definition);
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    return { status: 500, message: "Failed to generate QR codes" };
  }
}

export async function generateDailyAttendanceReportPDF(props: DocumentMetaDetails): Promise<HelperResponse<string | null>> {
  const { info, event_details, participants } = props;

  if (!participants || participants.length === 0) {
    return { status: 404, message: "No participants found to generate attendance report", data: null };
  }
  try {

    const participant_attendance = getPopulatedAttendanceRecords(event_details.id, {
      attendance_records_collection: COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION,
      participant_collection: COLLECTIONS.PARTICIPANT_COLLECTION,
    });

    console.log(`Participant Attendance Records: ${JSON.stringify(participant_attendance, null, 2)}`);

    const summary = {
      day: new Date().getDate(),
      date: new Date().toLocaleDateString(),
      total_participants: participants.length,
      present: participant_attendance.filter(p => p.attendance_status !== 'absent').length,
      absent: participant_attendance.filter(p => p.attendance_status === 'absent').length
    };

    const tableBody = [
      [
        { text: 'Participant', style: 'tableHeader' },
        { text: 'AM Check-in', style: 'tableHeader' },
        { text: 'AM Check-out', style: 'tableHeader' },
        { text: 'PM Check-in', style: 'tableHeader' },
        { text: 'PM Check-out', style: 'tableHeader' },
        { text: 'Status', style: 'tableHeader' }
      ],
      ...participant_attendance.map(participant => [
        { text: `${participant.first_name} ${participant.last_name}` },
        { text: participant.am_time_in ? formatDateToTimeOption(new Date(participant.am_time_in)) : 'N/A' },
        { text: participant.am_time_out ? formatDateToTimeOption(new Date(participant.am_time_out)) : 'N/A' },
        { text: participant.pm_time_in ? formatDateToTimeOption(new Date(participant.pm_time_in)) : 'N/A' },
        { text: participant.pm_time_out ? formatDateToTimeOption(new Date(participant.pm_time_out)) : 'N/A' },
        { text: participant.attendance_status ?? 'absent', style: `status${(participant.attendance_status ?? 'absent').charAt(0).toUpperCase() + (participant.attendance_status ?? 'absent').slice(1)}` }
      ])
    ];

    const document_definition: TDocumentDefinitions = {
      info: info,
      pageSize: 'A4',
      pageMargins: [20, 40, 20, 40],
      content: [
        {
          text: event_details.event_name,
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 5]
        },
        {
          text: `${event_details.start_date} - ${event_details.end_date} • ${event_details.location || 'N/A'}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          text: `Daily Attendance Report - Day ${summary.day} (${summary.date})`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: tableBody
          },
          layout: 'lightHorizontalLines'
        },
        {
          columns: [
            { text: `Total Participants\n${summary.total_participants}`, style: 'summaryBox' },
            { text: `Present\n${summary.present}`, style: 'summaryBox' },
            { text: `Absent\n${summary.absent}`, style: 'summaryBox' }
          ],
          columnGap: 10,
          margin: [0, 20, 0, 0]
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
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'black'
        },
        statusComplete: {
          color: 'green'
        },
        statusIncomplete: {
          color: 'orange'
        },
        statusAbsent: {
          color: 'red'
        },
        summaryBox: {
          alignment: 'center',
          fontSize: 12,
          bold: true,
          margin: [0, 5, 0, 5]
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
    return await generatePDFFile(document_definition);
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    return { status: 500, message: "Failed to generate attendance report", data: null };
  }
}

async function generatePDFFile(documentDefinitions: TDocumentDefinitions, tableLayouts?: {
  [name: string]: CustomTableLayout;
}, fonts?: TFontDictionary, vfs?: {
  [file: string]: string;
}): Promise<HelperResponse<string | null>> {
  try {
    const { valid, data } = await new Promise<{
      valid: boolean;
      data: string | null;
    }>((resolve, reject) => {
      try {
        pdfMake.createPdf(documentDefinitions, tableLayouts, fonts, vfs).getDataUrl((dataUrl) => {
          if (dataUrl) {
            resolve({
              valid: true,
              data: dataUrl
            });
          } else {
            reject({
              valid: false,
              data: "Failed to generate PDF data URL"
            });
          }
        });
      } catch (error) {
        reject({
          valid: false,
          data: (error as Error).message ?? "Failed to generate PDF data URL"
        });
      }
    });
    if (!valid) {
      return { status: 500, message: data ?? "Failed to generate QR codes" };
    }
    return {
      status: 200,
      message: "PDF generated successfully",
      data
    };
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    return { status: 500, message: (error as Error).message ?? "Failed to generate PDF" };
  }
}