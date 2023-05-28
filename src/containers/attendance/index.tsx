import React from 'react';

import { Container, TablePagination } from '../../components/common';
import { StatsCard, AttendanceTable } from '../../components/attendance';
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
	const [offset, setOffset] = React.useState(0);
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { data, refetch, isLoading, isFetching } = useGetAttendanceQuery(
		{
			limit,
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
			disabledLoading={isLoading}
		>
			{data && (
				<>
					<StatsCard attendanceInfo={attendanceInfo} />
					<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
						<AttendanceTable attendance={data ? data.result : []} />
						{data && data?.total > 0 && (
							<TablePagination
								disabled={isFetching}
								totalItems={data.total}
								onChange={(pageNo: number) => {
									const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
									offset !== value && setOffset(value * limit);
								}}
								onSizeChange={(size) => setLimit(size)}
								pageSize={limit}
							/>
						)}
					</div>
				</>
			)}
		</Container>
	);
};

export default Attendance;
