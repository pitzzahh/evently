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
	import { readParticipants } from '@/utils/imports/excel';
	import { COLLECTIONS } from '@/db';
	import { onDestroy } from 'svelte';
	import { validateExcelHeaders } from '@/utils/imports';
	import ExcelJS from 'exceljs';

	interface ImportParticipantsDialogProps {
		event_id: string;
		disabled?: boolean;
		open_add_excel_participants_dialog?: boolean;
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
		open_add_excel_participants_dialog = $bindable(false)
	}: ImportParticipantsDialogProps = $props();

	const date = new SvelteDate();
	let files = $state<UploadedFile[]>([]);
	let isImporting = $state(false);
	let importProgress = $state(0);

	// A safer console.log that doesn't use Tauri's log plugin if not available
	function safeLog(...args: any[]) {
		try {
			console.log(...args);
		} catch (e) {
			// Fallback if the invoke method is undefined (happens in browser context)
			// Using Function constructor to avoid direct console reference that might be patched
			new Function('args', 'console.info("Safe log:", ...args)')(args);
		}
	}

	const onUpload: FileDropZoneProps['onUpload'] = async (uploadedFiles) => {
		try {
			safeLog('Files selected:', uploadedFiles.length);
			await Promise.allSettled(uploadedFiles.map((file) => uploadFile(file)));
		} catch (error) {
			safeLog('Error in onUpload:', error);
		}
	};

	const onFileRejected: FileDropZoneProps['onFileRejected'] = async ({ reason, file }) => {
		toast.error(`${file.name} failed to upload!`, { description: reason });
	};

	const uploadFile = async (file: File) => {
		try {
			// don't upload duplicate files
			if (files.find((f) => f.name === file.name)) return;

			const urlPromise = new Promise<string>((resolve) => {
				// add some fake loading time
				sleep(1000).then(() => resolve(URL.createObjectURL(file)));
			});

			const arrayBuffer = await file.arrayBuffer();
			const workbook = new ExcelJS.Workbook();
			await workbook.xlsx.load(arrayBuffer);
			const worksheet = workbook.worksheets[0];

			if (!worksheet) {
				throw new Error('First worksheet not found in the Excel file');
			}

			console.log('Worksheet found:', JSON.stringify(worksheet.name));

			// Extract headers from the first row
			const headerRow = worksheet.getRow(1).values;
			const headers = Array.isArray(headerRow)
				? headerRow.slice(1).map((header) => header?.toString() || '')
				: [];

			// Validate headers
			const validationResult = validateExcelHeaders(headers);

			if (validationResult.data) {
				files = [
					...files,
					{
						name: file.name,
						type: file.type,
						size: file.size,
						uploadedAt: Date.now(),
						url: urlPromise,
						file
					}
				];

				// we await since we don't want the onUpload to be complete until the files are actually uploaded
				await urlPromise;
			} else {
				if (validationResult.status !== 200) {
					throw new Error(validationResult.message);
				}
			}
		} catch (error) {
			safeLog('Error in uploadFile:', error);
			toast.error(`Error uploading file: ${(error as any).message || 'Unknown error'}`);
		}
	};

	async function handleImportParticipants() {
		if (files.length === 0) {
			toast.error('No files selected');
			return;
		}

		try {
			isImporting = true;
			importProgress = 10;

			const fileToImport = files[0];

			// Important: Use the actual File object, not a serialized version
			const actualFile = fileToImport.file;

			importProgress = 30;

			// Read participants from the file
			const participants = await readParticipants(actualFile, event_id);

			importProgress = 60;

			if (participants.length === 0) {
				toast.error('No valid participant data found in the file');
				isImporting = false;
				return;
			}

			COLLECTIONS.PARTICIPANT_COLLECTION.insertMany(participants);

			importProgress = 100;

			// Clean up and close dialog
			for (const file of files) {
				const url = await file.url;
				URL.revokeObjectURL(url);
			}

			files = [];
			open_add_excel_participants_dialog = false;
			toast.success(`Successfully imported ${participants.length} participants`);
		} catch (error) {
			console.error('Import error:', error);
			toast.error(`Error importing participants: ${(error as any).message || 'Unknown error'}`);
		} finally {
			isImporting = false;
			importProgress = 0;
		}
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
			try {
				const url = await file.url;
				URL.revokeObjectURL(url);
			} catch (e) {
				// Ignore errors during cleanup
			}
		}
	});
</script>

<Dialog.Root bind:open={open_add_excel_participants_dialog}>
	<Dialog.Content class="max-w-[750px]">
		{@const no_file = files.length === 0}
		<Dialog.Header>
			<Dialog.Title>Importing guide</Dialog.Title>
			<Dialog.Description>
				<p class="text-muted-foreground text-sm">
					To import participants, please ensure that the Excel file is formatted as follows:
				</p>
				<table class="text-muted-foreground table-auto text-sm">
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
				<p class="text-muted-foreground mt-2 text-sm">
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
										<span class="text-2xl">📊</span>
									</div>
								{/await}
								<div class="flex flex-col">
									<span>{file.name}</span>
									<span class="text-muted-foreground text-xs">{displaySize(file.size)}</span>
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
					disabled={no_file || isImporting}
					class={cn(buttonVariants({ variant: 'outline', className: 'w-full' }), {
						'cursor-not-allowed': no_file || isImporting,
						'opacity-50': isImporting
					})}
				>
					{#if isImporting}
						<span class="flex items-center">
							<svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
									fill="none"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Importing... {importProgress}%
						</span>
					{:else}
						Import Participants
					{/if}
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
