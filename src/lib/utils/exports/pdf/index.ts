import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { createQrSvgString } from '@svelte-put/qr';
import type { Content, CustomTableLayout, TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';
import type { DocumentMetaDetails } from "@/types/exports";
import { formatDate, formatDateTime, formatDateToTimeOption } from "@/utils/format";
import { COLLECTIONS } from "@/db";
import type { HelperResponse } from "@/types/generic";
import { makeTag, type TagVariant } from "..";
import { getEventDayInfo } from "@routes/events/utils";

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
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 8],
          color: '#333',
          decoration: 'underline'
        },
        subheader: {
          fontSize: 12,
          bold: true,
          margin: [0, 8, 0, 4],
          color: '#555'
        },
        participantText: {
          fontSize: 11,
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
    // Determine event status
    const currentDate = new Date();
    const startDate = new Date(event_details.start_date);
    const endDate = new Date(event_details.end_date);
    let event_status = 'completed';
    if (currentDate < startDate) {
      event_status = 'upcoming';
    } else if (currentDate >= startDate && currentDate <= endDate) {
      event_status = 'ongoing';
    }

    // Get all attendance records for this event
    const attendance_records = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION
      .find({ event_id: event_details.id })
      .fetch();

    // Create a map of attendance records by participant ID
    const attendanceByParticipantId = new Map();
    attendance_records.forEach(record => {
      attendanceByParticipantId.set(record.participant_id, record);
    });

    // Create combined participant attendance data for all participants
    const participant_attendance = participants.map(participant => {
      const attendance = attendanceByParticipantId.get(participant.id);

      // Determine attendance status
      let attendance_status: 'complete' | 'incomplete' | 'absent' = 'absent';
      if (attendance) {
        // Check if all required check-ins/outs are present
        const hasAllCheckpoints = attendance.am_time_in && attendance.am_time_out &&
          attendance.pm_time_in && attendance.pm_time_out;
        attendance_status = hasAllCheckpoints ? 'complete' : 'incomplete';
      }

      return {
        ...participant,
        ...attendance,
        attendance_status
      };
    })
      // Sort participants by last name
      .sort((a, b) => a.last_name.localeCompare(b.last_name));

    console.log(`Participant Attendance Records: ${JSON.stringify(participant_attendance, null, 2)}`);

    const current_event_day =
      event_details
        ? getEventDayInfo(
          event_details.start_date,
          event_details.end_date,
          new Date()
        ).currentDay.toString()
        : null

    // Calculate the date for the current event day
    const currentEventDate = event_details && current_event_day && !isNaN(parseInt(current_event_day))
      ? new Date(new Date(event_details.start_date).getTime() + (parseInt(current_event_day) - 1) * 24 * 60 * 60 * 1000)
      : new Date();

    const summary = {
      day: current_event_day,
      date: formatDate(currentEventDate),
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
      ...participant_attendance.map(participant => {
        let statusText = '';
        let status_variant: TagVariant = 'default';

        // Check event status first
        if (event_status === 'ongoing') {
          statusText = 'Event is currently ongoing';
        } else if (event_status === 'upcoming') {
          statusText = "Event hasn't started yet";
          status_variant = 'secondary';
        } else {
          // Event is completed, check attendance status
          const attendance_status = participant.attendance_status ?? 'absent';

          if (attendance_status === 'absent') {
            statusText = 'Absent';
            status_variant = 'destructive';
          } else if (attendance_status === 'complete') {
            statusText = 'Complete Attendance';
          } else if (attendance_status === 'incomplete') {
            statusText = 'Incomplete Attendance';
            status_variant = 'outline';
          }
        }

        return [
          { text: `${participant.last_name}, ${participant.first_name}${participant.middle_name ? ' ' + participant.middle_name : ''}` },
          { text: participant.am_time_in ? formatDateToTimeOption(new Date(participant.am_time_in)) : 'N/A' },
          { text: participant.am_time_out ? formatDateToTimeOption(new Date(participant.am_time_out)) : 'N/A' },
          { text: participant.pm_time_in ? formatDateToTimeOption(new Date(participant.pm_time_in)) : 'N/A' },
          { text: participant.pm_time_out ? formatDateToTimeOption(new Date(participant.pm_time_out)) : 'N/A' },
          makeTag(statusText, Math.max(40, 10 + statusText.length * 4), status_variant)
        ];
      })
    ];

    const document_definition: TDocumentDefinitions = {
      info: info,
      pageSize: 'LEGAL',
      pageOrientation: 'landscape', // Change to landscape for better column visibility
      pageMargins: [20, 40, 20, 40],
      header: {
        text: event_details.event_name,
        alignment: 'center',
        margin: [0, 15, 0, 0],
        fontSize: 16,
        bold: true
      },
      content: [
        {
          text: `${formatDateTime(event_details.start_date)} - ${formatDateTime(event_details.end_date)} • ${event_details.location || 'N/A'}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 15]
        },
        {
          text: `Daily Attendance Report - Day ${summary.day} (${summary.date})`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 8]
        },
        {
          table: {
            headerRows: 1,
            widths: ['20%', '15%', '15%', '15%', '15%', '20%'], // Explicit width percentages
            body: tableBody
          },
          layout: {
            hLineWidth: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 2 : 1;
            },
            vLineWidth: function (_i, _node) {
              return 1;
            },
            hLineColor: function (i) {
              return i === 0 ? '#000' : '#aaa';
            },
            vLineColor: function () {
              return '#aaa';
            },
            paddingLeft: function () { return 4; },
            paddingRight: function () { return 4; },
            paddingTop: function () { return 4; },
            paddingBottom: function () { return 4; }
          }
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
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 8],
          color: '#333',
          decoration: 'underline'
        },
        subheader: {
          fontSize: 12,
          bold: true,
          margin: [0, 8, 0, 4],
          color: '#555'
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'black'
        },
        statusComplete: {
          color: 'white',
          background: '#16a34a',  // green-600
          bold: true
        },
        statusIncomplete: {
          color: 'white',
          background: '#ca8a04',  // yellow-600
          bold: true
        },
        statusAbsent: {
          color: 'white',
          background: '#dc2626',  // red-600
          bold: true
        },
        statusOngoing: {
          color: '#374151',  // gray-700
          bold: true
        },
        statusUpcoming: {
          color: '#374151',  // gray-700
          bold: true
        },
        summaryBox: {
          alignment: 'center',
          fontSize: 11,
          bold: true,
          margin: [0, 4, 0, 4]
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

export async function generateFullEventAttendanceReportPDF(
  props: DocumentMetaDetails,
  separate_files: boolean = false
): Promise<HelperResponse<string | null> | HelperResponse<string[]>> {
  const { info, event_details, participants } = props;

  if (!participants || participants.length === 0) {
    return { status: 404, message: "No participants found to generate attendance report", data: null };
  }

  try {
    // Calculate the total number of days in the event - fix day calculation
    const startDate = new Date(event_details.start_date);
    const endDate = new Date(event_details.end_date);
    const eventDurationMs = endDate.getTime() - startDate.getTime();
    // Ensure we get the correct number of days for both single and multi-day events
    const totalDays = Math.max(1, Math.ceil(eventDurationMs / (1000 * 60 * 60 * 24)));

    // Get all attendance records for this event
    const attendance_records = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION
      .find({ event_id: event_details.id })
      .fetch();

    console.log(`Found ${attendance_records.length} attendance records for event`, attendance_records);

    // If separateFiles is true, generate a separate PDF for each day
    if (separate_files) {
      const pdfPromises: Promise<HelperResponse<string | null>>[] = [];

      // We need to manually handle filtering by day since we can't modify DocumentMetaDetails
      for (let day = 1; day <= totalDays; day++) {
        // Create a mock function to generate attendance for specific day
        // This is a workaround since we can't modify DocumentMetaDetails type
        const generateDayReport = async (): Promise<HelperResponse<string | null>> => {
          try {
            // Filter attendance records for this specific day - fix string comparison
            const dayAttendanceRecords = attendance_records.filter(record => record.day === day.toString());

            // Create a map of attendance records by participant ID for this day
            const dayAttendanceByParticipantId = new Map();
            dayAttendanceRecords.forEach(record => {
              dayAttendanceByParticipantId.set(record.participant_id, record);
            });

            // Calculate the date for this day
            const dayDate = new Date(startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);

            // Process attendance for this day
            const dayParticipantAttendance = participants.map(participant => {
              const attendance = dayAttendanceByParticipantId.get(participant.id);

              // Determine attendance status for this day
              let attendance_status: 'complete' | 'incomplete' | 'absent' = 'absent';
              if (attendance) {
                const hasAllCheckpoints = attendance.am_time_in && attendance.am_time_out &&
                  attendance.pm_time_in && attendance.pm_time_out;
                attendance_status = hasAllCheckpoints ? 'complete' : 'incomplete';
              }

              return {
                ...participant,
                ...(attendance || {}),
                attendance_status
              };
            }).sort((a, b) => a.last_name.localeCompare(b.last_name));

            // Calculate day summary
            const presentCount = dayParticipantAttendance.filter(p => p.attendance_status !== 'absent').length;

            const daySummary = {
              day,
              date: formatDate(dayDate),
              total_participants: participants.length,
              present: presentCount,
              absent: participants.length - presentCount
            };

            // Create table for this day
            const dayTableBody = [
              [
                { text: 'Participant', style: 'tableHeader' },
                { text: 'AM Check-in', style: 'tableHeader' },
                { text: 'AM Check-out', style: 'tableHeader' },
                { text: 'PM Check-in', style: 'tableHeader' },
                { text: 'PM Check-out', style: 'tableHeader' },
                { text: 'Status', style: 'tableHeader' }
              ],
              ...dayParticipantAttendance.map(participant => {
                let statusText = '';
                let status_variant: TagVariant = 'default';

                const attendance_status = participant.attendance_status ?? 'absent';

                if (attendance_status === 'absent') {
                  statusText = 'Absent';
                  status_variant = 'destructive';
                } else if (attendance_status === 'complete') {
                  statusText = 'Complete Attendance';
                } else if (attendance_status === 'incomplete') {
                  statusText = 'Incomplete Attendance';
                  status_variant = 'outline';
                }

                return [
                  { text: `${participant.last_name}, ${participant.first_name}${participant.middle_name ? ' ' + participant.middle_name : ''}` },
                  { text: participant.am_time_in ? formatDateToTimeOption(new Date(participant.am_time_in)) : 'N/A' },
                  { text: participant.am_time_out ? formatDateToTimeOption(new Date(participant.am_time_out)) : 'N/A' },
                  { text: participant.pm_time_in ? formatDateToTimeOption(new Date(participant.pm_time_in)) : 'N/A' },
                  { text: participant.pm_time_out ? formatDateToTimeOption(new Date(participant.pm_time_out)) : 'N/A' },
                  makeTag(statusText, Math.max(40, 10 + statusText.length * 4), status_variant)
                ];
              })
            ];

            // Generate document definition for this day
            const document_definition: TDocumentDefinitions = {
              info: info,
              pageSize: 'LEGAL',
              pageOrientation: 'landscape',
              pageMargins: [20, 40, 20, 40],
              header: {
                text: event_details.event_name,
                alignment: 'center',
                margin: [0, 15, 0, 0],
                fontSize: 16,
                bold: true
              },
              content: [
                {
                  text: `${formatDateTime(event_details.start_date)} - ${formatDateTime(event_details.end_date)} • ${event_details.location || 'N/A'}`,
                  style: 'subheader',
                  alignment: 'center',
                  margin: [0, 0, 0, 15]
                },
                {
                  text: `Daily Attendance Report - Day ${daySummary.day} (${daySummary.date})`,
                  style: 'subheader',
                  alignment: 'center',
                  margin: [0, 0, 0, 8]
                },
                {
                  table: {
                    headerRows: 1,
                    widths: ['20%', '15%', '15%', '15%', '15%', '20%'],
                    body: dayTableBody
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return (i === 0 || i === node.table.body.length) ? 2 : 1;
                    },
                    vLineWidth: function (_i, _node) {
                      return 1;
                    },
                    hLineColor: function (i) {
                      return i === 0 ? '#000' : '#aaa';
                    },
                    vLineColor: function () {
                      return '#aaa';
                    },
                    paddingLeft: function () { return 4; },
                    paddingRight: function () { return 4; },
                    paddingTop: function () { return 4; },
                    paddingBottom: function () { return 4; }
                  }
                },
                {
                  columns: [
                    { text: `Total Participants\n${daySummary.total_participants}`, style: 'summaryBox' },
                    { text: `Present\n${daySummary.present}`, style: 'summaryBox' },
                    { text: `Absent\n${daySummary.absent}`, style: 'summaryBox' }
                  ],
                  columnGap: 10,
                  margin: [0, 20, 0, 0]
                }
              ],
              styles: {
                header: {
                  fontSize: 16,
                  bold: true,
                  margin: [0, 0, 0, 8],
                  color: '#333',
                  decoration: 'underline'
                },
                subheader: {
                  fontSize: 12,
                  bold: true,
                  margin: [0, 8, 0, 4],
                  color: '#555'
                },
                tableHeader: {
                  bold: true,
                  fontSize: 11,
                  color: 'black'
                },
                summaryBox: {
                  alignment: 'center',
                  fontSize: 11,
                  bold: true,
                  margin: [0, 4, 0, 4]
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

            // Generate PDF and return result
            return await generatePDFFile(document_definition);
          } catch (error) {
            console.error(`Error generating day ${day} report:`, error);
            return { status: 500, message: `Failed to generate report for day ${day}`, data: null };
          }
        };

        pdfPromises.push(generateDayReport());
      }

      const results = await Promise.all(pdfPromises);
      const validResults = results.filter(r => r.status === 200 && r.data) as HelperResponse<string>[];

      if (validResults.length === 0) {
        return { status: 500, message: "Failed to generate any day reports", data: null };
      }

      return {
        status: 200,
        message: `Generated ${validResults.length} of ${totalDays} day reports successfully`,
        data: validResults.map(r => r.data!) as string[]
      };
    }

    // Generate a single PDF with all days
    // Create a map of attendance records by participant ID and day
    const attendanceByDay = new Map<number, Map<string, any>>();

    // Initialize attendance maps for each day
    for (let day = 1; day <= totalDays; day++) {
      attendanceByDay.set(day, new Map<string, any>());
    }

    // Organize attendance records by day and participant - fix string to number conversion
    attendance_records.forEach(record => {
      const participantId = record.participant_id;
      const dayNumber = parseInt(record.day);

      if (!isNaN(dayNumber) && attendanceByDay.has(dayNumber)) {
        attendanceByDay.get(dayNumber)?.set(participantId, record);
      }
    });

    // Content array for the PDF
    const contentSections: Content[] = [];

    // Add header information
    contentSections.push(
      {
        text: `Full Event Attendance Report`,
        style: 'title',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        text: `${formatDateTime(event_details.start_date)} - ${formatDateTime(event_details.end_date)} • ${event_details.location || 'N/A'}`,
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      }
    );

    // Track overall attendance stats
    let totalAttendanceCount = 0;

    // Generate content for each day
    for (let day = 1; day <= totalDays; day++) {
      const dayDate = new Date(startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
      const dayAttendanceMap = attendanceByDay.get(day) || new Map();

      console.log(`Processing day ${day} with ${dayAttendanceMap.size} attendance records`);

      // Process attendance for this day
      const dayParticipantAttendance = participants.map(participant => {
        // Ensure we're comparing the same types for ID lookup
        const participantId = participant.id;
        const attendance = dayAttendanceMap.get(participantId);

        // Debug the lookup
        if (attendance) {
          console.log(`Found attendance for ${participant.first_name} ${participant.last_name}:`, attendance);
        }

        // Determine attendance status
        let attendance_status: 'complete' | 'incomplete' | 'absent' = 'absent';
        if (attendance) {
          const hasAllCheckpoints = attendance.am_time_in && attendance.am_time_out &&
            attendance.pm_time_in && attendance.pm_time_out;
          attendance_status = hasAllCheckpoints ? 'complete' : 'incomplete';
        }

        // Directly copy the attendance fields to ensure they are available
        return {
          ...participant,
          attendance_status,
          am_time_in: attendance?.am_time_in || null,
          am_time_out: attendance?.am_time_out || null,
          pm_time_in: attendance?.pm_time_in || null,
          pm_time_out: attendance?.pm_time_out || null
        };
      }).sort((a, b) => a.last_name.localeCompare(b.last_name));

      // Calculate day summary
      const presentCount = dayParticipantAttendance.filter(p => p.attendance_status !== 'absent').length;
      totalAttendanceCount += presentCount;

      const daySummary = {
        day,
        date: formatDate(dayDate),
        total_participants: participants.length,
        present: presentCount,
        absent: participants.length - presentCount
      };

      // Create table for this day
      const dayTableBody = [
        [
          { text: 'Participant', style: 'tableHeader' },
          { text: 'AM Check-in', style: 'tableHeader' },
          { text: 'AM Check-out', style: 'tableHeader' },
          { text: 'PM Check-in', style: 'tableHeader' },
          { text: 'PM Check-out', style: 'tableHeader' },
          { text: 'Status', style: 'tableHeader' }
        ],
        ...dayParticipantAttendance.map(participant => {
          let statusText = '';
          let status_variant: TagVariant = 'default';

          const attendance_status = participant.attendance_status ?? 'absent';

          if (attendance_status === 'absent') {
            statusText = 'Absent';
            status_variant = 'destructive';
          } else if (attendance_status === 'complete') {
            statusText = 'Complete Attendance';
          } else if (attendance_status === 'incomplete') {
            statusText = 'Incomplete Attendance';
            status_variant = 'outline';
          }

          return [
            { text: `${participant.last_name}, ${participant.first_name}${participant.middle_name ? ' ' + participant.middle_name : ''}` },
            { text: participant.am_time_in ? formatDateToTimeOption(new Date(participant.am_time_in)) : 'N/A' },
            { text: participant.am_time_out ? formatDateToTimeOption(new Date(participant.am_time_out)) : 'N/A' },
            { text: participant.pm_time_in ? formatDateToTimeOption(new Date(participant.pm_time_in)) : 'N/A' },
            { text: participant.pm_time_out ? formatDateToTimeOption(new Date(participant.pm_time_out)) : 'N/A' },
            makeTag(statusText, Math.max(40, 10 + statusText.length * 4), status_variant)
          ];
        })
      ];

      // Add this day's section to the content
      contentSections.push(
        {
          text: `Day ${day} - ${daySummary.date}`,
          style: 'dayHeader',
          margin: [0, 15, 0, 8],
          pageBreak: day === 1 ? undefined : 'before'
        },
        {
          table: {
            headerRows: 1,
            widths: ['20%', '15%', '15%', '15%', '15%', '20%'] as string[],
            body: dayTableBody
          },
          layout: {
            hLineWidth: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 2 : 1;
            },
            vLineWidth: function (_i, _node) {
              return 1;
            },
            hLineColor: function (i: number): string {
              return i === 0 ? '#000' : '#aaa';
            },
            vLineColor: function (): string {
              return '#aaa';
            },
            paddingLeft: function (): number { return 4; },
            paddingRight: function (): number { return 4; },
            paddingTop: function (): number { return 4; },
            paddingBottom: function (): number { return 4; }
          }
        },
        {
          columns: [
            { text: `Total Participants\n${daySummary.total_participants}`, style: 'summaryBox' },
            { text: `Present\n${daySummary.present}`, style: 'summaryBox' },
            { text: `Absent\n${daySummary.absent}`, style: 'summaryBox' }
          ],
          columnGap: 10,
          margin: [0, 10, 0, 0]
        }
      );
    }

    // Calculate overall attendance rate
    const averageAttendance = totalDays > 0 ? Math.round(totalAttendanceCount / totalDays) : 0;
    const attendanceRate = participants.length > 0
      ? ((averageAttendance / participants.length) * 100).toFixed(1)
      : "0.0";

    // Add overall summary
    contentSections.push(
      {
        text: 'Overall Event Attendance Summary',
        style: 'dayHeader',
        margin: [0, 20, 0, 10],
        pageBreak: 'before'
      },
      {
        columns: [
          { text: `Total Days\n${totalDays}`, style: 'summaryBox' },
          { text: `Average Daily Attendance\n${attendanceRate}%`, style: 'summaryBox' },
          { text: `Total Participants\n${participants.length}`, style: 'summaryBox' }
        ],
        columnGap: 10,
        margin: [0, 10, 0, 0]
      }
    );

    const document_definition: TDocumentDefinitions = {
      info: info,
      pageSize: 'LEGAL',
      pageOrientation: 'landscape',
      pageMargins: [20, 40, 20, 40],
      header: {
        text: event_details.event_name,
        alignment: 'center',
        margin: [0, 15, 0, 0],
        fontSize: 16,
        bold: true
      },
      content: contentSections,
      styles: {
        title: {
          fontSize: 18,
          bold: true,
          color: '#333'
        },
        subheader: {
          fontSize: 12,
          bold: true,
          color: '#555'
        },
        dayHeader: {
          fontSize: 14,
          bold: true,
          color: '#333',
          decoration: 'underline'
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'black'
        },
        summaryBox: {
          alignment: 'center',
          fontSize: 11,
          bold: true,
          margin: [0, 4, 0, 4]
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
    return { status: 500, message: "Failed to generate full event attendance report", data: null };
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