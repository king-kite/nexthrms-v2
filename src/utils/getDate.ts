export const getDate = (
	dateString?: string | Date,
	str = false
): Date | string => {
	if (dateString) {
		const date =
			typeof dateString === 'string' ? new Date(dateString) : dateString;
		return str ? date.toLocaleDateString('en-CA') : date;
	} else {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		return str ? date.toLocaleDateString('en-CA') : date;
	}
};

export const getDateString = (
	_date?: Date,
	_type?: 'date' | 'day' | 'month' | 'year'
) => {
	const date = _date || new Date();
	const days = [
		'sunday',
		'monday',
		'tuesday',
		'wednesday',
		'thursday',
		'friday',
		'saturday',
		'sunday',
	];
	const months = [
		'january',
		'february',
		'march',
		'april',
		'may',
		'june',
		'july',
		'august',
		'september',
		'october',
		'november',
		'december',
	];

	switch (_type) {
		case 'date':
			return date.getDate();
		case 'day':
			return days[date.getDay()];
		case 'month':
			return months[date.getMonth()];
		case 'year':
			return date.getFullYear();
		default:
			return days[date.getDay()];
	}
};

export const getNextDate = (
	date: Date | string,
	nod = 1,
	str = false
): Date | string => {
	// nod => no_of_days
	const number_of_days = nod * 24 * 60 * 60 * 1000;
	const dateTime = typeof date === 'string' ? new Date(date) : date;
	dateTime.setHours(0, 0, 0, 0);

	const nd = new Date(number_of_days + dateTime.getTime());
	return str ? nd.toLocaleDateString('en-CA') : nd;
};

export function getNoOfDays(start: Date | string, end: Date | string): number {
	const startEdit = new Date(start); startEdit.setHours(0, 0, 0, 0);
	const endEdit = new Date(end); endEdit.setHours(0, 0, 0, 0);
	const startDate = startEdit.getTime();
	const endDate = endEdit.getTime();
	return (endDate - startDate) / (1000 * 60 * 60 * 24);
}

/*

Return sunday in the specified week
const sunday = getWeekDate(new Date(), 0)

Return monday in the specified week
const monday = getWeekDate(new Date(), 1)

*/

export function getWeekDate(
	weekDate: Date | string = new Date(),
	day: number = 0
) {
	const aDay = 24 * 60 * 60 * 1000;
	const currentDate =
		typeof weekDate === 'string' ? new Date(weekDate) : weekDate;
	const weekDay = new Date(
		currentDate.getTime() - +(currentDate.getDay() - day) * aDay
	);
	weekDay.setHours(0, 0, 0, 0);
	return weekDay;
}

export function getFirstDateOfMonth(pdate: Date | string = new Date()) {
	const date = typeof pdate === 'string' ? new Date(pdate) : pdate;
	const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
	return firstDate;
}

export default getDate;
