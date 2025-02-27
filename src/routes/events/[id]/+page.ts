import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { add_participants_schema, participant_schema } from '@/schema/participant';

export const entries = () => {
	return [{ id: 'some-id' }, { id: 'other-id' }];
};

export async function load({ params }) {
	return {
		event_id: params.id,
		add_participants_form: await superValidate(zod(add_participants_schema)),
		participant_form: await superValidate(zod(participant_schema))
	};
}
