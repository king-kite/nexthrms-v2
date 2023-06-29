import React from 'react';

import StatusProgressBar from '../common/status-progress-bar';
import { AttendanceInfoType } from '../../types';
import { getDate } from '../../utils/getDate';

const totalHoursToBeSpent = 10;

const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

// Get the spent and total number of hours on date
// function getHours({ date, overtime, punchIn, punchOut }: AttendanceInfoType) {
function getHours({ date, overtime, punchIn, punchOut }: any) {
	let closeTime = punchOut ? (getDate(punchOut) as Date) : null;
	let hoursToBeSpent = totalHoursToBeSpent + (overtime?.hours || 0);
	// If the user did not punch out
	if (!closeTime) {
		// Check if the date is the same as the current date
		const attendDate = getDate(date) as Date;
		const currentDate = new Date();

		const closingTime = new Date(); // get the closing time for the day
		closingTime.setHours(18 + (overtime?.hours || 0), 0, 0, 0); // set to 6'o clock
		if (
			currentDate.getDate() === attendDate.getDate() &&
			currentDate.getMonth() === attendDate.getMonth() &&
			currentDate.getFullYear() === attendDate.getFullYear() &&
			currentDate.getTime() <= closingTime.getTime() // Not yet closed
		) {
			// Set the closeTime to the same hours as the current date
			// But the date should be new Date(0)
			closeTime = new Date(
				1970,
				0,
				1,
				currentDate.getHours(),
				currentDate.getMinutes(),
				currentDate.getSeconds()
			);
		} else
			return {
				percentage: 0,
				spent: 0, // return 0 hours spent
				total: hoursToBeSpent,
			};
	}

	const startTime = getDate(punchIn) as Date;

	// Hours Spent => (closeTime - startTime) convert to hours
	const spent = (closeTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
	let percentage = (spent / hoursToBeSpent) * 100;
	if (percentage > 100) percentage = 100;

	return {
		percentage,
		spent,
		total: hoursToBeSpent,
	};
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
	// const today = React.useMemo(() => {
	// 	if (!timesheet) return 0;
	// 	return getHours(timesheet).percentage;
	// }, [timesheet]);
	const today = React.useMemo(
		() =>
			timesheet
				? getTimeSpent({
						punchIn: timesheet.punchIn,
						current: timesheet.punchOut,
						// overtime: timesheet.overtime?.hours,
				  })
				: 0,
		[timesheet]
	);

	const week = React.useMemo(
		() => getCummulativeTimeSpent({ attendance: timeline }),
		[timeline]
	);

	const month = React.useMemo(
		() => getCummulativeTimeSpent({ attendance: statistics, divider: 24 }),
		[statistics]
	);

	// const overtime = React.useMemo(
	// 	() =>
	// 		timesheet?.overtime?.hours
	// 			? getOvertimeSpent({
	// 					punchIn: timesheet.punchIn,
	// 					current: timesheet.punchOut,
	// 					overtime: timesheet.overtime.hours,
	// 			  })
	// 			: 0,
	// 	[timesheet]
	// );

	const monthProgress = month
		? Math.round(month * 100) > 100
			? 100
			: Math.round(month * 100)
		: 0;
	const remainProgress = month
		? Math.round((1 - month) * 100) < 0
			? 0
			: Math.round((1 - month) * 100)
		: 0;

	return (
		<div className="bg-white px-4 py-2 rounded-lg shadow-lg">
			<h3 className="capitalize font-black my-2 text-gray-700 text-lg tracking-wider md:text-xl lg:text-lg">
				statistics
			</h3>
			<div>
				<div className="my-3">
					<StatusProgressBar
						background="bg-red-600"
						title="Today"
						result={today / 100}
						value={(today ? Math.round(today) : 0) + '%'}
					/>
				</div>
				<div className="my-3">
					<StatusProgressBar
						background="bg-yellow-600"
						title="This Week"
						result={week}
						value={(week ? Math.round(week * 100) : 0) + '%'}
					/>
				</div>
				<div className="my-3">
					<StatusProgressBar
						background="bg-green-600"
						title="This Month"
						result={month}
						value={monthProgress + '%'}
					/>
				</div>
				<div className="my-3">
					<StatusProgressBar
						background="bg-purple-600"
						title="Remaining for month"
						result={month ? 1 - month : 0}
						value={remainProgress + '%'}
					/>
				</div>
				{/* <div className="my-3">
					<StatusProgressBar
						background="bg-blue-600"
						title="Overtime"
						result={overtime}
						value={(overtime ? Math.round(overtime * 100) : 0) + '%'}
					/>
				</div> */}
				<div className="my-3"></div>
			</div>
		</div>
	);
}

export default Statistics;

/*
// Total Expected Time = 10 hours = 36000000 in milliseconds

const startDate = new Date(1970, 0, 1, 8) // 8AM in the morning
// 25200000 in milliseconds === 0

const endDate = new Date(1970, 0, 1, 18) // 6PM in the evening
// 61200000 in milliseconds === 100

const currentDate = new Date(); currentDate.setFullYear(1970, 0, 1)
// set the day/year to 1970

const timeSpent = (
	(currentDate.getTime() - startDate.getTime()) / 
	(endDate.getTime() - startDate.getTime())
)
i.e
timeSpent = ((currentDate.getTime() - 25200000) / (61200000 - 25200000))
timeSpent = (currentDate.getTime() - 25200000) / 36000000)
*/

// Get the percentage of hours spent in a days
function getTimeSpent({
	start = new Date(1970, 0, 1, 8),
	end = new Date(1970, 0, 1, 18),
	punchIn,
	current, // Can use the punch out date if available
	overtime,
}: {
	punchIn: Date | string | number;
	start?: Date | string | number;
	end?: Date | string | number;
	current?: Date | string | number;
	overtime?: number;
}) {
	if (!punchIn) return 0;

	const startDate = typeof start !== 'object' ? new Date(start) : start;
	const prevEndDate = typeof end !== 'object' ? new Date(end) : end;
	const endDate = overtime
		? new Date(prevEndDate.getTime() + overtime * 60 * 60 * 1000)
		: prevEndDate;
	const punchInDate = typeof punchIn !== 'object' ? new Date(punchIn) : punchIn;
	let currentDate: Date;

	if (current) {
		if (typeof current !== 'object') currentDate = new Date(current);
		else currentDate = current;
	} else {
		currentDate = new Date();
		currentDate.setFullYear(1970, 0, 1);
	}

	// Return the value for time spent
	return (
		(currentDate.getTime() - punchInDate.getTime()) /
		(endDate.getTime() - startDate.getTime())
	);
}

// Get the total time spent everyday in a week
function getCummulativeTimeSpent({
	attendance,
	divider = 6,
}: {
	attendance: AttendanceInfoType[];
	divider?: number;
}) {
	const totalTime = attendance.reduce((total, attendance) => {
		const date = new Date(attendance.date);
		if (
			(!attendance.punchIn || !attendance.punchOut) &&
			date.getTime() !== currentDate.getTime()
		)
			return 0;

		const timeSpent = getTimeSpent({
			punchIn: attendance.punchIn,
			current: attendance.punchOut,
			// overtime: attendance.overtime?.hours,
		});

		return total + timeSpent;
	}, 0);

	// Divide by 6. From monday to saturday
	return totalTime / divider;
}

function getOvertimeSpent({
	end = new Date(1970, 0, 1, 18),
	current, // Can use the punch out date if available
	punchIn,
	overtime,
}: {
	punchIn: Date | number | string;
	overtime: number;
	start?: Date | number | string;
	end?: Date | number | string;
	current?: Date | number | string;
}) {
	if (!punchIn || !overtime) return 0;

	const today = getTimeSpent({ punchIn, current });
	if (today < 1) return 0;

	// End Date = overtime start date
	const endDate = typeof end !== 'object' ? new Date(end) : end;
	const overtimeEndDate = new Date(
		endDate.getTime() + overtime * 60 * 60 * 1000
	);
	let currentDate: Date;

	if (current) {
		if (typeof current !== 'object') currentDate = new Date(current);
		else currentDate = current;
	} else {
		currentDate = new Date();
		currentDate.setFullYear(1970, 0, 1);
	}

	// Return the value for overtime spent
	return (
		(currentDate.getTime() - endDate.getTime()) /
		(overtimeEndDate.getTime() - endDate.getTime())
	);
}
