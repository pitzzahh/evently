import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TimeOfDay } from '@/types';

export const checkRoleQuery = (str: string | null) => {
	return str === 'ADMIN' || str === 'RECORDS_COORDINATOR';
};

const convertScientificToNumber: (scientificNumber: string) => number = (
	scientificNumber: string
): number => {
	return parseFloat(scientificNumber);
};
export function getTimeOfDay(): TimeOfDay {
	const now = new Date();
	const hour = now.getHours();

	if (hour >= 5 && hour < 12) {
		return 'MORNING';
	} else if (hour >= 12 && hour < 14) {
		return 'NOON';
	} else if (hour >= 14 && hour < 17) {
		return 'AFTERNOON';
	} else if (hour >= 17 && hour <= 23) {
		return 'EVENING';
	} else {
		return 'NIGHT';
	}
}
export function randomDate(start: Date, end: Date) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export function getGreetingByTime(language: string) {
	const TIME_OF_DAY = getTimeOfDay();
	switch (language) {
		case 'English':
			switch (TIME_OF_DAY) {
				case 'MORNING':
					return 'Good Morning';
				case 'NOON':
					return 'Good Noon';
				case 'AFTERNOON':
					return 'Good Afternoon';
				case 'EVENING':
					return 'Good Evening';
				case 'NIGHT':
					return 'Good Night';
				default:
					return 'Hello';
			}
		case 'Filipino':
			switch (TIME_OF_DAY) {
				case 'MORNING':
					return 'Magandang Umaga';
				case 'NOON':
					return 'Magandang Tanghali';
				case 'AFTERNOON':
					return 'Magandang Hapon';
				case 'EVENING':
					return 'Magandang Gabi';
				case 'NIGHT':
					return 'Magandang Gabi';
				default:
					return 'Kumusta';
			}
		case 'Bicol':
			switch (TIME_OF_DAY) {
				case 'MORNING':
					return 'Marhay na aldaw';
				case 'NOON':
					return 'Marhay na Udto';
				case 'AFTERNOON':
					return 'Marhay na Hapon';
				case 'EVENING':
					return 'Marhay na Banggi';
				case 'NIGHT':
					return 'Marhay na Banggi';
				default:
					return 'Musta';
			}
		default:
			return 'Welcome back';
	}
}

/** Await this to pause execution until the duration has passed.
 *
 * @param durationMs The duration in ms until the sleep in over
 * @returns
 *
 * ## Example
 * ```ts
 * console.log(Date.now()) // 1725739228744
 *
 * await sleep(1000);
 *
 * console.log(Date.now()) // 1725739229744
 * ```
 */
export const sleep = async (durationMs: number): Promise<void> =>
	new Promise((res) => setTimeout(res, durationMs));