/** 
  Determines the status of an event based on the current date.
	 - 'ongoing' if the current date is between start_date and end_date.
	 - 'finished' if the current date is past end_date.
	 - 'upcoming' otherwise.
*/
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
 Provides detailed information about the current day within an event.
	- Computes the difference between two dates in hours and minutes.
	 - Ignores seconds and milliseconds for precision at the minute level.
	 - Returns a formatted string like "2 hours 30 minutes".
	 - Returns undefined if there's no difference.
 */
export function getTimeDifference(date1: Date, date2: Date) {
	const truncatedDate1 = new Date(date1);
	truncatedDate1.setSeconds(0, 0);

	const truncatedDate2 = new Date(date2);
	truncatedDate2.setSeconds(0, 0);

	const diffMs = Math.abs(truncatedDate1.getTime() - truncatedDate2.getTime());
	const diffMinutes = Math.floor(diffMs / (1000 * 60));

	const hours = Math.floor(diffMinutes / 60);
	const minutes = diffMinutes % 60;

	if (!minutes && !hours) {
		return;
	}

	return `${hours ? `${hours} hour${hours > 1 ? 's' : ''} ` : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/**
 Provides detailed information about the current day within an event.
 - Determines which day of the event it is (1-based index).
 - Calculates the total number of event days.
 - Identifies if the current time is in the AM or PM.
 - Checks if the event is ongoing, has not started yet, or has ended.
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
	const normalizedStart = new Date(startDate);
	normalizedStart.setHours(0, 0, 0, 0);

	const normalizedEnd = new Date(endDate);
	normalizedEnd.setHours(23, 59, 59, 999);

	const normalizedCurrent = new Date(currentDate);
	normalizedCurrent.setHours(0, 0, 0, 0);

	const totalDays =
		Math.floor((normalizedEnd.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

	const dayDiff = Math.floor(
		(normalizedCurrent.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)
	);
	const currentDay = dayDiff + 1;

	const period = currentDate.getHours() < 12 ? 'AM' : 'PM';

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
