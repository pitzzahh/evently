import { svelteReactivityAdapter } from '@/db/adapter/index.svelte';
import type { ClassProperties } from '@/types/generic';
import { Collection } from '@signaldb/core';
import createOPFSAdapter from '@signaldb/opfs';

export class AttendanceRecordCollection extends Collection {
  id!: string;
  user_id!: string;
  event_id!: string;
  time_in?: Date;
  time_out?: Date;
  period!: string;
  created?: Date;
  updated?: Date;

  constructor(data?: AttendanceRecordCollection) {
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
}

export class EventScheduleCollection extends Collection {
  id!: string;
  event_id?: string;
  event_date?: Date;
  am_start?: Date;
  am_end?: Date;
  pm_start?: Date;
  pm_end?: Date;
  created?: Date;
  updated?: Date;

  constructor(data?: EventScheduleCollection) {
    super({
      name: 'event_schedules',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('event_schedules.json')
    })
    if (!data) return
    this.id = data.id;
    this.event_id = data.event_id;
    this.event_date = data.event_date ? new Date(data.event_date) : undefined;
    this.am_start = data.am_start ? new Date(data.am_start) : undefined;
    this.am_end = data.am_end ? new Date(data.am_end) : undefined;
    this.pm_start = data.pm_start ? new Date(data.pm_start) : undefined;
    this.pm_end = data.pm_end ? new Date(data.pm_end) : undefined;
    this.created = data.created ? new Date(data.created) : undefined;
    this.updated = data.updated ? new Date(data.updated) : undefined;
  }
}

export class EventDetailsCollection extends Collection {
  id!: string;
  event_name?: string;
  start_date?: Date;
  end_date?: Date;
  created?: Date;
  updated?: Date;

  constructor(data?: EventDetailsCollection) {
    super({
      name: 'event_details',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('event_details.json')
    })
    if (!data) return
    this.id = data.id;
    this.event_name = data.event_name;
    this.start_date = data.start_date ? new Date(data.start_date) : undefined;
    this.end_date = data.end_date ? new Date(data.end_date) : undefined;
    this.created = data.created ? new Date(data.created) : undefined;
    this.updated = data.updated ? new Date(data.updated) : undefined;
  }
}

export class NoteCollection extends Collection {
  id!: string;
  title?: string;
  created?: Date;
  updated?: Date;

  constructor(data?: NoteCollection) {
    super({
      name: 'notes',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('notes.json')
    })
    if (!data) return;
    this.id = data.id;
    this.title = data.title;
    this.created = data.created ? new Date(data.created) : undefined;
    this.updated = data.updated ? new Date(data.updated) : undefined;
  }
}

type PartCol = Pick<ParticipantCollection, 'first_name' | 'id' | 'last_name'>

export class ParticipantCollection extends Collection<PartCol> {
  id!: string;
  first_name!: string;
  middle_initial?: string;
  last_name!: string;
  email?: string;
  created?: Date;
  updated?: Date;

  constructor(data?: ParticipantCollection) {
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
    this.email = data.email;
    this.created = data.created ? new Date(data.created) : undefined;
    this.updated = data.updated ? new Date(data.updated) : undefined;
  }
}

export class QRCodeCollection extends Collection {
  id!: string;
  code!: string;
  created?: Date;
  updated?: Date;

  constructor(data?: QRCodeCollection) {
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
}
