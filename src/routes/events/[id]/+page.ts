import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { add_participants_schema, participant_schema } from '@/schema/participant';
import { error } from '@sveltejs/kit';

export const entries = () => {
	return [{ id: 'some-id' }, { id: 'other-id' }];
};

export async function load({ params, url: { searchParams } }) {
	const error_content = searchParams.get('error_content');
	if (error_content) {
		const { status, message } = JSON.parse(error_content as string) as {
			status: number;
			message: string;
		};
		if (status !== 200) {
			error(status, message);
		}
	}

	return {
		event_id: params.id,
		add_participants_form: await superValidate(zod(add_participants_schema)),
		participant_form: await superValidate(zod(participant_schema))
	};
}
