<script lang="ts">
	import { Button } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { Mail } from '@/assets/icons';
	import { toast } from 'svelte-sonner';

	interface SendEmailToParticipantsDialogProps {
		handleSendEmail: () => void;

		is_event_finished: boolean;
	}

	let { is_event_finished, handleSendEmail }: SendEmailToParticipantsDialogProps = $props();

	let open_send_email_dialog = $state(false);
</script>

<Dialog.Root bind:open={open_send_email_dialog}>
	<Button
		variant="secondary"
		class="bg-gray-400/10 dark:bg-white/10"
		onclick={() => {
			if (is_event_finished) {
				toast.info('Sending email is disabled since the event has concluded');
				return;
			}
			open_send_email_dialog = true;
		}}
	>
		<Mail class="size-4" />
		Send QR Codes to participants
	</Button>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Send Email</Dialog.Title>
			<Dialog.Description>
				By performing this action, each QR code will be sent to each participant's email. Are you sure about this action?
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open_send_email_dialog = false)}>Cancel</Button>
			<Button
				variant="default"
				onclick={() => {
					handleSendEmail();
					open_send_email_dialog = false;
				}}>Send</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
