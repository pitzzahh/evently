import type { Participant } from "@/db/models/types";
import ExcelJS from 'exceljs';

export async function readParticipants(filePath: string, event_id: string): Promise<Omit<Participant, 'id'>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet('participants');

  if (!worksheet) {
    throw new Error('Worksheet "participants" not found in the Excel file');
  }

  const participants = worksheet.getSheetValues()
    .slice(2) // Skip header row
    .filter(row => Array.isArray(row) && row.length > 1) // Filter out empty rows
    .map(row => {
      if (!row) {
        throw new Error('Row is null or undefined');
      }
      if (!Array.isArray(row)) {
        throw new Error('Row is not an array');
      }
      const [last_name, first_name, middle_name, email] = row.slice(1, 5);
      return {
        first_name: first_name as string,
        middle_name: middle_name as string,
        last_name: last_name as string,
        email: email as string,
        event_id,
        created: new Date(),
        updated: new Date()
      };
    });

  return participants;
}