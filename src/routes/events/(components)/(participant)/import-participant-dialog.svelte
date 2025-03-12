<script lang="ts">
	import { Button, buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { Import, X } from '@/assets/icons';
	import {
		displaySize,
		FileDropZone,
		MEGABYTE,
		type FileDropZoneProps
	} from '@/components/custom/file-drop-zone';
	import { toast } from 'svelte-sonner';
	import { SvelteDate } from 'svelte/reactivity';
	import { cn, sleep } from '@/utils';
	import { Progress } from '@/components/ui/progress';
	import * as AlertDialog from '@/components/ui/alert-dialog';
	import { readParticipants } from '@/utils/exports/excel';
	import { COLLECTIONS } from '@/db';
	import { onDestroy } from 'svelte';

	interface ImportParticipantsDialogProps {
		event_id: string;
		disabled?: boolean;
		open_add_participants_dialog?: boolean;
	}

	type UploadedFile = {
		name: string;
		type: string;
		size: number;
		uploadedAt: number;
		url: Promise<string>;
		file: File;
	};

	let {
		event_id,
		disabled = false,
		open_add_participants_dialog = $bindable(false)
	}: ImportParticipantsDialogProps = $props();

	const date = new SvelteDate();
	let files = $state<UploadedFile[]>([]);

	const onUpload: FileDropZoneProps['onUpload'] = async (files) => {
		console.log('files', files);
		await Promise.allSettled(files.map((file) => uploadFile(file)));
	};

	const onFileRejected: FileDropZoneProps['onFileRejected'] = async ({ reason, file }) => {
		toast.error(`${file.name} failed to upload!`, { description: reason });
	};

	const uploadFile = async (file: File) => {
		// don't upload duplicate files
		if (files.find((f) => f.name === file.name)) return;

		const urlPromise = new Promise<string>((resolve) => {
			// add some fake loading time
			sleep(1000).then(() => resolve(URL.createObjectURL(file)));
		});

		files.push({
			name: file.name,
			type: file.type,
			size: file.size,
			uploadedAt: Date.now(),
			url: urlPromise,
			file
		});

		// we await since we don't want the onUpload to be complete until the files are actually uploaded
		await urlPromise;
	};

	async function handleImportParticipants() {
		if (files.length === 0) {
			toast.error('No files selected!');
			return;
		}
		const [selected_file] = files;
		console.log('selected_file', selected_file);
		const { file } = selected_file;
		COLLECTIONS.PARTICIPANT_COLLECTION.insertMany(await readParticipants(file, event_id));
		open_add_participants_dialog = false;
		files = [];
		toast.success('Participants imported successfully!');
	}

	$effect(() => {
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 10);

		return () => {
			clearInterval(interval);
		};
	});

	onDestroy(async () => {
		for (const file of files) {
			URL.revokeObjectURL(await file.url);
		}
	});
</script>

<Dialog.Root bind:open={open_add_participants_dialog}>
	<Dialog.Trigger {disabled} class={buttonVariants({ variant: 'ghost' })}
		><Import class="size-4" />Import Excel Participants</Dialog.Trigger
	>
	<Dialog.Content class="max-w-[750px]">
		{@const no_file = files.length === 0}
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
					maxFiles={1}
					fileCount={files.length}
					accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				/>
				<div class="flex flex-col gap-2">
					{#each files as file, i (file.name)}
						<div class="flex place-items-center justify-between gap-2">
							<div class="flex place-items-center gap-2">
								{#await file.url then src}
									<div class="relative size-9 overflow-clip">
										{#if file.type.startsWith('image/')}
											<img
												{src}
												alt={file.name}
												class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"
											/>
										{:else if file.type.startsWith('video/')}
											video
										{/if}
									</div>
								{/await}
								<div class="flex flex-col">
									<span>{file.name}</span>
									<span class="text-xs text-muted-foreground">{displaySize(file.size)}</span>
								</div>
							</div>
							{#await file.url}
								<Progress
									class="h-2 w-full flex-grow"
									value={((date.getTime() - file.uploadedAt) / 1000) * 100}
									max={100}
								/>
							{:then url}
								<Button
									variant="outline"
									size="icon"
									onclick={() => {
										URL.revokeObjectURL(url);
										files = [...files.slice(0, i), ...files.slice(i + 1)];
									}}
								>
									<X />
								</Button>
							{/await}
						</div>
					{/each}
				</div>
			</div>
		</Dialog.Header>
		<Dialog.Footer>
			<AlertDialog.Root>
				<AlertDialog.Trigger
					disabled={no_file}
					class={cn(buttonVariants({ variant: 'outline', className: 'w-full' }), {
						'cursor-not-allowed': no_file
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
