import { svelteReactivityAdapter } from '@/db/adapter/index.svelte';
import { Collection } from '@signaldb/core';
import createOPFSAdapter from '@signaldb/opfs';
import type { AttendanceRecord, EventDetails, EventSchedule, Participant, QRCode } from './types';
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
      persistence: createOPFSAdapter('attendance_records.json')
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
      persistence: createOPFSAdapter('event_schedules.json')
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

  constructor(data?: EventDetails) {
    super({
      name: 'event_details',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('event_details.json')
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
}

export class ParticipantCollection extends Collection<Participant> {
  id!: string;
  first_name!: string;
  middle_initial?: string;
  last_name!: string;
  event_id!: string;
  email?: string;
  created?: Date;
  updated?: Date;

  constructor(data?: Participant) {
    super({
      name: 'participants',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('participants.json')
    })
    if (!data) return;
    this.id = data.id;
    this.first_name = data.first_name;
    this.middle_initial = data.middle_initial;
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

export class QRCodeCollection extends Collection<QRCode> {
  id!: string;
  code!: string;
  created?: Date;
  updated?: Date;

  constructor(data?: QRCode) {
    super({
      name: 'qr_codes',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('qr_codes.json')
    })
    if (!data) return;
    this.id = data.id;
    this.code = data.code;
    this.created = data.created ? new Date(data.created) : undefined;
    this.updated = data.updated ? new Date(data.updated) : undefined;
  }

  getByID(id: string) {
    return this.findOne({ id });
  }

  getByCode(code: string) {
    return this.findOne({ code });
  }
}
