import { DateFormatter } from '@internationalized/date';

export const monthFormatter = new DateFormatter('en-US', {
	dateStyle: 'long'
});

export function formatDateToTimeOption(date?: Date): string {
	if (!date) return 'Invalid date';
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? 'PM' : 'AM';
	const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
	const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
	return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

export function createDate(event_date: Date, time: string | undefined, defaultTime: string) {
	const { hours, minutes } = extractHoursAndMinutes(time || defaultTime);
	return new Date(
		event_date.getFullYear(),
		event_date.getMonth(),
		event_date.getDate(),
		hours,
		minutes
	);
}

export function extractHoursAndMinutes(time: string): { hours: number; minutes: number } {
	const [timePart, modifier] = time.split(' ');
	let [hours, minutes] = timePart.split(':').map(Number);

	if (modifier === 'PM' && hours !== 12) {
		hours += 12;
	} else if (modifier === 'AM' && hours === 12) {
		hours = 0;
	}

	return { hours, minutes };
}

export function formatPath(path: string): string {
	return path.replace(/^C:\\/, '').replace(/\\/g, '/');
}
export const formatDate = (date?: Date | null, lang: string = 'en-PH') => {
	return date
		? new Date(date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })
		: 'N/A';
};

export function formatDateTime(date?: Date | null, lang: string = 'en-PH') {
	return date
		? new Date(date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })
		: 'N/A';
}

/**
 * Formats a number as currency.
 *
 * @param amount - The number to be formatted.
 * @param locale - Optional. The locale to use for formatting. Defaults to 'en-PH'.
 * @returns The formatted currency string.
 */
export function formatCurrency(amount: number, locale: string = 'en-PH'): string {
	// Define currency format options
	const options: Intl.NumberFormatOptions = {
		style: 'currency',
		currency: 'PHP' // Change this to any other currency code as needed
	};

	// Create a new Intl.NumberFormat instance with the provided locale and options
	const formatter = new Intl.NumberFormat(locale, options);

	// Format the amount and return it
	return formatter.format(amount);
}
export function formatTime(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (minutes > 0) {
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} minutes and seconds`;
	} else {
		return `${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`;
	}
}

export const formatToCurrency = (value: number | null | undefined, lang: string = 'en-PH') => {
	return value
		? Intl.NumberFormat(lang, { style: 'currency', currency: 'PHP' }).format(value as number)
		: 'N/A';
};

interface LocaleData {
	belowTwenty: string[];
	tens: string[];
	thousands: string[];
	format: (whole: string, fractional: string) => string;
	currency?: { whole: string; fractional: string }; // Make currency optional
}

const locales: { [key: string]: LocaleData } = {
	en: {
		belowTwenty: [
			'zero',
			'one',
			'two',
			'three',
			'four',
			'five',
			'six',
			'seven',
			'eight',
			'nine',
			'ten',
			'eleven',
			'twelve',
			'thirteen',
			'fourteen',
			'fifteen',
			'sixteen',
			'seventeen',
			'eighteen',
			'nineteen'
		],
		tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
		thousands: ['', 'thousand', 'million', 'billion', 'trillion'],
		currency: { whole: 'dollars', fractional: 'cents' },
		format: (whole, fractional) => `${whole} and ${fractional}`
	},
	en_ordinals: {
		belowTwenty: [
			'zero',
			'first',
			'second',
			'third',
			'fourth',
			'fifth',
			'sixth',
			'seventh',
			'eighth',
			'ninth',
			'tenth',
			'eleventh',
			'twelfth',
			'thirteenth',
			'fourteenth',
			'fifteenth',
			'sixteenth',
			'seventeenth',
			'eighteenth',
			'nineteenth'
		],
		tens: [
			'',
			'',
			'twentieth',
			'thirtieth',
			'fortieth',
			'fiftieth',
			'sixtieth',
			'seventieth',
			'eightieth',
			'ninetieth'
		],
		thousands: ['', 'thousandth', 'millionth', 'billionth', 'trillionth'],
		format: (whole, fractional) => whole
	},
	en_ph: {
		belowTwenty: [
			'zero',
			'one',
			'two',
			'three',
			'four',
			'five',
			'six',
			'seven',
			'eight',
			'nine',
			'ten',
			'eleven',
			'twelve',
			'thirteen',
			'fourteen',
			'fifteen',
			'sixteen',
			'seventeen',
			'eighteen',
			'nineteen'
		],
		tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
		thousands: ['', 'thousand', 'million', 'billion', 'trillion'],
		currency: { whole: 'pesos', fractional: 'centavos' },
		format: (whole, fractional) => `${whole} and ${fractional}`
	},
	es: {
		belowTwenty: [
			'cero',
			'uno',
			'dos',
			'tres',
			'cuatro',
			'cinco',
			'seis',
			'siete',
			'ocho',
			'nueve',
			'diez',
			'once',
			'doce',
			'trece',
			'catorce',
			'quince',
			'dieciséis',
			'diecisiete',
			'dieciocho',
			'diecinueve'
		],
		tens: [
			'',
			'',
			'veinte',
			'treinta',
			'cuarenta',
			'cincuenta',
			'sesenta',
			'setenta',
			'ochenta',
			'noventa'
		],
		thousands: ['', 'mil', 'millón', 'mil millones', 'billón'],
		currency: { whole: 'dólares', fractional: 'centavos' },
		format: (whole, fractional) => `${whole} con ${fractional}`
	}
};

export function numberToWordsWithLocale(number: number, locale: string): string {
	const localeData = locales[locale];

	// Check if the locale is for ordinals
	const isOrdinal = locale.endsWith('_ordinals');

	const whole = Math.floor(number);
	const fractional = Math.round((number - whole) * 100);

	// Helper function to convert the whole number to words
	const convertWhole = (n: number): string => {
		let words = '';

		// Handle numbers below twenty
		if (n < 20) {
			words = localeData.belowTwenty[n];
		}
		// Handle tens (20, 30, ..., 90)
		else if (n < 100) {
			const tensPart = Math.floor(n / 10);
			const onesPart = n % 10;
			words = localeData.tens[tensPart] + (onesPart ? `-${localeData.belowTwenty[onesPart]}` : '');
		}
		// Handle numbers 100 and above (e.g., 123 -> "one hundred twenty-three")
		else {
			const thousandIndex = Math.floor(Math.log(n) / Math.log(1000)); // Determines which scale (thousand, million, etc.)
			const divisor = Math.pow(1000, thousandIndex);
			const prefix = Math.floor(n / divisor);
			const suffix = n % divisor;

			words = `${convertWhole(prefix)} ${localeData.thousands[thousandIndex]}`;
			if (suffix) {
				words += ` ${convertWhole(suffix)}`;
			}
		}

		return words.trim();
	};

	// Helper function to convert fractional part (cents, etc.)
	const convertFractional = (n: number): string => {
		return n === 0 ? localeData.currency?.fractional || 'cents' : localeData.belowTwenty[n];
	};

	if (isOrdinal) {
		// Ordinal logic: Use the "ordinal" specific formatting
		return localeData.format(convertWhole(whole), '');
	} else {
		// Standard number formatting with currency
		const wholeInWords = convertWhole(whole);
		const fractionalInWords = convertFractional(fractional);
		return `${wholeInWords} ${localeData.currency?.whole || 'units'} and ${fractionalInWords} ${localeData.currency?.fractional || 'parts'}`;
	}
}
