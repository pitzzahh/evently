import type {
	AttendanceRecordCollection,
	EventDetailsCollection,
	EventScheduleCollection,
	ParticipantCollection,
	SettingsCollection
} from '.';

export type AttendanceRecord = Pick<
	AttendanceRecordCollection,
	| 'id'
	| 'participant_id'
	| 'event_id'
	| 'pm_time_in'
	| 'pm_time_out'
	| 'am_time_in'
	| 'am_time_out'
	| 'latest_time_scanned'
	| 'day'
	| 'created'
	| 'updated'
>;
export type ParticipantAttendance = (AttendanceRecord & Partial<Participant>) & {
	participant?: Participant[];
	late_am_time_in_duration?: string
	late_pm_time_in_duration?: string
};

export type EventSchedule = Pick<
	EventScheduleCollection,
	| 'id'
	| 'event_id'
	| 'event_date'
	| 'am_start'
	| 'am_end'
	| 'pm_start'
	| 'pm_end'
	| 'created'
	| 'updated'
	| 'day'
>;
export type EventDetails = Pick<
	EventDetailsCollection,
	| 'id'
	| 'event_name'
	| 'type'
	| 'location'
	| 'description'
	| 'is_multi_day'
	| 'difference_in_days'
	| 'start_date'
	| 'end_date'
	| 'settings_id'
	| 'cover'
	| 'created'
	| 'updated'
>;
export type Participant = Pick<
	ParticipantCollection,
	'id' | 'first_name' | 'middle_name' | 'last_name' | 'email' | 'event_id' | 'qr' | 'created' | 'updated'
> & { attendance_status?: 'complete' | 'incomplete' | 'absent' };
export type Settings = Pick<
	SettingsCollection,
	'id' | 'allow_add_participants_while_ongoing_event' | 'created' | 'updated'
>;
