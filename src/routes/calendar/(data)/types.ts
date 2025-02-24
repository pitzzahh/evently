import type { CalendarDate } from "@internationalized/date";

export type EventType = "meeting" | "event" | "workshop";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  type: 'meeting' | 'event' | 'workshop';
  startDate: CalendarDate;
  endDate: CalendarDate;
  time?: string;
};
