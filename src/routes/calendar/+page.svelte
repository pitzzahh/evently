<script module>
	export interface Day {
		name: string;
		enabled: boolean;
		date: Date;
	}

	export interface CalendarItem {
		title: string;
		className: string;
		date: Date;
		len: number;
		startCol?: number;
		startRow?: number;
		isBottom?: boolean;
		detailHeader?: string;
		detailContent?: string;
		vlen?: number;
	}
</script>

<script lang="ts">
	import Calendar from './(components)/calendar.svelte';
	import { onMount } from 'svelte';

	const dayNames = $state(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
	const monthNames = $state([
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	]);

	let headers = $state<string[]>([]);
	let now = new Date();
	let year = $state(now.getFullYear());
	let month = $state(now.getMonth());
	let eventText = $state('Click an item or date');
	let days = $state<Day[]>([]);
	let items = $state<CalendarItem[]>([]);

	function randInt(max: number): number {
		return Math.floor(Math.random() * max) + 1;
	}

	function initMonthItems() {
		const y = year;
		const m = month;
		const d1 = new Date(y, m, randInt(7) + 7);

		const newItems: CalendarItem[] = [
			{
				title: '11:00 Task Early in month',
				className: 'task--primary',
				date: new Date(y, m, randInt(6)),
				len: randInt(4) + 1
			},
			{
				title: '7:30 Wk 2 tasks',
				className: 'task--warning',
				date: d1,
				len: randInt(4) + 2
			},
			{
				title: 'Overlapping Stuff (isBottom:true)',
				date: d1,
				className: 'task--info',
				len: 4,
				isBottom: true
			},
			{
				title: '10:00 More Stuff to do',
				date: new Date(y, m, randInt(7) + 14),
				className: 'task--info',
				len: randInt(4) + 1,
				detailHeader: 'Difficult',
				detailContent: 'But not especially so'
			},
			{
				title: 'All day task',
				date: new Date(y, m, randInt(7) + 21),
				className: 'task--danger',
				len: 1,
				vlen: 2
			}
		];

		for (const item of newItems) {
			const rc = findRowCol(item.date);
			if (rc === null) {
				console.log('didn`t find date for ', item);
				item.startCol = item.startRow = 0;
			} else {
				item.startCol = rc.col;
				item.startRow = rc.row;
			}
		}

		items = newItems;
	}

	function initMonth() {
		const newDays: Day[] = [];
		const monthAbbrev = monthNames[month].slice(0, 3);
		const nextMonthAbbrev = monthNames[(month + 1) % 12].slice(0, 3);
		const firstDay = new Date(year, month, 1).getDay();
		const daysInThisMonth = new Date(year, month + 1, 0).getDate();
		const daysInLastMonth = new Date(year, month, 0).getDate();
		const prevMonth = month === 0 ? 11 : month - 1;

		// Previous month days
		for (let i = daysInLastMonth - firstDay; i < daysInLastMonth; i++) {
			const d = new Date(prevMonth === 11 ? year - 1 : year, prevMonth, i + 1);
			newDays.push({ name: String(i + 1), enabled: false, date: d });
		}

		// Current month days
		for (let i = 0; i < daysInThisMonth; i++) {
			const d = new Date(year, month, i + 1);
			newDays.push({
				name: i === 0 ? `${monthAbbrev} ${i + 1}` : String(i + 1),
				enabled: true,
				date: d
			});
		}

		// Next month days
		for (let i = 0; newDays.length % 7; i++) {
			const d = new Date(month === 11 ? year + 1 : year, (month + 1) % 12, i + 1);
			newDays.push({
				name: i === 0 ? `${nextMonthAbbrev} ${i + 1}` : String(i + 1),
				enabled: false,
				date: d
			});
		}

		days = newDays;
	}

	function findRowCol(dt: Date) {
		for (let i = 0; i < days.length; i++) {
			const d = days[i].date;
			if (
				d.getFullYear() === dt.getFullYear() &&
				d.getMonth() === dt.getMonth() &&
				d.getDate() === dt.getDate()
			) {
				return { row: Math.floor(i / 7) + 2, col: (i % 7) + 1 };
			}
		}
		return null;
	}

	function initContent() {
		headers = dayNames;
		initMonth();
		initMonthItems();
	}

	onMount(() => {
		initContent();
	});

	function handleItemClick(item: CalendarItem) {
		eventText = `itemClick ${JSON.stringify(item)} localtime=${item.date.toString()}`;
	}

	function handleDayClick(e: Day) {
		eventText = `onDayClick ${JSON.stringify(e)} localtime=${e.date.toString()}`;
	}

	function handleHeaderClick(e: string) {
		eventText = `onHeaderClick ${JSON.stringify(e)}`;
	}

	function nextMonth() {
		if (month === 11) {
			year++;
			month = 0;
		} else {
			month++;
		}
	}

	function prevMonth() {
		if (month === 0) {
			year--;
			month = 11;
		} else {
			month--;
		}
	}
</script>

<div class="mx-auto w-full max-w-4xl rounded-lg bg-card shadow-lg">
	<div class="border-b border-border/20 p-6">
		<div class="flex items-center justify-center gap-4">
			<button class="btn btn-ghost btn-sm" onclick={() => year--}>&Lt;</button>
			<button class="btn btn-ghost btn-sm" onclick={prevMonth}>&lt;</button>
			<h1 class="text-xl font-semibold">{monthNames[month]} {year}</h1>
			<button class="btn btn-ghost btn-sm" onclick={nextMonth}>&gt;</button>
			<button class="btn btn-ghost btn-sm" onclick={() => year++}>&Gt;</button>
		</div>
		<p class="mt-2 text-sm text-muted-foreground">{eventText}</p>
	</div>

	<Calendar
		{headers}
		{days}
		{items}
		headerClick={handleHeaderClick}
		dayClick={handleDayClick}
		itemClick={handleItemClick}
	/>
</div>
