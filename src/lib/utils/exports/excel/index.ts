import ExcelJS from 'exceljs';
import type { DocumentMetaDetails } from "@/types/exports";
import type { HelperResponse } from "@/types/generic";
import { formatDate, formatDateTime, formatDateToTimeOption } from "@/utils/format";
import { COLLECTIONS } from "@/db";
import type { TagVariant } from "..";

// Helper function to convert ArrayBuffer to binary string
function arrayBufferToBinaryString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}

export async function generateFullEventAttendanceReportExcel(
  props: DocumentMetaDetails
): Promise<HelperResponse<string | null>> {
  const { info, event_details, participants } = props;

  if (!participants || participants.length === 0) {
    return { status: 404, message: "No participants found to generate attendance report", data: null };
  }

  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = info.author || 'Evently System';
    workbook.lastModifiedBy = info.author || 'Evently System';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.title = `${event_details.event_name} - Full Attendance Report`;
    workbook.subject = 'Attendance Report';

    // Calculate the total number of days in the event
    const startDate = new Date(event_details.start_date);
    const endDate = new Date(event_details.end_date);
    const eventDurationMs = endDate.getTime() - startDate.getTime();
    const totalDays = Math.max(1, Math.ceil(eventDurationMs / (1000 * 60 * 60 * 24)));

    // Get all attendance records for this event
    const attendance_records = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION
      .find({ event_id: event_details.id })
      .fetch();

    // Get current date for event status determination
    const currentDate = new Date();

    // Create a map of attendance records by participant ID and day
    const attendanceByDay = new Map<number, Map<string, any>>();

    // Initialize attendance maps for each day
    for (let day = 1; day <= totalDays; day++) {
      attendanceByDay.set(day, new Map<string, any>());
    }

    // Organize attendance records by day and participant
    attendance_records.forEach(record => {
      const participantId = record.participant_id;
      // Always convert day to number for consistency
      const dayNumber = typeof record.day === 'string' ? parseInt(record.day) : record.day;

      if (!isNaN(dayNumber) && attendanceByDay.has(dayNumber)) {
        attendanceByDay.get(dayNumber)?.set(participantId, record);
      }
    });

    // Track overall attendance stats
    let totalAttendanceCount = 0;

    // Generate a worksheet for each day
    for (let day = 1; day <= totalDays; day++) {
      const dayDate = new Date(startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
      const dayAttendanceMap = attendanceByDay.get(day) || new Map();

      // Determine event status for this day
      let day_event_status = 'completed';
      if (currentDate < dayDate) {
        day_event_status = 'upcoming';
      } else if (
        currentDate.getFullYear() === dayDate.getFullYear() &&
        currentDate.getMonth() === dayDate.getMonth() &&
        currentDate.getDate() === dayDate.getDate()
      ) {
        day_event_status = 'ongoing';
      }

      // Process attendance for this day
      const dayParticipantAttendance = participants.map(participant => {
        const attendance = dayAttendanceMap.get(participant.id);

        // Determine attendance status
        let attendance_status: 'complete' | 'incomplete' | 'absent' = 'absent';
        if (attendance) {
          const hasAllCheckpoints = attendance.am_time_in && attendance.am_time_out &&
            attendance.pm_time_in && attendance.pm_time_out;
          attendance_status = hasAllCheckpoints ? 'complete' : 'incomplete';
        }

        return {
          ...participant,
          ...(attendance || {}),
          attendance_status,
          day_event_status
        };
      }).sort((a, b) => a.last_name.localeCompare(b.last_name));

      // Calculate day summary based on event status
      const presentCount = day_event_status === 'completed'
        ? dayParticipantAttendance.filter(p => p.attendance_status !== 'absent').length
        : dayParticipantAttendance.filter(p => p.am_time_in || p.pm_time_in).length;

      const absentCount = day_event_status === 'completed'
        ? participants.length - presentCount
        : 0;

      totalAttendanceCount += presentCount;

      // Create a worksheet for this day
      const worksheet = workbook.addWorksheet(`Day ${day} - ${formatDate(dayDate)}`, {
        properties: { tabColor: { argb: 'FF87CEEB' } }
      });

      // Set column widths
      worksheet.columns = [
        { header: 'Participant', key: 'participant', width: 30 },
        { header: 'AM Check-in', key: 'am_in', width: 15 },
        { header: 'AM Check-out', key: 'am_out', width: 15 },
        { header: 'PM Check-in', key: 'pm_in', width: 15 },
        { header: 'PM Check-out', key: 'pm_out', width: 15 },
        { header: 'Status', key: 'status', width: 20 }
      ];

      // Add event details header
      worksheet.mergeCells('A1:F1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = event_details.event_name;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:F2');
      const subtitleCell = worksheet.getCell('A2');
      subtitleCell.value = `${formatDateTime(event_details.start_date)} - ${formatDateTime(event_details.end_date)} • ${event_details.location || 'N/A'}`;
      subtitleCell.font = { size: 12, bold: true };
      subtitleCell.alignment = { horizontal: 'center' };

      worksheet.mergeCells('A3:F3');
      const dayHeaderCell = worksheet.getCell('A3');
      dayHeaderCell.value = `Day ${day} - ${formatDate(dayDate)} ${day_event_status !== 'completed' ? `(${day_event_status})` : ''}`;
      dayHeaderCell.font = { size: 14, bold: true };
      dayHeaderCell.alignment = { horizontal: 'center' };

      // Add category headers for time entries 
      worksheet.insertRow(4, [null, 'AM Time', null, 'PM Time', null, null]);

      // Merge cells for AM and PM time categories
      worksheet.mergeCells('B4:C4');
      worksheet.mergeCells('D4:E4');

      // Style the category headers
      const categoryRow = worksheet.getRow(4);
      categoryRow.font = { bold: true, size: 12 };
      categoryRow.alignment = { horizontal: 'center' };

      // Style the AM Time header
      const amTimeCell = categoryRow.getCell(2);
      amTimeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFAFA7A' } // Light yellow
      };
      amTimeCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Style the PM Time header
      const pmTimeCell = categoryRow.getCell(4);
      pmTimeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFAD5A5' } // Light orange
      };
      pmTimeCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Style the header row and make sure column headers are visible
      const headerRow = worksheet.getRow(5);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: 'center' };

      // Ensure each column header is properly set with right text
      headerRow.getCell(1).value = 'Participant';
      headerRow.getCell(2).value = 'AM Check-in';
      headerRow.getCell(3).value = 'AM Check-out';
      headerRow.getCell(4).value = 'PM Check-in';
      headerRow.getCell(5).value = 'PM Check-out';
      headerRow.getCell(6).value = 'Status';

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Add participant data - adjust row index to start from row 6 (was 5)
      dayParticipantAttendance.forEach((participant, index) => {
        let statusText = '';
        let statusColor = '';

        if (participant.day_event_status === 'ongoing') {
          statusText = 'Event is currently ongoing';
          statusColor = 'FFE6E6FA'; // Lavender
        } else if (participant.day_event_status === 'upcoming') {
          statusText = "Event hasn't started yet";
          statusColor = 'FFF0F8FF'; // Alice Blue
        } else {
          const attendance_status = participant.attendance_status;

          if (attendance_status === 'absent') {
            statusText = 'Absent';
            statusColor = 'FFFF6347'; // Tomato
          } else if (attendance_status === 'complete') {
            statusText = 'Complete Attendance';
            statusColor = 'FF90EE90'; // Light green
          } else {
            statusText = 'Incomplete Attendance';
            statusColor = 'FFFFD700'; // Gold
          }
        }

        const rowIndex = index + 6; // Start from row 6 (was 5, adjusted for new header row)
        const row = worksheet.getRow(rowIndex);

        row.getCell(1).value = `${participant.last_name}, ${participant.first_name}${participant.middle_name ? ' ' + participant.middle_name : ''}`;
        row.getCell(2).value = participant.am_time_in ? formatDateToTimeOption(new Date(participant.am_time_in)) : 'N/A';
        row.getCell(3).value = participant.am_time_out ? formatDateToTimeOption(new Date(participant.am_time_out)) : 'N/A';
        row.getCell(4).value = participant.pm_time_in ? formatDateToTimeOption(new Date(participant.pm_time_in)) : 'N/A';
        row.getCell(5).value = participant.pm_time_out ? formatDateToTimeOption(new Date(participant.pm_time_out)) : 'N/A';
        row.getCell(6).value = statusText;

        // Style the status cell
        const statusCell = row.getCell(6);
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: statusColor }
        };

        // Add borders to all cells in the row
        row.eachCell({ includeEmpty: true }, function (cell) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Add summary section
      const summaryRowIndex = dayParticipantAttendance.length + 8; // Leave some space after the table
      worksheet.mergeCells(`A${summaryRowIndex}:F${summaryRowIndex}`);
      const summaryHeaderCell = worksheet.getCell(`A${summaryRowIndex}`);
      summaryHeaderCell.value = 'Daily Summary';
      summaryHeaderCell.font = { bold: true, size: 12 };
      summaryHeaderCell.alignment = { horizontal: 'center' };

      worksheet.getCell(`A${summaryRowIndex + 2}`).value = 'Total Participants:';
      worksheet.getCell(`B${summaryRowIndex + 2}`).value = participants.length;
      worksheet.getCell(`A${summaryRowIndex + 2}`).font = { bold: true };

      if (day_event_status === 'completed') {
        worksheet.getCell(`A${summaryRowIndex + 3}`).value = 'Present:';
        worksheet.getCell(`B${summaryRowIndex + 3}`).value = presentCount;
        worksheet.getCell(`A${summaryRowIndex + 3}`).font = { bold: true };

        worksheet.getCell(`A${summaryRowIndex + 4}`).value = 'Absent:';
        worksheet.getCell(`B${summaryRowIndex + 4}`).value = absentCount;
        worksheet.getCell(`A${summaryRowIndex + 4}`).font = { bold: true };
      } else {
        worksheet.getCell(`A${summaryRowIndex + 3}`).value = 'Checked In:';
        worksheet.getCell(`B${summaryRowIndex + 3}`).value = presentCount;
        worksheet.getCell(`A${summaryRowIndex + 3}`).font = { bold: true };

        worksheet.getCell(`A${summaryRowIndex + 4}`).value = 'Status:';
        worksheet.getCell(`B${summaryRowIndex + 4}`).value = day_event_status;
        worksheet.getCell(`A${summaryRowIndex + 4}`).font = { bold: true };
      }
    }

    // Add overall summary sheet
    const summarySheet = workbook.addWorksheet('Event Summary', {
      properties: { tabColor: { argb: 'FF4682B4' } }
    });

    // Add event title and details to summary sheet
    summarySheet.mergeCells('A1:C1');
    summarySheet.getCell('A1').value = event_details.event_name;
    summarySheet.getCell('A1').font = { size: 16, bold: true };
    summarySheet.getCell('A1').alignment = { horizontal: 'center' };

    summarySheet.mergeCells('A2:C2');
    summarySheet.getCell('A2').value = `${formatDateTime(event_details.start_date)} - ${formatDateTime(event_details.end_date)} • ${event_details.location || 'N/A'}`;
    summarySheet.getCell('A2').font = { size: 12, bold: true };
    summarySheet.getCell('A2').alignment = { horizontal: 'center' };

    summarySheet.mergeCells('A3:C3');
    summarySheet.getCell('A3').value = 'Overall Event Attendance Summary';
    summarySheet.getCell('A3').font = { size: 14, bold: true };
    summarySheet.getCell('A3').alignment = { horizontal: 'center' };

    // Calculate overall attendance rate
    const averageAttendance = totalDays > 0 ? Math.round(totalAttendanceCount / totalDays) : 0;
    const attendanceRate = participants.length > 0
      ? ((averageAttendance / participants.length) * 100).toFixed(1)
      : "0.0";

    // Add summary data
    summarySheet.getCell('A5').value = 'Total Days:';
    summarySheet.getCell('B5').value = totalDays;
    summarySheet.getCell('A5').font = { bold: true };

    summarySheet.getCell('A6').value = 'Total Participants:';
    summarySheet.getCell('B6').value = participants.length;
    summarySheet.getCell('A6').font = { bold: true };

    summarySheet.getCell('A7').value = 'Average Daily Attendance:';
    summarySheet.getCell('B7').value = `${attendanceRate}%`;
    summarySheet.getCell('A7').font = { bold: true };

    // Adjust column widths in summary sheet
    summarySheet.getColumn('A').width = 25;
    summarySheet.getColumn('B').width = 15;
    summarySheet.getColumn('C').width = 15;

    // Convert workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Convert buffer to base64 data URL using browser-compatible approach
    const binaryString = arrayBufferToBinaryString(buffer);
    const base64 = btoa(binaryString);
    const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;

    return {
      status: 200,
      message: "Excel report generated successfully",
      data: dataUrl
    };
  } catch (error) {
    console.error(error);
    return { status: 500, message: (error as Error).message ?? "Failed to generate Excel report", data: null };
  }
}
