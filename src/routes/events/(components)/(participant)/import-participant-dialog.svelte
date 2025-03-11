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
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { SvelteDate } from 'svelte/reactivity';
	import { sleep } from '@/utils';
	import { Progress } from '@/components/ui/progress';

	const onUpload: FileDropZoneProps['onUpload'] = async (files) => {
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
			url: urlPromise
		});

		// we await since we don't want the onUpload to be complete until the files are actually uploaded
		await urlPromise;
	};

	type UploadedFile = {
		name: string;
		type: string;
		size: number;
		uploadedAt: number;
		url: Promise<string>;
	};

	let files = $state<UploadedFile[]>([]);
	let date = new SvelteDate();

	onDestroy(async () => {
		for (const file of files) {
			URL.revokeObjectURL(await file.url);
		}
	});

	$effect(() => {
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 10);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<Dialog.Root>
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
					accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
					fileCount={files.length}
				/>
				<div class="flex flex-col gap-2">
					{#each files as file, i (file.name)}
						<div class="flex place-items-center justify-between gap-2">
							<div class="flex place-items-center gap-2 whitespace-nowrap">
								{#await file.url then src}
									<div class="relative size-9 overflow-clip">
										<img
											{src}
											alt={file.name}
											class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"
										/>
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
	</Dialog.Content>
</Dialog.Root>
