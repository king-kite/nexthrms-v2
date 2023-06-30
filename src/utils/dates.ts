export function getStringedDate(_date?: Date | string) {
	const date = _date
		? getDate(_date) as Date
		: new Date();
	let day: string | number = date.getDate();
	if (day < 10) day = `0${day}`;
	let month: string | number = date.getMonth() + 1; // month starts from 0 to 11
	if (month < 10) month = `0${month}`;
	const year = date.getFullYear();
	return `${year}-${month}-${day}`;
}

export function getStringDateTime(_date?: Date | string) {
	const date = _date
		? getDate(_date) as Date
		: new Date();
	return `${date.toDateString()}, ${getStringTime(date)}`;
}

export function getStringTime(_date?: Date | string) {
	const date = _date
		? getDate(_date) as Date
		: new Date();
	const _hour = date.getHours();
	const hour = _hour === 0 ? 12 : _hour > 12 ? _hour - 12 : _hour;
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const suffix = _hour > 11 ? 'pm' : 'am';
	return `${hour}:${minutes} ${suffix.toUpperCase()}`;
}

export const getDate = (
	dateString?: string | Date,
	str = false
): Date | string => {
	if (dateString) {
		const date =
			typeof dateString === 'string' ? new Date(dateString) : dateString;
		return str ? getStringedDate(date) : date;
	} else {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		return str ? getStringedDate(date) : date;
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
	const dateTime = getDate(date) as Date;
	dateTime.setHours(0, 0, 0, 0);

	const nd = new Date(number_of_days + dateTime.getTime());
	return str ? getStringedDate(nd) : nd;
};

export function getNoOfDays(start: Date | string, end: Date | string): number {
	const startEdit = getDate(start) as Date;
	startEdit.setHours(0, 0, 0, 0);
	const endEdit = getDate(end) as Date;
	endEdit.setHours(0, 0, 0, 0);
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
	const date = getDate(pdate) as Date;
	const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
	return firstDate;
}

export function getLastDateOfMonth(_date: Date | string) {
	const date = getDate(_date) as Date;
	const month = date.getMonth() >= 11 ? 0 : date.getMonth() + 1;
	// Get the date for next month and go back 1 day
	const nextMonth = new Date(date.getFullYear(), month, 1);
	const lastDayTime = nextMonth.getTime() - (1000 * 60 * 60 * 24);
	return new Date(lastDayTime);
}

export default getDate;
