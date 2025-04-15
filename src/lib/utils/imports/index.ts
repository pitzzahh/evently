import type { HelperResponse } from '@/types/generic';

/**
 * Validates that the Excel file headers match the required format for participant import
 * @param headers Array of header strings from the Excel file
 * @returns HelperResponse with validation result
 */
export function validateExcelHeaders(headers: string[]): HelperResponse<boolean> {
	const requiredHeaders = ['last_name', 'first_name', 'middle_name', 'email'];

	const normalizeHeader = (header: string) =>
		header
			.toLowerCase()
			.trim()
			.replace(/[\s_]+/g, '');

	const normalizedHeaders = headers.map(normalizeHeader);
	const normalizedRequired = requiredHeaders.map(normalizeHeader);

	const missingHeaders = normalizedRequired.filter((header) => !normalizedHeaders.includes(header));

	if (missingHeaders.length > 0) {
		return {
			status: 400,
			message: `Missing required headers: ${missingHeaders.join(', ')}`,
			data: false
		};
	}

	const extraHeaders = normalizedHeaders.filter((header) => !normalizedRequired.includes(header));

	if (extraHeaders.length > 0) {
		return {
			status: 200,
			message: `Excel headers validated. Note: Found additional columns that will be ignored: ${extraHeaders.join(', ')}`,
			data: true
		};
	}

	return {
		status: 200,
		message: 'Excel headers validation successful',
		data: true
	};
}
