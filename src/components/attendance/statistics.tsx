import React from 'react';

import StatusProgressBar from '../common/status-progress-bar';
import { AttendanceInfoType } from '../../types';
import {
	getDate,
	getFirstDateOfMonth,
	getLastDateOfMonth,
	getNoOfDays,
} from '../../utils/dates';

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

const totalDayHours = 10;
const totalWeekHours = 6 * totalDayHours;

// get the total working hours in a month
// i.e total days * hours per day = total hours;
const totalMonthHours = (date: Date | string) =>
	getTotalDays(date) * totalDayHours;

// get the total overtime hours
// i.e. If an employee has overtime every working day,
// how many hours from closing time till midnight is possible for e.g. 6
const totalOvertimeMonthHours = (date: Date | string) => getTotalDays(date) * 6;

// Set the closing time to 6pm at 1970-01-01
const closingTime = new Date(0);
closingTime.setHours(18, 0, 0, 0);

const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

// get hours info spent on a date
function getHours({
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

function Statistics({
	timesheet,
	timeline,
	statistics,
}: {
	timesheet?: AttendanceInfoType | null;
	timeline: AttendanceInfoType[];
	statistics: AttendanceInfoType[];
}) {
	const today = React.useMemo(() => {
		if (!timesheet) return null;
		return getHours(timesheet);
	}, [timesheet]);

	const week = React.useMemo(() => {
		const totalWeekHoursSpent = timeline.reduce((acc: number, current) => {
			const value = getHours(current);
			return acc + value.normal;
		}, 0);
		return {
			normal: totalWeekHoursSpent,
			percentage: (totalWeekHoursSpent / totalWeekHours) * 100,
		};
	}, [timeline]);

	const month = React.useMemo(() => {
		const totalMonthHoursSpent = statistics.reduce((acc: number, current) => {
			const value = getHours(current);
			return acc + value.normal;
		}, 0);
		const date = getDate(timesheet?.date || statistics[0]?.date) as Date;
		const total = totalMonthHours(date);
		return {
			normal: totalMonthHoursSpent,
			percentage: (totalMonthHoursSpent / total) * 100,
			total,
		};
	}, [timesheet, statistics]);

	const overtime = React.useMemo(() => {
		const date = getDate(timesheet?.date || statistics[0]?.date) as Date;

		const totalOvertimeHoursSpent = statistics.reduce(
			(acc: number, current) => {
				const value = getHours(current);
				return acc + value.overtime;
			},
			0
		);
		const total = totalOvertimeMonthHours(date);
		return {
			overtime: totalOvertimeHoursSpent,
			percentage: (totalOvertimeHoursSpent / total) * 100,
			total,
		};
	}, [timesheet, statistics]);

	const status = React.useMemo(
		() => [
			{
				bg: 'bg-red-600',
				title: 'Today',
				result: today ? today.percentage / 100 : 0,
				value: today?.normal || 0,
				total: totalDayHours,
			},
			{
				bg: 'bg-yellow-600',
				title: 'This Week',
				result: week.percentage / 100,
				value: week.normal,
				total: totalWeekHours,
			},
			{
				bg: 'bg-green-600',
				title: 'This Month',
				result: month.percentage / 100,
				value: month.normal,
				total: month.total,
			},
			{
				bg: 'bg-purple-600',
				title: 'Remaining hours for month',
				result: month.total / month.normal,
				value: month.total - month.normal,
			},
			{
				bg: 'bg-blue-600',
				title: 'Overtime for the month',
				result: overtime.percentage / 100,
				value: overtime.overtime,
				total: overtime.total,
			},
		],
		[month, overtime, today, week]
	);

	return (
		<div className="bg-white px-4 py-2 rounded-lg shadow-lg">
			<h3 className="capitalize font-black my-2 text-gray-700 text-lg tracking-wider md:text-xl lg:text-lg">
				statistics
			</h3>
			<div>
				{status.map((item, index) => (
					<div key={index} className="my-3">
						<StatusProgressBar
							background={item.bg}
							title={item.title}
							result={item.result}
							value={
								<strong className="text-gray-900 text-sm md:text-base">
									{item.value}
									<small> {item.total && ` / ${item.total} `} hrs</small>
								</strong>
							}
						/>
					</div>
				))}
				<div className="my-3"></div>
			</div>
		</div>
	);
}

export default Statistics;
