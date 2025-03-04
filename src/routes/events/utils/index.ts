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
