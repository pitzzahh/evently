import { svelteReactivityAdapter } from '@/db/adapter/index.svelte';
import { Collection } from '@signaldb/core';
import createOPFSAdapter from '@signaldb/opfs';

export class AttendanceRecord extends Collection {
  id: string;
  user_id: string;
  event_id: string;
  time_in?: Date;
  time_out?: Date;
  period: string;
  created: Date;
  updated: Date;

  constructor(data: AttendanceRecord) {
    super({
      name: 'attendance_records',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('attendance_records.json')
    })
    this.id = data.id;
    this.user_id = data.user_id;
    this.event_id = data.event_id;
    this.time_in = data.time_in ? new Date(data.time_in) : undefined;
    this.time_out = data.time_out ? new Date(data.time_out) : undefined;
    this.period = data.period;
    this.created = new Date(data.created);
    this.updated = new Date(data.updated);
  }
}

export class EventSchedule extends Collection {
  id: string;
  event_id?: string;
  event_date?: Date;
  am_start?: Date;
  am_end?: Date;
  pm_start?: Date;
  pm_end?: Date;
  created: Date;
  updated: Date;

  constructor(data: EventSchedule) {
    super({
      name: 'event_schedules',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('event_schedules.json')
    })
    this.id = data.id;
    this.event_id = data.event_id;
    this.event_date = data.event_date ? new Date(data.event_date) : undefined;
    this.am_start = data.am_start ? new Date(data.am_start) : undefined;
    this.am_end = data.am_end ? new Date(data.am_end) : undefined;
    this.pm_start = data.pm_start ? new Date(data.pm_start) : undefined;
    this.pm_end = data.pm_end ? new Date(data.pm_end) : undefined;
    this.created = new Date(data.created);
    this.updated = new Date(data.updated);
  }
}

export class EventDetails extends Collection {
  id: string;
  event_name?: string;
  start_date?: Date;
  end_date?: Date;
  created: Date;
  updated: Date;

  constructor(data: EventDetails) {
    super({
      name: 'event_details',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('event_details.json')
    })
    this.id = data.id;
    this.event_name = data.event_name;
    this.start_date = data.start_date ? new Date(data.start_date) : undefined;
    this.end_date = data.end_date ? new Date(data.end_date) : undefined;
    this.created = new Date(data.created);
    this.updated = new Date(data.updated);
  }
}

export class Note extends Collection {
  id: string;
  title?: string;
  created: Date;
  updated: Date;

  constructor(data: Note) {
    super({
      name: 'notes',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('notes.json')
    })
    this.id = data.id;
    this.title = data.title;
    this.created = new Date(data.created);
    this.updated = new Date(data.updated);
  }
}

export class Participant extends Collection {
  id: string;
  first_name: string;
  middle_initial?: string;
  last_name: string;
  email?: string;
  created: Date;
  updated: Date;

  constructor(data: Participant) {
    super({
      name: 'participants',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('participants.json')
    })
    this.id = data.id;
    this.first_name = data.first_name;
    this.middle_initial = data.middle_initial;
    this.last_name = data.last_name;
    this.email = data.email;
    this.created = new Date(data.created);
    this.updated = new Date(data.updated);
  }
}

export class QRCode extends Collection {
  id: string;
  created: Date;
  updated: Date;

  constructor(data: any) {
    super({
      name: 'qr_codes',
      reactivity: svelteReactivityAdapter(),
      persistence: createOPFSAdapter('qr_codes.json')
    })
    this.id = data.id;
    this.created = new Date(data.created);
    this.updated = new Date(data.updated);
  }
}