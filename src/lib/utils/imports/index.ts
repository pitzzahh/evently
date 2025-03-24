import type { HelperResponse } from "@/types/generic";

/**
 * Validates that the Excel file headers match the required format for participant import
 * @param headers Array of header strings from the Excel file
 * @returns HelperResponse with validation result
 */
export function validateExcelHeaders(headers: string[]): HelperResponse<boolean> {
  // Required headers for participant import
  const requiredHeaders = ['last_name', 'first_name', 'middle_name', 'email'];

  // Convert headers to lowercase for case-insensitive comparison
  const normalizedHeaders = headers.map(header => header.toLowerCase().trim());

  // Check if all required headers are present
  const missingHeaders = requiredHeaders.filter(header =>
    !normalizedHeaders.includes(header)
  );

  if (missingHeaders.length > 0) {
    return {
      status: 400,
      message: `Missing required headers: ${missingHeaders.join(', ')}`,
      data: false
    };
  }

  // Check if there are any extra headers that are not required
  const extraHeaders = normalizedHeaders.filter(header =>
    !requiredHeaders.includes(header)
  );

  if (extraHeaders.length > 0) {
    // This is just a warning, not an error
    return {
      status: 200,
      message: `Excel headers validated. Note: Found additional columns that will be ignored: ${extraHeaders.join(', ')}`,
      data: true
    };
  }

  return {
    status: 200,
    message: "Excel headers validation successful",
    data: true
  };
}