import dayjs from 'dayjs';
import React from 'react';

import Activity from './activity';
import Statistics from './statistics';
import TimeSheet from './time-sheet';
import { useAlertContext } from '../../store/contexts';
import { useGetAttendanceInfoQuery } from '../../store/queries/attendance';

const StatsCard = () => {
	const { open } = useAlertContext();

	const [date] = React.useState(() => {
		const currentDate = dayjs();
		return currentDate.format('YYYY-MM-DD');
	});

	const { data, refetch, isFetching, isLoading } = useGetAttendanceInfoQuery({
		date,
		onError({ message }) {
			open({
				type: 'danger',
				message,
			});
		},
	});

	return (
		<div className="gap-4 grid grid-cols-1 w-full md:gap-5 md:grid-cols-2 lg:grid-cols-3">
			<TimeSheet
				loading={isLoading}
				fetching={isFetching}
				timesheet={data?.timesheet}
				refetch={() => refetch()}
			/>
			<Statistics
				timesheet={data?.timesheet}
				timeline={data?.timeline || []}
				statistics={data?.statistics || []}
			/>
			<Activity timeline={data?.timeline || []} />
		</div>
	);
};

export default StatsCard;
