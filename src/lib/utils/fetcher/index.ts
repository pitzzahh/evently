/**
 * Get the latest record based on the given date fields.
 * Supports handling of records with an optional end date where a null/undefined end indicates an ongoing status.
 * 
 * @param records - Array of records to search through.
 * @param startField - The key in each record representing the start date.
 * @param endField - The optional key in each record representing the end date.
 * @returns The latest record or null if no records are provided.
 */
export function getLatestRecord<T>(
	records: T[],
	startField: keyof T,
	endField?: keyof T
): T | null {
	if (records?.length === 0) return null;
	return records
		.filter(record => record[startField] instanceof Date) // Ensure start date exists and is a Date
		.sort((a, b) => {
			// Use endField if it exists and is a Date; otherwise, fallback to startField
			const dateA = (endField && a[endField] instanceof Date ? a[endField] : a[startField]) as Date;
			const dateB = (endField && b[endField] instanceof Date ? b[endField] : b[startField]) as Date;

			return dateB.getTime() - dateA.getTime();
		})[0] || null;
}
