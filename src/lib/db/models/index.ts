import { svelteReactivityAdapter } from '@/db/adapter/index.svelte';
import { createIndex, Collection } from '@signaldb/core';
import createOPFSAdapter from '@signaldb/opfs';
import type { AttendanceRecord, EventDetails, EventSchedule, Participant, Settings } from './types';
import { COLLECTIONS } from '..';

export class AttendanceRecordCollection extends Collection<AttendanceRecord> {
  id!: string;
  user_id!: string;
  event_id!: string;
  time_in?: Date;
  time_out?: Date;
  period!: string;
  created?: Date;
  updated?: Date;

  constructor(data?: AttendanceRecord) {
    super({
      name: 'attendance_records',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('attendance_records.json'),
      transform: (d) => ({
        ...d,
        time_in: d.time_in ? new Date(d.time_in) : undefined,
        time_out: d.time_out ? new Date(d.time_out) : undefined,
        created: d.created ? new Date(d.created) : undefined,
        updated: d.updated ? new Date(d.updated) : undefined
      }),
      indices: [
        createIndex('user_id'),
        createIndex('event_id'),
        createIndex('time_in'),
        createIndex('time_out'),
        createIndex('period')
      ]
    })
    if (!data) return
    this.id = data.id;
    this.user_id = data.user_id;
    this.event_id = data.event_id;
    this.time_in = data.time_in ? new Date(data.time_in) : undefined;
    this.time_out = data.time_out ? new Date(data.time_out) : undefined;
    this.period = data.period;
    this.created = data.created ? new Date(data.created) : undefined;
    this.updated = data.updated ? new Date(data.updated) : undefined;
  }

  getByID(id: string) {
    return this.findOne({ id });
  }
}

export class EventScheduleCollection extends Collection<EventSchedule> {
  id!: string;
  event_id!: string;
  event_date!: Date;
  am_start?: Date;
  am_end?: Date;
  pm_start?: Date;
  pm_end?: Date;
  created?: Date;
  updated?: Date;

  constructor(data?: EventSchedule) {
    super({
      name: 'event_schedules',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('event_schedules.json'),
      transform: (d) => ({
        ...d,
        event_date: new Date(d.event_date),
        am_start: d.am_start ? new Date(d.am_start) : undefined,
        am_end: d.am_end ? new Date(d.am_end) : undefined,
        pm_start: d.pm_start ? new Date(d.pm_start) : undefined,
        pm_end: d.pm_end ? new Date(d.pm_end) : undefined,
        created: d.created ? new Date(d.created) : undefined,
        updated: d.updated ? new Date(d.updated) : undefined
      }),
      indices: [
        createIndex('event_id'),
        createIndex('event_date'),
        createIndex('am_start'),
        createIndex('am_end'),
        createIndex('pm_start'),
        createIndex('pm_end')
      ]
    })
    if (!data) return
    this.id = data.id;
    this.event_id = data.event_id;
    this.event_date = data.event_date;
    this.am_start = data.am_start ? new Date(data.am_start) : undefined;
    this.am_end = data.am_end ? new Date(data.am_end) : undefined;
    this.pm_start = data.pm_start ? new Date(data.pm_start) : undefined;
    this.pm_end = data.pm_end ? new Date(data.pm_end) : undefined;
    this.created = data.created ? new Date(data.created) : undefined;
    this.updated = data.updated ? new Date(data.updated) : undefined;
  }

  getByID(id: string) {
    return this.findOne({ id });
  }

  getByEventID(event_id?: string) {
    return this.find({ id: event_id ?? this.event_id }).fetch();
  }
}

export class EventDetailsCollection extends Collection<EventDetails> {
  id!: string;
  event_name!: string;
  type!: 'meeting' | 'seminar' | 'workshop' | 'conference' | 'webinar' | 'other';
  location!: string;
  description?: string;
  is_multi_day?: boolean;
  difference_in_days!: number;
  start_date!: Date;
  end_date!: Date;
  created?: Date;
  updated?: Date;
  settings!: Settings;

  constructor(data?: EventDetails) {
    super({
      name: 'event_details',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('event_details.json'),
      transform: (d) => ({
        ...d,
        start_date: new Date(d.start_date),
        end_date: new Date(d.end_date),
        created: d.created ? new Date(d.created) : undefined,
        updated: d.updated ? new Date(d.updated) : undefined,
        settings: {
          ...d.settings,
          created: d.settings.created ? new Date(d.settings.created) : undefined,
          updated: d.settings.updated ? new Date(d.settings.updated) : undefined
        }
      }),
      indices: [
        createIndex('id'),
        createIndex('event_name'),
        createIndex('type'),
        createIndex('location'),
        createIndex('description'),
        createIndex('is_multi_day'),
        createIndex('difference_in_days'),
        createIndex('start_date'),
        createIndex('end_date')
      ]
    })
    if (!data) return
    this.id = data.id;
    this.event_name = data.event_name;
    this.type = data.type;
    this.location = data.location;
    this.description = data.description;
    this.is_multi_day = data.is_multi_day;
    this.difference_in_days = data.difference_in_days;
    this.start_date = new Date(data.start_date);
    this.end_date = new Date(data.end_date);
    this.created = data.created ? new Date(data.created) : undefined;
    this.updated = data.updated ? new Date(data.updated) : undefined;
  }

