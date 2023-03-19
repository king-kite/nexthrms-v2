import { useState } from 'react';

import { Container } from '../../components/common';
import { StatsCard, AttendanceTable } from '../../components/Attendance';
import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import { useGetAttendanceQuery } from '../../store/queries';
import {
	GetAttendanceResponseType,
	GetAttendanceInfoResponseType,
} from '../../types';

const Attendance = ({
	attendanceData,
	attendanceInfo,
}: {
	attendanceData: GetAttendanceResponseType['data'];
	attendanceInfo: GetAttendanceInfoResponseType['data'];
}) => {
	const [offset, setOffset] = useState(0);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { data, refetch, isLoading, isFetching } = useGetAttendanceQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			onError(error) {
				open({
					type: 'danger',
					message: error.message || 'Sorry, unable to get attendance data',
				});
			},
		},
		{
			initialData() {
				return attendanceData;
			},
		}
	);

	return (
		<Container
			background="bg-gray-100"
			heading="Attendance"
			refresh={{
				onClick: refetch,
				loading: isFetching,
			}}
			error={!authData?.employee ? { statusCode: 403 } : undefined}
			loading={isLoading}
			paginate={
				authData?.employee && data
					? {
							loading: isFetching,
							offset,
							setOffset,
							totalItems: data ? data.total : 0,
					  }
					: undefined
			}
		>
			{data && (
				<>
					<StatsCard attendanceInfo={attendanceInfo} />
					<AttendanceTable attendance={data ? data.result : []} />
				</>
			)}
		</Container>
	);
};

export default Attendance;
