<script lang="ts">
	import { Skeleton } from '@/components/ui/skeleton';

	// Field types
	export type SkeletonFieldSize = 'small' | 'default' | 'large';
	export type SkeletonFieldType = 'input' | 'textarea' | 'select' | 'button';

	// Column configuration
	export type SkeletonColumnConfig = {
		span: 1 | 2 | 3 | 4 | 6 | 12; // Column span in a 12-column grid
		field: {
			type: SkeletonFieldType;
			size: SkeletonFieldSize;
		};
	};

	// Row configuration
	export type SkeletonRowConfig = {
		columns: SkeletonColumnConfig[];
	};

	// Form configuration
	export type SkeletonFormConfig = {
		rows: SkeletonRowConfig[];
	};

	let { config }: { config: SkeletonFormConfig } = $props();

	// Size mappings for different field types
	const sizeMap = {
		small: { height: 'h-8', width: 'w-full' },
		default: { height: 'h-10', width: 'w-full' },
		large: { height: 'h-24', width: 'w-full' }
	};

	// Column span to grid column class mapping
	const spanToGridClass = {
		1: 'col-span-1',
		2: 'col-span-2',
		3: 'col-span-3',
		4: 'col-span-4',
		6: 'col-span-6',
		12: 'col-span-12'
	};

	// Validate total span per row doesn't exceed 12
	$effect(() => {
		config.rows.forEach((row, rowIndex) => {
			const totalSpan = row.columns.reduce((sum, col) => sum + col.span, 0);
			if (totalSpan > 12) {
				console.warn(`Row ${rowIndex} exceeds 12 columns (${totalSpan})`);
			}
		});
	});
</script>

<div class="flex w-full flex-col gap-6 overflow-hidden">
	{#each config.rows as row}
		<div class="grid w-full grid-cols-12 gap-4">
			{#each row.columns as column}
				<div class={`${spanToGridClass[column.span]} min-w-0`}>
					<div class="flex flex-col gap-2 overflow-hidden">
						<!-- Field label skeleton -->
						{#if column.field.type !== 'button'}
							<Skeleton class="h-4 w-20 shrink-0" />
						{/if}

						<!-- Field skeleton -->
						<Skeleton
							class={[
								sizeMap[column.field.size].width,
								sizeMap[column.field.size].height,
								column.field.type === 'button' ? 'w-32' : 'w-full',
								'shrink-0'
							]
								.filter(Boolean)
								.join(' ')}
						/>
					</div>
				</div>
			{/each}
		</div>
	{/each}
</div>
