import { BiRefresh } from 'react-icons/bi';
import { useAlertContext } from '../../store/contexts';
import { useGetAttendanceInfoQuery } from '../../store/queries';
import { Activity, Statistics, TimeSheet } from './index';

const StatsCard = () => {
	const { open } = useAlertContext();

	const { data, refetch, isFetching } = useGetAttendanceInfoQuery({
		onError({ message }) {
			open({
				type: 'danger',
				message,
			});
		},
	});

	// const date = new

	// const hours_spent =

	return (
		<>
			<div className="flex justify-center py-2 w-full">
				<div
					onClick={() => refetch()}
					className="bg-white cursor-pointer duration-500 mx-4 p-2 rounded-full text-gray-700 text-xs transform transition-all hover:bg-gray-200 hover:scale-110 hover:text-gray-600 md:text-sm"
				>
					<BiRefresh
						className={`${isFetching ? 'animate-spin' : ''} text-xs sm:text-sm`}
					/>
				</div>
			</div>
			<div className="gap-4 grid grid-cols-1 w-full md:gap-5 md:grid-cols-2 lg:grid-cols-3">
				<TimeSheet loading={isFetching} timesheet={data?.timesheet} />
				<Statistics
					today={0}
					week={0}
					month={0}
					overtime={0}
					// today={data?.statistics?.today || 0}
					// week={data?.statistics?.week || 0}
					// month={data?.statistics?.month || 0}
					// overtime={data?.statistics?.overtime || 0}
				/>
				{/* <Activity week_hours={data ? data.week_hours : undefined} /> */}
				<Activity week_hours={undefined} />
			</div>
		</>
	);
};

export default StatsCard;
