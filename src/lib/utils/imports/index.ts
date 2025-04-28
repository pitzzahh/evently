import type { HelperResponse } from '@/types/generic';
import { levenshteinDistance } from '../math';

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
			.replace(/[^a-z]/g, '_'); // Replace non-letters with underscore

	const normalizedHeaders = headers.map(normalizeHeader);
	const normalizedRequired = requiredHeaders.map(normalizeHeader);

	const missingHeaders = normalizedRequired.filter(
		(required) => !normalizedHeaders.includes(required)
	);

	if (missingHeaders.length > 0) {
		const suggestions: string[] = [];

		for (const missing of missingHeaders) {
			let closestMatch = '';
			let smallestDistance = Infinity;

			for (const incoming of normalizedHeaders) {
				const distance = levenshteinDistance(missing, incoming);

				if (distance && distance < smallestDistance) {
					smallestDistance = distance;
					closestMatch = incoming;
				}
			}

			// If the closest match is reasonably close (e.g., 1-2 edits away), suggest it
			if (smallestDistance <= 2 && closestMatch) {
				suggestions.push(
					`  - Missing "${missing.split('_').join(' ')}" (Did you mean "${closestMatch.split('_').join(' ')}"?)`
				);
			} else {
				suggestions.push(`  - Missing "${missing.split('_').join(' ')}"`);
			}
		}

		return {
			status: 400,
			message: `Excel header validation failed:\n${suggestions.join('\n')}`,
			data: false
		};
	}

	const extraHeaders = normalizedHeaders.filter((header) => !normalizedRequired.includes(header));

	if (extraHeaders.length > 0) {
		return {
			status: 200,
			message: `Excel headers validated.\nNote: Found additional columns that will be ignored: ${extraHeaders.join(', ')}`,
			data: true
		};
	}

	return {
		status: 200,
		message: 'Excel headers validation successful.',
		data: true
	};
}
