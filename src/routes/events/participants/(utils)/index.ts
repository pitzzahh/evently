import type {
	AttendanceRecordCollection,
	EventScheduleCollection,
	ParticipantCollection
} from '@/db/models';
import type { EventSchedule, ParticipantAttendance } from '@/db/models/types';
import { getTimeDifference } from '@routes/events/utils';

export function getPopulatedAttendanceRecords(
	event_id: string,
	collections: {
		attendance_records_collection: AttendanceRecordCollection;
		participant_collection: ParticipantCollection;
		event_schedules_collection: EventScheduleCollection;
	},
	current_event_day?: string
): ParticipantAttendance[] {
	const event_schedules = collections.event_schedules_collection
		.find({
			event_id
		})
		.fetch();

	const attendance_records = collections.attendance_records_collection
		.find({
			event_id: event_id,
			...(current_event_day && { day: current_event_day })
		})
		.fetch();

	const participantIds = [...new Set(attendance_records.map((record) => record.participant_id))];

	const participants = collections.participant_collection
		.find({
			id: { $in: participantIds }
		})
		.fetch();

	const participant_map = new Map(participants.map((participant) => [participant.id, participant]));

	// return new combined objects without modifying originals
	return attendance_records
		.map((record) => {
			const participant = participant_map.get(record.participant_id);
			const matching_event_day_sched = event_schedules.find(
				(sched) => sched.day.toString() === record.day
			) as EventSchedule;
			const late_am_time_in_duration =
				record?.am_time_in && matching_event_day_sched.am_start
					? getTimeDifference(record?.am_time_in, matching_event_day_sched.am_start)
					: undefined;

			const late_pm_time_in_duration =
				record?.pm_time_in && matching_event_day_sched.pm_start
					? getTimeDifference(record?.pm_time_in, matching_event_day_sched.pm_start)
					: undefined;

			return {
				...record,
				first_name: participant?.first_name,
				middle_name: participant?.middle_name,
				last_name: participant?.last_name,
				email: participant?.email,
				participant,
				late_am_time_in_duration,
				late_pm_time_in_duration
			};
		})
		.sort(
			(a, b) => (b.latest_time_scanned?.getTime() ?? 0) - (a.latest_time_scanned?.getTime() ?? 0)
		) as ParticipantAttendance[];
}