import { goto } from '$app/navigation';

export function handleKeydown(event: KeyboardEvent, route: string, has_import: boolean = false) {
	const target = event.target as HTMLElement;
	const isTextInput =
		target instanceof HTMLInputElement &&
		(target.type === 'search' ||
			target.type === 'text' ||
			target.type === 'number' ||
			target.type === 'tel');
	const isCmdPressed = event.metaKey || event.ctrlKey;
	const key = event.key?.toLowerCase();

	if (isTextInput) {
		if (!isCmdPressed) return;
		switch (key) {
			case 'a':
				if (target.value.trim() !== '') {
					target.select();
				} else {
					event.preventDefault();
					goto(`/${route}/add`);
				}
				break;
			case 'i':
				if (has_import) {
					event.preventDefault();
					goto(`/${route}/import`);
				}
				break;
		}
	} else {
		if (isCmdPressed) {
			if (key === 'a' || key === 'i') {
				event.preventDefault();
				goto(key === 'a' ? `/${route}/add` : `/${route}/import`);
			} else if (key === 'f') {
				event.preventDefault();
				const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
				searchInput.focus();
			}
		}
	}
}
