export const time_options = (() => {
	const times: string[] = [];
	for (let hour = 0; hour < 24; hour++) {
		const period = hour < 12 ? 'AM' : 'PM';
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		times.push(`${displayHour}:00 ${period}`);
		times.push(`${displayHour}:10 ${period}`);
		times.push(`${displayHour}:20 ${period}`);
		times.push(`${displayHour}:30 ${period}`);
		times.push(`${displayHour}:40 ${period}`);
		times.push(`${displayHour}:50 ${period}`);
	}
	return times;
})();


