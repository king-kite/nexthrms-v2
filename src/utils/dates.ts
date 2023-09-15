import dayjs from 'dayjs';

type DateParamType = null | string | Date | number | dayjs.Dayjs;
type DateStringParamType = boolean | 'dayjs';

export function getDate(passedDate?: DateParamType, str: DateStringParamType = false) {
	const date = dayjs(passedDate);
	if (str === 'dayjs') return date;
	if (str === true) return date.format('YYYY-MM-DD');
	return date.toDate();
}

export function getNextDate(passedDate?: DateParamType, nod = 1, str: DateStringParamType = false) {
	// nod => no_of_days
	const date = getDate(passedDate, 'dayjs') as dayjs.Dayjs;
	const newDate = date.add(nod, 'day');

	return getDate(newDate, str);
}

export function getNoOfDays(start: DateParamType, end: DateParamType) {
	return dayjs(end).diff(start, 'day');
}

export function isEqualDate(start: DateParamType, end: DateParamType) {
	return dayjs(start).isSame(end, 'day');
}

export function isBeforeDate(start: DateParamType, end: DateParamType) {
	return dayjs(start).isBefore(end, 'day');
}

export function getOffsetDate(_date?: Date | string | number, str = false) {
	const date = getDate(_date) as Date;
	const offset = date.getTimezoneOffset();
	const add = offset < 0;
	date.setMinutes(
		add ? date.getMinutes() + Math.abs(offset) : date.getMinutes() - Math.abs(offset)
	);
	return getDate(date, str);
}

export function getStringedDate(_date?: Date | string) {
	const date = _date ? (getDate(_date) as Date) : new Date();
	let day: string | number = date.getDate();
	if (day < 10) day = `0${day}`;
	let month: string | number = date.getMonth() + 1; // month starts from 0 to 11
	if (month < 10) month = `0${month}`;
	const year = date.getFullYear();
	return `${year}-${month}-${day}`;
}

export function getStringDateTime(_date?: Date | string) {
	const date = _date ? (getDate(_date) as Date) : new Date();
	return `${date.toDateString()}, ${getStringTime(date)}`;
}

export function getStringTime(_date?: Date | string) {
	const date = _date ? (getDate(_date) as Date) : new Date();
	const _hour = date.getHours();
	const hour = _hour === 0 ? 12 : _hour > 12 ? _hour - 12 : _hour;
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const suffix = _hour > 11 ? 'pm' : 'am';
	return `${hour}:${minutes} ${suffix.toUpperCase()}`;
}

export const getDateString = (_date?: Date, _type?: 'date' | 'day' | 'month' | 'year') => {
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

/*

Return sunday in the specified week
const sunday = getWeekDate(new Date(), 0)

Return monday in the specified week
const monday = getWeekDate(new Date(), 1)

*/

export function getWeekDate(weekDate: Date | string = new Date(), day: number = 0) {
	const aDay = 24 * 60 * 60 * 1000;
	const currentDate = typeof weekDate === 'string' ? new Date(weekDate) : weekDate;
	const weekDay = new Date(currentDate.getTime() - +(currentDate.getDay() - day) * aDay);
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
	// Get the fisrt date for next month
	const nextMonth = new Date(date.getFullYear(), month, 1, 0, 0, 0, 0);
	// then go back 1ms to get the previous date at 11:59:59pm
	return new Date(nextMonth.getTime() - 1000);
}

export default getDate;
