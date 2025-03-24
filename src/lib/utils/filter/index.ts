import type { FilterOption } from '@/types/filter';
import { convertToNormalText } from '@/utils/text';

export function generateOptions<T, FilterType = string>(
	data: T[],
	key: keyof T,
	options?: {
		icon_matcher?: FilterOption<FilterType>[];
		label_prefix?: string;
		convert_to_normal_text?: boolean;
	}
): FilterOption<string | FilterType>[] {
	const { icon_matcher, label_prefix, convert_to_normal_text } = options || {};
	return Array.from(
		new Map(
			data.map((option) => {
				const _value = convert_to_normal_text ? convertToNormalText(option[key] as unknown as FilterType) : option[key] as unknown as string;
				return [
					_value,
					{
						value: _value,
						label: label_prefix ? `${label_prefix} ${_value}` : _value,
						icon: icon_matcher ? getIcon(icon_matcher, _value) : undefined
					}
				];
			})
		).values()
	).sort((a, b) => {
		const numA = parseFloat(a.label.match(/\d+(\.\d+)?/)?.[0] || 'NaN');
		const numB = parseFloat(b.label.match(/\d+(\.\d+)?/)?.[0] || 'NaN');

		// Determine sorting method: numeric if both labels contain numbers, otherwise lexicographic
		if (!isNaN(numA) && !isNaN(numB)) {
			return numA - numB; // Numeric comparison
		}
		return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' });
	});
}

export function getIcon<FilterType>(items: Array<FilterOption<FilterType>>, value: string) {
	const status = items.find((s) => s.value === value);
	return status?.icon;
}
