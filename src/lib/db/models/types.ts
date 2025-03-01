import type { AttendanceRecordCollection, EventDetailsCollection, EventScheduleCollection, ParticipantCollection, SettingsCollection } from ".";

export type AttendanceRecord = Pick<AttendanceRecordCollection, 'id' | 'user_id' | 'event_id' | 'time_in' | 'time_out' | 'period' | 'created' | 'updated'>;
export type EventSchedule = Pick<EventScheduleCollection, 'id' | 'event_id' | 'event_date' | 'am_start' | 'am_end' | 'pm_start' | 'pm_end' | 'created' | 'updated'>;
export type EventDetails = Pick<EventDetailsCollection, 'id' | 'event_name' | 'type' | 'location' | 'description' | 'is_multi_day' | 'difference_in_days' | 'start_date' | 'end_date' | 'settings_id' | 'created' | 'updated'>;
export type Participant = Pick<ParticipantCollection, 'id' | 'first_name' | 'middle_name' | 'last_name' | 'email' | 'event_id' | 'created' | 'updated'>;
export type Settings = Pick<SettingsCollection, 'id' | 'allow_add_participants_while_ongoing_event' | 'created' | 'updated'>;