  getByID(id: string) {
    return this.findOne({ id });
  }

  getByEventName(event_name: string) {
    return this.find({ event_name }).fetch();
  }

  getParticipants() {
    return COLLECTIONS.PARTICIPANT_COLLECTION.find({ event_id: this.id }).fetch();
  }

  getSchedules() {
    return COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find({ event_id: this.id }).fetch();
  }

  getNumberOfParticipants(event_id?: string) {
    return COLLECTIONS.PARTICIPANT_COLLECTION.find({ event_id: event_id ?? this.id }).count();
  }

  getNumberOfSchedules(event_id?: string) {
    return COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find({ event_id: event_id ?? this.id }).count();
  }

  getNumberOfAttendanceRecords(event_id?: string) {
    return COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({ event_id: event_id ?? this.id }).count();
  }

  getNumberOfAttendanceRecordsByDate(date: Date, event_id?: string) {
    return COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({ event_id: event_id ?? this.id, time_in: { $gte: date }, time_out: { $lte: date } }).count();
  }

  getNumberOfAttendanceRecordsByDateRange(start_date: Date, end_date: Date, event_id?: string) {
    return COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({ event_id: event_id ?? this.id, time_in: { $gte: start_date }, time_out: { $lte: end_date } }).count();
  }

  getNumberOfAttendanceRecordsByPeriod(period: string, event_id?: string) {
    return COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({ event_id: event_id ?? this.id, period }).count();
  }

  getNumberOfAttendanceRecordsByDateAndPeriod(date: Date, period: string, event_id?: string) {
    return COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({ event_id: event_id ?? this.id, time_in: { $gte: date }, time_out: { $lte: date }, period }).count();
  }

  getNumberOfAttendanceRecordsByDateRangeAndPeriod(start_date: Date, end_date: Date, period: string, event_id?: string) {
    return COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({ event_id: event_id ?? this.id, time_in: { $gte: start_date }, time_out: { $lte: end_date }, period }).count();
  }

  getNumberOfAttendanceRecordsByDateAndUser(date: Date, user_id: string, event_id?: string) {
    return COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({ event_id: event_id ?? this.id, time_in: { $gte: date }, time_out: { $lte: date }, user_id }).count();
  }

  getNumberOfAttendanceRecordsByDateRangeAndUser(start_date: Date, end_date: Date, user_id: string, event_id?: string) {
    return COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({ event_id: event_id ?? this.id, time_in: { $gte: start_date }, time_out: { $lte: end_date }, user_id }).count();
  }

}

export class ParticipantCollection extends Collection<Participant> {
  id!: string;
  first_name!: string;
  middle_name?: string;
  last_name!: string;
  event_id!: string;
  email?: string;
  created?: Date;
  updated?: Date;

  constructor(data?: Participant) {
    super({
      name: 'participants',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('participants.json'),
      transform: (d) => ({
        ...d,
        created: d.created ? new Date(d.created) : undefined,
        updated: d.updated ? new Date(d.updated) : undefined
      }),
      indices: [
        createIndex('event_id'),
        createIndex('email'),
        createIndex('first_name'),
        createIndex('last_name'),
        createIndex('middle_name')
      ]
    })
    if (!data) return;
    this.id = data.id;
    this.first_name = data.first_name;
    this.middle_name = data.middle_name;
    this.last_name = data.last_name;
    this.event_id = data.event_id;
    this.email = data.email;
    this.created = data.created ? new Date(data.created) : undefined;
    this.updated = data.updated ? new Date(data.updated) : undefined;
  }

  getByID(id: string) {
    return this.findOne({ id });
  }

  getEvent() {
    return this.findOne({ id: this.event_id });
  }
}

export class SettingsCollection extends Collection<Settings> {
  id!: string;
  allow_add_participants_while_ongoing_event!: boolean;
  created?: Date;
  updated?: Date;

  constructor(data?: Settings) {
    super({
      name: 'settings',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('settings.json'),
      transform: (d) => ({
        ...d,
        created: d.created ? new Date(d.created) : undefined,
        updated: d.updated ? new Date(d.updated) : undefined
      })
    })
    if (!data) return;
    this.id = data.id;
    this.allow_add_participants_while_ongoing_event = data.allow_add_participants_while_ongoing_event;
    this.created = data.created ? new Date(data.created) : undefined;
    this.updated = data.updated ? new Date(data.updated) : undefined;
  }

}