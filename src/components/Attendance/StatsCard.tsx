import { Activity, Statistics, TimeSheet } from './index';
import { useAlertContext } from '../../store/contexts';
import { useGetAttendanceInfoQuery } from '../../store/queries';
import { GetAttendanceInfoResponseType } from '../../types';

const StatsCard = ({
	attendanceInfo,
}: {
	attendanceInfo: GetAttendanceInfoResponseType['data'];
}) => {
	const { open } = useAlertContext();

	const { data, refetch, isFetching, isLoading } = useGetAttendanceInfoQuery(
		{
			onError({ message }) {
				open({
					type: 'danger',
					message,
				});
			},
		},
		{
			initialData() {
				return attendanceInfo;
			},
		}
	);

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
