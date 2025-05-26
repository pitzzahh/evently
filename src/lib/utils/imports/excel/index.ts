import type { Participant } from "@/db/models/types";
import ExcelJS from 'exceljs';
import { validateExcelHeaders } from "..";

export async function readParticipants(file: File, event_id: string): Promise<Omit<Participant, 'id'>[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error('First worksheet not found in the Excel file');
  }

  console.log('Worksheet found:', JSON.stringify(worksheet.name));

  // Extract headers from the first row
  const headerRow = worksheet.getRow(1).values;
  const headers = Array.isArray(headerRow)
    ? headerRow.slice(1).map(header => header?.toString() || '')
    : [];

  // Validate headers
  const validationResult = validateExcelHeaders(headers);

  if (validationResult.status !== 200) {
    throw new Error(validationResult.message);
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