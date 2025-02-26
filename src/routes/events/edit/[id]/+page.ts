import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { eventSchema } from '@/schema/event';

export const entries = () => {
	return [{ id: 'some-id' }, { id: 'other-id' }];
};

export const load = async () => {
    return {
        event_form: await superValidate(zod(eventSchema))
    };
};
