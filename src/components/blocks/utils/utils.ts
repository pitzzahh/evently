/*
	jsrepo 1.40.1
	Installed from github/ieedan/shadcn-svelte-extras
	2-25-2025
*/

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
