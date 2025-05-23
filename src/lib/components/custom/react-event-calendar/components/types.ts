export type CalendarView = 'month' | 'week' | 'day' | 'events';

export interface CalendarEvent {
	id: string;
	title: string;
	description?: string;
	start: Date;
	end: Date;
	eventImage?: string;
  eventDuration?: number
	eventStatus?: 'finished' | 'ongoing' | 'upcoming';
	allDay?: boolean;
	color?: EventColor;
	location?: string;
}

export type EventColor = 'sky' | 'amber' | 'violet' | 'rose' | 'emerald' | 'orange';
