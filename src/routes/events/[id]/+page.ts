import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { add_participants_schema } from '@/schema/participant';

export async function load({ params }) {
	return {
		event_id: params.id,
		add_participants_form: await superValidate(zod(add_participants_schema))
	};
}
