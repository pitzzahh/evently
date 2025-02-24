import type { ClassProperties } from "@/types/generic";
import type { AttendanceRecordCollection, EventDetailsCollection, EventScheduleCollection, NoteCollection, ParticipantCollection, QRCodeCollection } from ".";

export type AttendanceRecord = ClassProperties<AttendanceRecordCollection>;
export type EventSchedule = ClassProperties<EventScheduleCollection>;
export type EventDetails = ClassProperties<EventDetailsCollection>;
export type Note = ClassProperties<NoteCollection>;
export type Participant = ClassProperties<ParticipantCollection>;
export type QRCode = ClassProperties<QRCodeCollection>;