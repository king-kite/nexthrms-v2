import type { Dayjs } from 'dayjs';
import { Button, Loader } from 'kite-react-tailwind';
import React from 'react';
import { BiRefresh } from 'react-icons/bi';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import { permissions } from '../../config';
import { useInterval } from '../../hooks';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import { usePunchAttendanceMutation } from '../../store/queries/attendance';
import { AttendanceInfoType } from '../../types';
import { hasModelPermission, getDate } from '../../utils';
import { getHours } from '../../utils/serializers/attendance';

// time is in minutes
function getTime(time: number): number | string {
	const hour = Math.trunc(time / 60);
	const minute = time % 60;

	if (minute <= 0) return hour;
	return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function TimeSheet({
	fetching,
	loading,
	refetch,
	timesheet,
}: {
	fetching: boolean;
	loading: boolean;
	refetch: () => void;
	timesheet?: AttendanceInfoType | null;
}) {
	const [currentTime, setCurrentTime] = React.useState(() => {
		// Get the current time i.e set the date to 1st Jan, 1970
		let currentTime = getDate(undefined, 'dayjs') as Dayjs;
		currentTime = currentTime.set('year', 1970).set('month', 0).set('date', 1);
		return currentTime.toDate();
	});

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canMark] = React.useMemo(() => {
		if (!authData) return [false];
		const canMark =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.attendance.MARK]);
		return [canMark];
	}, [authData]);

	const overtime = React.useMemo(() => {
		if (!timesheet || !timesheet.overtime) return null;
		const value = getHours(timesheet).overtime;
		if (value <= 0) return 0;
		return `${value.toFixed(2)} ${value > 1 ? 'hrs' : 'hr'}`;
	}, [timesheet]);

	const { handlePunch, isLoading } = usePunchAttendanceMutation({
		onSuccess() {
			open({
				type: 'success',
				message: timesheet?.punchIn ? 'Punched Out' : 'Punched In',
			});
		},
		onError({ message }) {
			open({
				type: 'danger',
				message,
			});
		},
	});

	// Use Intervals to update the time
	const checkTime = React.useCallback(() => {
		let nowTime = getDate(undefined, 'dayjs') as Dayjs;
		nowTime = nowTime.set('year', 1970).set('month', 0).set('date', 1);
		if (!nowTime.isSame(currentTime, 'minute')) setCurrentTime(nowTime.toDate());
	}, [currentTime]);

	useInterval(checkTime, 1000);

	const { disabled, punchIn, suffix, time } = React.useMemo(() => {
		if (!timesheet) return { disabled: false, punchIn: undefined, suffix: 'min', time: 0 };

		const punchIn = getDate(timesheet.punchIn) as Date;
		const punchOut = timesheet.punchOut ? new Date(timesheet.punchOut) : undefined;

		const disabled = punchIn && punchOut ? true : false;

		// Get difference of time in minutes, rounded off and taking the absolute value.
		const diff = punchIn
			? Math.abs(
					Math.round(
						((punchOut ? punchOut.getTime() : currentTime.getTime()) - punchIn.getTime()) /
							(1000 * 60)
					)
			  )
			: 0;
		let time = diff >= 60 ? getTime(diff) : diff;

		const suffix = diff <= 1 ? 'min' : diff < 60 ? 'mins' : time === 1 ? 'hr' : 'hrs';
		return { disabled, punchIn, suffix, time };
	}, [timesheet, currentTime]);

	return (
		<div className="bg-white px-4 py-2 rounded-lg shadow-lg">
			<div className="flex items-center justify-between">
				<h3 className="capitalize font-black my-2 text-gray-700 text-lg tracking-wider sm:text-center md:text-left md:text-xl">
					timesheet
				</h3>
				<div
					onClick={refetch}
					className="bg-white cursor-pointer duration-500 p-2 rounded-full text-gray-700 text-xs transform transition-all hover:bg-gray-200 hover:scale-110 hover:text-gray-600 md:text-sm"
				>
					<BiRefresh className={`${fetching ? 'animate-spin' : ''} text-xs sm:text-sm`} />
				</div>
			</div>
			<div className="bg-gray-100 border border-gray-300 max-w-xs mx-auto my-1 px-3 py-2 rounded-lg">
				<span className="font-semibold my-3 inline-block text-gray-900 text-sm lg:my-1">
					Punch In at
				</span>
				<p className="capitalize text-gray-500 tracking-wide text-lg md:text-base">
					{punchIn ? punchIn.toLocaleTimeString() : '------------'}
				</p>
			</div>
			<div className="flex justify-center items-center my-4 lg:my-3">
				<div className="border-4 border-gray-300 flex h-28 items-center justify-center rounded-full w-28">
					{loading || isLoading ? (
						<Loader type="dotted" color="primary" size={4} />
					) : (
						<span className="font-semibold text-center text-gray-800 text-2xl md:text-3xl lg:text-2xl">
							{time} {suffix}
						</span>
					)}
				</div>
			</div>
			{canMark && (
				<div className="flex justify-center items-center my-1">
					<div>
						<Button
							bg={`${
								punchIn
									? 'bg-secondary-500 hover:bg-secondary-600 focus:ring-secondary-300'
									: 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-300'
							} group focus:outline-none focus:ring-2 focus:ring-offset-2"`}
							caps
							disabled={fetching || isLoading || disabled}
							padding="px-4 py-2 md:px-6 md:py-3 lg:px-4 lg:py-2"
							rounded="rounded-xl"
							onClick={!disabled ? () => handlePunch(punchIn ? 'OUT' : 'IN') : undefined}
							title={
								disabled
									? 'Punched Out'
									: punchIn
									? isLoading
										? 'Punching Out...'
										: 'Punch Out'
									: isLoading
									? 'Punching In...'
									: 'Punch In'
							}
							titleSize="text-base sm:tracking-wider md:text-lg"
						/>
					</div>
				</div>
			)}
			<div className="grid grid-cols-2 gap-4 my-3 pt-2 lg:my-1">
				<div className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-lg text-center w-full">
					<span className="font-semibold my-1 inline-block text-gray-900 text-sm">Break</span>
					<p className="text-gray-500 tracking-wide text-sm uppercase">coming soon</p>
				</div>
				<div className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-lg text-center w-full">
					<span className="font-semibold my-1 inline-block text-gray-900 text-sm">Overtime</span>
					<p className="flex justify-center text-center text-gray-500 tracking-wide text-base">
						{overtime === null ? (
							<FaTimesCircle className="text-sm text-red-700" />
						) : overtime === 0 ? (
							<FaCheckCircle className="text-sm text-green-700" />
						) : (
							overtime
						)}
					</p>
				</div>
			</div>
		</div>
	);
}

export default TimeSheet;
