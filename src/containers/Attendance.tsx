import { useState } from 'react';

import { Container } from '../components/common';
import { StatsCard, AttendanceTable } from '../components/Attendance';
import { DEFAULT_PAGINATION_SIZE } from '../config';
import { useGetAttendanceQuery } from '../store/queries';

const Attendance = () => {
	const [offset, setOffset] = useState(0);
	const { data, refetch, isLoading, isFetching } = useGetAttendanceQuery({
		limit: DEFAULT_PAGINATION_SIZE,
		offset,
	});

	return (
		<Container
			background="bg-gray-100"
			heading="Attendance"
			refresh={{
				onClick: refetch,
				loading: isFetching,
			}}
			loading={isLoading}
			paginate={
				data
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
					<StatsCard />
					<AttendanceTable attendance={data ? data.result : []} />
				</>
			)}
		</Container>
	);
};

export default Attendance;
