import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { eventSchema } from '@/schema/event';

export const entries = () => {
	return [{ id: 'some-id' }, { id: 'other-id' }];
};

export const load = async ({ params }) => {
	return {
		event_id: params.id,
		event_form: await superValidate(zod(eventSchema))
	};
};
