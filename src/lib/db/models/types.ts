import type { ClassProperties } from "@/types/generic";
import type { AttendanceRecordCollection, EventDetailsCollection, EventScheduleCollection, NoteCollection, ParticipantCollection, QRCodeCollection } from ".";

export type AttendanceRecord = Pick<AttendanceRecordCollection, 'id' | 'user_id' | 'event_id' | 'time_in' | 'time_out' | 'period' | 'created' | 'updated'>;
export type EventSchedule = Pick<EventScheduleCollection, 'id' | 'event_id' | 'event_date' | 'am_start' | 'am_end' | 'pm_start' | 'pm_end' | 'created' | 'updated'>;
export type EventDetails = Pick<EventDetailsCollection, 'id' | 'event_name' | 'start_date' | 'end_date' | 'created' | 'updated'>;
export type Note = Pick<NoteCollection, 'id' | 'title' | 'created' | 'updated'>;
export type Participant = Pick<ParticipantCollection, 'id' | 'first_name' | 'middle_initial' | 'last_name' | 'email' | 'created' | 'updated'>;
export type QRCode = Pick<QRCodeCollection, 'id' | 'code' | 'created' | 'updated'>;