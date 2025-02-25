/*
	jsrepo 1.40.1
	Installed from github/ieedan/shadcn-svelte-extras
	2-25-2025
*/

import type { ReadableBox, WritableBox } from 'svelte-toolbelt';

export type Box<T> = ReadableBox<T> | WritableBox<T>;

export type WritableBoxedValues<T> = {
	[K in keyof T]: WritableBox<T[K]>;
};

export type ReadableBoxedValues<T> = {
	[K in keyof T]: ReadableBox<T[K]>;
};
