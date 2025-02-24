import { z } from 'zod';

export const eventSchema = z.object({
	title: z.string().min(1, { message: 'Title is required' }),
	description: z.string().optional(),
	location: z.string(),
	start_date: z.date(),
	is_multi_day_event: z.boolean().default(false),
	end_date: z.date()
});

export type EventSchema = z.infer<typeof eventSchema>;
