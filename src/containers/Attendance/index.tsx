import { useMemo, useState } from 'react';

import { Container } from '../../components/common';
import { StatsCard, AttendanceTable } from '../../components/Attendance';
import { DEFAULT_PAGINATION_SIZE, permissions } from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import { useGetAttendanceQuery } from '../../store/queries';
import {
	GetAttendanceResponseType,
	GetAttendanceInfoResponseType,
} from '../../types';
import { hasModelPermission } from '../../utils';

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

	const [canMark, canView] = useMemo(() => {
		const canMark = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.attendance.MARK])
			: false;
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.attendance.VIEW,
			  ]) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) =>
						perm.modelName === 'attendance' && perm.permission === 'VIEW'
			  )
			: false;
		return [canMark, canView];
	}, [authData]);

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
			error={!canView && !canMark ? { statusCode: 403 } : undefined}
			loading={isLoading}
			paginate={
				(canView || canMark) && data
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
