import React from 'react';
import { StatusProgressBar } from '../common';
import { AttendanceInfoType } from '../../types';

const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

function Statistics({
	timesheet,
	timeline,
	statistics,
}: {
	timesheet?: AttendanceInfoType | null;
	timeline: AttendanceInfoType[];
	statistics: AttendanceInfoType[];
}) {
	const overtime = 0;

	const today = React.useMemo(
		() =>
			timesheet
				? getTimeSpent({
						punchIn: timesheet.punchIn,
						current: timesheet.punchOut,
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
						result={today}
						value={(today ? Math.round(today * 100) : 0) + '%'}
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
						value={(month ? Math.round(month * 100) : 0) + '%'}
					/>
				</div>
				<div className="my-3">
					<StatusProgressBar
						background="bg-purple-600"
						title="Remaining for month"
						result={month ? 1 - month : 0}
						value={`${month ? Math.round((1 - month) * 100) : 0}%`}
					/>
				</div>
				<div className="my-3">
					<StatusProgressBar
						background="bg-blue-600"
						title="Overtime (Today)"
						result={overtime || 0}
						value={`${overtime ? Math.floor(overtime * 100) : 0}%`}
					/>
				</div>
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
}: {
	punchIn: Date | string | number;
	start?: Date | string | number;
	end?: Date | string | number;
	current?: Date | string | number;
}) {
	if (!punchIn) return 0;

	const startDate = typeof start !== 'object' ? new Date(start) : start;
	const endDate = typeof end !== 'object' ? new Date(end) : end;
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
		});

		return total + timeSpent;
	}, 0);

	// Divide by 6. From monday to saturday
	return totalTime / divider;
}
