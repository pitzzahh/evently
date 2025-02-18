/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	AttendanceRecords = "attendance_records",
	EventSchedules = "event_schedules",
	Events = "events",
	Notes = "notes",
	Participants = "participants",
	QrCodes = "qr_codes",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type AttendanceRecordsRecord = {
	created?: IsoDateString
	event_id: RecordIdString
	id: string
	period: string
	time_in?: IsoDateString
	time_out?: IsoDateString
	updated?: IsoDateString
	user_id: RecordIdString
}

export type EventSchedulesRecord = {
	am_end?: IsoDateString
	am_start?: IsoDateString
	created?: IsoDateString
	event_date?: IsoDateString
	event_id?: RecordIdString
	id: string
	pm_end?: IsoDateString
	pm_start?: IsoDateString
	updated?: IsoDateString
}

export type EventsRecord = {
	created?: IsoDateString
	end_date?: IsoDateString
	id: string
	name?: string
	start_date?: IsoDateString
	updated?: IsoDateString
}

export type NotesRecord = {
	created?: IsoDateString
	id: string
	title?: string
	updated?: IsoDateString
}

export type ParticipantsRecord = {
	created?: IsoDateString
	email?: string
	first_name: string
	id: string
	last_name: string
	middle_initial?: string
	updated?: IsoDateString
}

export type QrCodesRecord = {
	created?: IsoDateString
	id: string
	updated?: IsoDateString
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AttendanceRecordsResponse<Texpand = unknown> = Required<AttendanceRecordsRecord> & BaseSystemFields<Texpand>
export type EventSchedulesResponse<Texpand = unknown> = Required<EventSchedulesRecord> & BaseSystemFields<Texpand>
export type EventsResponse<Texpand = unknown> = Required<EventsRecord> & BaseSystemFields<Texpand>
export type NotesResponse<Texpand = unknown> = Required<NotesRecord> & BaseSystemFields<Texpand>
export type ParticipantsResponse<Texpand = unknown> = Required<ParticipantsRecord> & BaseSystemFields<Texpand>
export type QrCodesResponse<Texpand = unknown> = Required<QrCodesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	attendance_records: AttendanceRecordsRecord
	event_schedules: EventSchedulesRecord
	events: EventsRecord
	notes: NotesRecord
	participants: ParticipantsRecord
	qr_codes: QrCodesRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	attendance_records: AttendanceRecordsResponse
	event_schedules: EventSchedulesResponse
	events: EventsResponse
	notes: NotesResponse
	participants: ParticipantsResponse
	qr_codes: QrCodesResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'attendance_records'): RecordService<AttendanceRecordsResponse>
	collection(idOrName: 'event_schedules'): RecordService<EventSchedulesResponse>
	collection(idOrName: 'events'): RecordService<EventsResponse>
	collection(idOrName: 'notes'): RecordService<NotesResponse>
	collection(idOrName: 'participants'): RecordService<ParticipantsResponse>
	collection(idOrName: 'qr_codes'): RecordService<QrCodesResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
