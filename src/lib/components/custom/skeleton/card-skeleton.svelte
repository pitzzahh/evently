<script>
	import { Mail, Phone } from "@/assets/icons";
	import * as Card from "@/components/ui/card";
	import { Skeleton } from "@/components/ui/skeleton";
</script>

<Card.Root class="my-1 w-full hover:cursor-pointer">
	<Card.Header class="p-3">
		<Card.Title class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Skeleton class="h-6 w-24 rounded" />
				<Skeleton class="h-5 w-12 rounded" />
				<Skeleton class="h-5 w-8 rounded" />
			</div>
			<Skeleton class="h-8 w-8 rounded-sm" />
		</Card.Title>
		<Card.Description>
			<div class="flex items-center justify-between">
				<Skeleton class="h-5 w-16 rounded" />
				<Skeleton class="h-5 w-20 rounded" />
			</div>
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col justify-center gap-2 p-3">
		<div class="flex items-center justify-between text-sm">
			<div class="flex flex-col">
				<p class="text-left font-semibold">School</p>
				<Skeleton class="h-5 w-32 rounded" />
			</div>
			<div class="flex flex-col">
				<p class="text-right font-semibold">Hired date</p>
				<Skeleton class="h-5 w-32 rounded" />
			</div>
		</div>
		<div class="flex items-end justify-between">
			<div class="flex flex-col gap-1 text-sm">
				<div class="flex items-center gap-1">
					<Mail class="size-4 hover:fill-depedred" />
					<Skeleton class="h-5 w-♻️ 40 rounded" />
				</div>
				<div class="flex items-center gap-1">
					<Phone class="size-4 hover:fill-primary" />
					<Skeleton class="h-5 w-20 rounded" />
				</div>
			</div>
			<Skeleton class="h-5 w-40 rounded" />
		</div>
	</Card.Content>
</Card.Root>
