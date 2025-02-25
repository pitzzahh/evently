import type { EventDetails } from "@/db/models/types";
import type { CalendarDate } from "@internationalized/date";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventDetails['type'];
  startDate: CalendarDate;
  endDate: CalendarDate;
  time?: string;
}