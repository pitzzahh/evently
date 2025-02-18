function maskPart(part: string): string {
	const length = part.length;
	if (length <= 2) return part; // Leave very short parts as-is
	if (length <= 4) return part[0] + '*'.repeat(length - 2) + part[length - 1];

	// Reveal the first 2 and last 2 characters for longer parts
	return part.slice(0, 2) + '*'.repeat(length - 4) + part.slice(-2);
}

export function maskEmailAddress(emailAddress?: string): string | undefined {
	if (!emailAddress) return undefined;

	// Regex to match username, domain, and TLD parts
	const emailRegex = /^([\w.-]+)@([\w-]+)\.([\w.]+)$/;
	const match = emailAddress.match(emailRegex);

	if (!match) return emailAddress;

	let [, username, domain, tld] = match;

	// Mask each component of the username separately if it contains periods
	const maskedUsername = username.split('.').map(maskPart).join('.');

	return `${maskedUsername}@${maskPart(domain)}.${tld}`;
}

export function sanitize(value: any): string {
	return value || '';
}

export function convertToNormalText(
	text: unknown,
	include_separators: boolean = false,
	separators: string[] = []
): string {
	let textStr = String(text);
	let trimmedText = textStr.trim().replaceAll('_', ' ').replaceAll('-', ' ');

	if (include_separators && separators.length > 0) {
		for (const separator of separators) {
			trimmedText = trimmedText.replaceAll(separator, ' ');
		}
	}

	return trimmedText.charAt(0).toUpperCase() + trimmedText.slice(1).toLowerCase();
}

export function generateFullName(
	data: {
		first_name: string;
		last_name: string;
		middle_name?: string | null;
	},
	options: Partial<{
		prefix: string;
		postfix: string;
		include_last_name: boolean;
	}>
): string {
	const { first_name, last_name, middle_name } = data;
	const { prefix, postfix, include_last_name } = options;
	const _data = include_last_name
		? [prefix?.trim(), first_name.trim(), middle_name?.trim(), last_name.trim(), postfix?.trim()]
		: [prefix?.trim(), first_name.trim(), middle_name?.trim(), postfix?.trim()];

	return _data.filter(Boolean).join(' ').replace(/\s+/g, ' ');
}
// TODO: Test getInitials function\
export const getInitials = (name: string | undefined) => {
	if (!name) return '';
	const names = name.split(' ');
	let initials = names[0].substring(0, 1).toUpperCase();

	if (names.length === 3) {
		initials += names[1].substring(0, 1).toUpperCase();
	} else {
		initials += names[names.length - 1].substring(0, 1).toUpperCase();
	}
	return initials;
}; /**
 * Extracts the first token from a given path string.
 *
 * @param path - The input path string.
 * @returns The first token in the path.
 */
// TODO: Test extractMainRoute function
export const extractMainRoute = (path: string): string => {
	if (path === '/') {
		return '/';
	}

	const tokens = path.split('/').filter((token) => token);

	return tokens.length > 0 ? `/${tokens[0]}` : '';
};
// TODO: Test generateNotFoundMessage function
export function generateNotFoundMessage<T extends object>(query: T): string {
	const fields = Object.entries(query)
		.filter(([_, value]) => value !== undefined && value !== null)
		.map(([key, value]) => {
			if (value instanceof Date) {
				return `${key}: ${value.toISOString().split('T')[0]}`;
			}
			return `${key}: ${value}`;
		});

	return `${fields.join(' or ')} not found.`;
}

export function replaceTextWithMarker(text: string, match: string, regexp: RegExp): string {
	return text.replaceAll(regexp, (match) => `<mark>${match}</mark>`)
}

