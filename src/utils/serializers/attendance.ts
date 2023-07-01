import { getDate, getFirstDateOfMonth, getLastDateOfMonth, getNoOfDays } from '../dates'
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
		const date = new Date(firstDate.getFullYear(), firstDate.getMonth(), i);
		// not sunday
		if (date.getDay() !== 0) totalDays++;
	}
	// days * hours = total hours;
	return totalDays;
}

export const totalDayHours = 10;
export const totalWeekHours = 6 * totalDayHours;

// get the total working hours in a month
// i.e total days * hours per day = total hours;
export const totalMonthHours = (date: Date | string) =>
	getTotalDays(date) * totalDayHours;

// get the total overtime hours
// i.e. If an employee has overtime every working day,
// how many hours from closing time till midnight is possible for e.g. 6
export const totalOvertimeMonthHours = (date: Date | string) => getTotalDays(date) * 6;

// Set the closing time to 6pm at 1970-01-01
const closingTime = new Date(0);
closingTime.setHours(18, 0, 0, 0);

const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

// get hours info spent on a date
export function getHours({
	date: _date,
	overtime: isOvertime,
	punchIn: originalPunchIn,
	punchOut: originalPunchOut,
}: AttendanceInfoType): TimeDataType {
	const date = getDate(_date) as Date;
	// date's hours would have been set to 0 upon creation ie.ie setHours(0, 0, 0, 0)
	const isTodayDate = date.getTime() === todayDate.getTime();

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
	let normal = (closingTime.getTime() - punchIn.getTime()) / (1000 * 60 * 60);
	// Make sure normal hours spent is not greater than the totalDayHours
	normal = normal > totalDayHours ? totalDayHours : normal;

	// percentage hours spent at work
	const percentage = (normal / totalDayHours) * 100;

	if (!isOvertime)
		return { normal, overtime: 0, percentage, overtimePercentage: 0 };

	const punchOutDate = new Date();
	punchOutDate.setFullYear(1970, 0, 1); // Changed to 0

	const punchOut = originalPunchOut
		? (getDate(originalPunchOut) as Date)
		: punchOutDate; // if today date and no punch means the day is yet to end

	// Get the total hours spent from the closingTime to punchOut time if there is overtime
	const overtime =
		(punchOut.getTime() - closingTime.getTime()) / (1000 * 60 * 60);
	const overtimePercentage = (overtime / totalOvertimeMonthHours(date)) * 100;

	return { normal, overtime, percentage, overtimePercentage };
}
