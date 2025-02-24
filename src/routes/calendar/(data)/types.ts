import type { CalendarDate } from "@internationalized/date";

export type EventType = "meeting" | "event" | "workshop";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: CalendarDate;
  endDate: CalendarDate;
  time?: string;
}