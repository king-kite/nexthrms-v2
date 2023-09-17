import { Dayjs } from 'dayjs';

import { getDate, getFirstDateOfMonth, getLastDateOfMonth, getNoOfDays } from '../dates';
import { AttendanceInfoType } from '../../types';

type TimeDataType = {
	normal: number;
	overtime: number;
	percentage: number;
	overtimePercentage: number;
};

// Function to get the total number of working days in a month
function getTotalDays(_date: Date | string) {
	const date = getDate(_date) as Date;
	const firstDate = getFirstDateOfMonth(date);
	const lastDate = getLastDateOfMonth(date);
	const numberOfDays = getNoOfDays(firstDate, lastDate);

	// Loop through the number of days and number of days to work
	// If the user does not work on all days
	let totalDays = 0;

	for (let i = 1; i <= numberOfDays; i++) {
		let month: string | number = firstDate.getMonth() + 1;
		month = month > 9 ? month : month.toString().padStart(2, '0');
		let day: string | number = firstDate.getDate();
		day = day > 9 ? day : day.toString().padStart(2, '0');
		const date = getDate(`${firstDate.getFullYear()}-${month}-${day}`, 'dayjs') as Dayjs;
		// not sunday
		if (date.get('day') !== 0) totalDays++;
	}
	// days * hours = total hours;
	return totalDays;
}

export const totalDayHours = 10;
export const totalWeekHours = 6 * totalDayHours;

// get the total working hours in a month
// i.e total days * hours per day = total hours;
export const totalMonthHours = (date: Date | string) => getTotalDays(date) * totalDayHours;

// get the total overtime hours
// i.e. If an employee has overtime every working day,
// how many hours from closing time till midnight is possible for e.g. 6
export const totalOvertimeMonthHours = (date: Date | string) => getTotalDays(date) * 6;

// Set the closing time to 6pm at 1970-01-01
const closingTime = (getDate(0, 'dayjs') as Dayjs)
	.set('hour', 18)
	.set('minute', 0)
	.set('second', +0)
	.set('millisecond', 0)
	.toDate();

const todayDate = getDate(getDate(undefined, true), 'dayjs') as Dayjs;

// get hours info spent on a date
export function getHours({
	date: _date,
	overtime: isOvertime,
	punchIn: originalPunchIn,
	punchOut: originalPunchOut,
}: AttendanceInfoType): TimeDataType {
	const date = getDate(_date) as Date;
	// date's hours would have been set to 0 upon creation ie.ie setHours(0, 0, 0, 0)
	const isTodayDate =
		todayDate.isSame(date, 'date') &&
		todayDate.isSame(date, 'month') &&
		todayDate.isSame(date, 'year');

	// If not today date and no punch out, employee forgot to punch out
	if (!isTodayDate && !originalPunchOut)
		return { normal: 0, overtime: 0, percentage: 0, overtimePercentage: 0 };

	// Recall date's hours are set to 0 i.e. setHours(0, 0, 0, 0);
	const punchIn = getDate(originalPunchIn) as Date;

	// TODO: Not Implemented Yet
	// Remove overtime from clock in i.e if resumption time is 8am and the user
	// clock in at 7.30am, remove the 30minutes from the normal time and add it to
	// overtime.

	// Get the total hours spent from the punchIn to the closingTime
	// i.e. the normal hours
	let normal: number = 0;

	if (originalPunchOut) {
		// Only use the closing time if the person clocks out past the closing time
		const punchOut = getDate(originalPunchOut) as Date;
		if (punchOut.getTime() > closingTime.getTime())
			normal = (closingTime.getTime() - punchIn.getTime()) / (1000 * 60 * 60);
		else normal = (punchOut.getTime() - punchIn.getTime()) / (1000 * 60 * 60);
	} else if (isTodayDate) {
		// If the user is yet to clock out
		// Get the current time
		const currentTime = (getDate(undefined, 'dayjs') as Dayjs)
			.set('year', 1970)
			.set('month', 0)
			.set('date', 1)
			.toDate();
		normal = (currentTime.getTime() - punchIn.getTime()) / (1000 * 60 * 60);
	}

	// Make sure normal hours spent is not greater than the totalDayHours
	normal = normal > totalDayHours ? totalDayHours : normal < 0 ? 0 : normal;

	// percentage hours spent at work
	const percentage = (normal / totalDayHours) * 100;

	if (!isOvertime) return { normal, overtime: 0, percentage, overtimePercentage: 0 };

	const currentTime = (getDate(undefined, 'dayjs') as Dayjs)
		.set('year', 1970)
		.set('month', 0)
		.set('date', 1)
		.toDate();

	const punchOut = originalPunchOut ? (getDate(originalPunchOut) as Date) : currentTime; // if today date and no punch means the day is yet to end

	// Check if the punchOut time is less than closing time and return 0 for overtime
	if (punchOut.getTime() <= closingTime.getTime())
		return { normal, overtime: 0, percentage, overtimePercentage: 0 };

	// Get the total hours spent from the closingTime to punchOut time if there is overtime
	const overtime = (punchOut.getTime() - closingTime.getTime()) / (1000 * 60 * 60);
	const overtimePercentage = (overtime / totalOvertimeMonthHours(date)) * 100;

	return { normal, overtime, percentage, overtimePercentage };
}
