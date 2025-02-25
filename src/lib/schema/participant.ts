import { z } from 'zod';

export const participant_schema = z.object({
	first_name: z
		.string()
		.min(1, { message: 'First name is required' })
		.max(50, { message: 'First name cannot exceed 50 characters' })
		.regex(/^[a-zA-Z\s-']+$/, {
			message: 'First name can only contain letters, spaces, hyphens, and apostrophes'
		}),
	middle_initial: z
		.string()
		.max(1, { message: 'Middle initial must be a single character' })
		.regex(/^[A-Z]?$/, { message: 'Middle initial must be a capital letter' })
		.optional(),
	last_name: z
		.string()
		.min(1, { message: 'Last name is required' })
		.max(50, { message: 'Last name cannot exceed 50 characters' })
		.regex(/^[a-zA-Z\s-']+$/, {
			message: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
		}),
	email: z
		.string()
		.email({ message: 'Invalid email address' })
		.min(5, { message: 'Email must be at least 5 characters' })
		.max(254, { message: 'Email cannot exceed 254 characters' })
		.toLowerCase(),
	event_id: z.string()
});
export type ParticipantSchema = z.infer<typeof participant_schema>;

export const add_participants_schema = z.object({
	employment_information: z.array(participant_schema).nonempty({
		message: 'At least one employment information entry is required.'
	})
});
export type AddParticipantsSchema = z.infer<typeof add_participants_schema>;
