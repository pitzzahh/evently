export function checkEventStatus(
	start_date?: Date,
	end_date?: Date
): 'ongoing' | 'finished' | 'upcoming' {
	return start_date &&
		end_date &&
		new Date() >= new Date(start_date) &&
		new Date() <= new Date(end_date)
		? 'ongoing'
		: end_date && new Date() > new Date(end_date)
			? 'finished'
			: 'upcoming';
}


/**
	 * Gets detailed information about the current event day and period
	 */
export function getEventDayInfo(
	startDate: Date,
	endDate: Date,
	currentDate: Date = new Date()
): {
	currentDay: number;
	totalDays: number;
	period: 'AM' | 'PM';
	isWithinEventDates: boolean;
	isBeforeEvent: boolean;
	isAfterEvent: boolean;
} {
	// Normalize dates for day comparison
	const normalizedStart = new Date(startDate);
	normalizedStart.setHours(0, 0, 0, 0);

	const normalizedEnd = new Date(endDate);
	normalizedEnd.setHours(23, 59, 59, 999);

	const normalizedCurrent = new Date(currentDate);
	normalizedCurrent.setHours(0, 0, 0, 0);

	// Calculate total event days (inclusive)
	const totalDays =
		Math.floor((normalizedEnd.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

	// Calculate which day we're on (1-based)
	const dayDiff = Math.floor(
		(normalizedCurrent.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)
	);
	const currentDay = dayDiff + 1;

	// Determine period (AM/PM)
	const period = currentDate.getHours() < 12 ? 'AM' : 'PM';

	// Determine if date is within event range
	const isBeforeEvent = currentDate < startDate;
	const isAfterEvent = currentDate > normalizedEnd;
	const isWithinEventDates = !isBeforeEvent && !isAfterEvent;

	return {
		currentDay,
		totalDays,
		period,
		isWithinEventDates,
		isBeforeEvent,
		isAfterEvent
	};
}
