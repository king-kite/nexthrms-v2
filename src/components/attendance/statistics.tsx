import React from 'react';

import StatusProgressBar from '../common/status-progress-bar';
import { AttendanceInfoType } from '../../types';
import { getDate } from '../../utils/dates';
import {
	getHours,
	totalDayHours,
	totalWeekHours,
	totalMonthHours,
	totalOvertimeMonthHours,
} from '../../utils/serializers/attendance';

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

		const totalOvertimeHoursSpent = statistics.reduce((acc: number, current) => {
			const value = getHours(current);
			return acc + value.overtime;
		}, 0);
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
									{Math.round(item.value)}
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
