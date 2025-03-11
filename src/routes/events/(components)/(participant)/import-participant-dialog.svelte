<script lang="ts">
	import { Button, buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { Import, X, Sheet } from '@/assets/icons';
	import {
		displaySize,
		FileDropZone,
		MEGABYTE,
		type FileDropZoneProps
	} from '@/components/custom/file-drop-zone';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { SvelteDate } from 'svelte/reactivity';
	import { cn, sleep } from '@/utils';
	import { Progress } from '@/components/ui/progress';
	import * as AlertDialog from '@/components/ui/alert-dialog';
	import { readParticipants } from '@/utils/exports/excel';
	import { COLLECTIONS } from '@/db';

	interface ImportParticipantsDialogProps {
		event_id: string;
		disabled?: boolean;
		open_add_participants_dialog?: boolean;
	}

	let {
		event_id,
		disabled = false,
		open_add_participants_dialog = $bindable(false)
	}: ImportParticipantsDialogProps = $props();

	const onUpload: FileDropZoneProps['onUpload'] = async (filePaths) => {
		await Promise.allSettled(filePaths.map((filePath) => uploadFile(filePath)));
	};

	const onFileRejected: FileDropZoneProps['onFileRejected'] = async ({ reason, file }) => {
		toast.error(`${file} failed to upload!`, { description: reason });
	};

	const uploadFile = async (filePath: string) => {
		// don't upload duplicate files
		if (selected_file && selected_file.path === filePath) return;

		const urlPromise = new Promise<string>((resolve) => {
			// add some fake loading time
			sleep(1000).then(() => resolve(filePath));
		});

		selected_file = {
			path: filePath,
			name: filePath.split('/').pop() ?? '',
			uploadedAt: Date.now()
		};

		// we await since we don't want the onUpload to be complete until the files are actually uploaded
		await urlPromise;
	};

	type UploadedFile = {
		path: string;
		name: string;
		uploadedAt: number;
	};

	let selected_file = $state<UploadedFile | null>(null);
	let date = new SvelteDate();

	async function handleImportParticipants() {
		if (!selected_file) {
			toast.error('No files selected!');
			return;
		}
		console.log('selected_file', selected_file);
		const file_url = selected_file.path;
		const participants = await readParticipants(
			'C:\\Users\\peter\\Downloads\\MOCK_DATA(2).xlsx',
			event_id
		);

		COLLECTIONS.PARTICIPANT_COLLECTION.insertMany(participants);

		console.log('participants', participants);
	}

	$effect(() => {
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 10);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<Dialog.Root bind:open={open_add_participants_dialog}>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost' })}
		><Import class="size-4" />Import Excel Participants</Dialog.Trigger
	>
	<Dialog.Content class="max-w-[750px]">
		<Dialog.Header>
			<Dialog.Title>Importing guide</Dialog.Title>
			<Dialog.Description>
				<p class="text-sm text-muted-foreground">
					To import participants, please ensure that the Excel file is formatted as follows:
				</p>
				<table class="table-auto text-sm text-muted-foreground">
					<thead>
						<tr>
							<th class="px-4 py-2">last_name</th>
							<th class="px-4 py-2">first_name</th>
							<th class="px-4 py-2">middle_name</th>
							<th class="px-4 py-2">email</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="border px-4 py-2">Participant's last name</td>
							<td class="border px-4 py-2">Participant's first name</td>
							<td class="border px-4 py-2">Participant's middle name</td>
							<td class="border px-4 py-2">Participant's email address</td>
						</tr>
					</tbody>
				</table>
				<p class="mt-2 text-sm text-muted-foreground">
					The first row should contain the column headers. Please ensure that the file is saved in
					.xlsx format.
				</p>
			</Dialog.Description>
			<div class="flex w-full flex-col gap-2 p-6">
				<FileDropZone
					{onUpload}
					{onFileRejected}
					maxFileSize={10 * MEGABYTE}
					accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				/>
				{#if selected_file}
					<div class="flex flex-col gap-2">
						<div class="flex place-items-center justify-between gap-2">
							<div class="flex place-items-center gap-2 whitespace-nowrap">
								{#await selected_file.path then src}
									<div class="relative size-9 overflow-clip">
										<Sheet
											class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"
										/>
									</div>
								{/await}
								<div class="flex flex-col">
									<span>{selected_file.name}</span>
									<!-- <span class="text-xs text-muted-foreground"
										>{displaySize(selected_file.size)}</span
									> -->
								</div>
							</div>
							{#await selected_file.path}
								<Progress
									class="h-2 w-full flex-grow"
									value={((date.getTime() - selected_file.uploadedAt) / 1000) * 100}
									max={100}
								/>
							{:then path}
								<Button
									variant="outline"
									size="icon"
									onclick={() => {
										selected_file = null;
									}}
								>
									<X />
								</Button>
							{/await}
						</div>
					</div>
				{/if}
			</div></Dialog.Header
		>
		<Dialog.Footer>
			<AlertDialog.Root>
				<AlertDialog.Trigger
					disabled={!selected_file}
					class={cn(buttonVariants({ variant: 'outline', className: 'w-full' }), {
						'cursor-not-allowed': !selected_file
					})}
				>
					Import Participants
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
						<AlertDialog.Description>
							Are you sure you want to import the participants from this file? This action cannot be
							undone. Please ensure that the file is formatted correctly and contains the necessary
							data.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
						<AlertDialog.Action onclick={handleImportParticipants}>Import</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
