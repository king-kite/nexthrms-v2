import { useCallback, useState } from 'react';

import { Container, Modal } from '../../../components/common';
import {
	Cards,
	Form,
	Topbar,
	LeaveAdminTable,
} from '../../../components/Leaves';
import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useAlertContext } from '../../../store/contexts';
import {
	useGetLeavesAdminQuery,
	useCreateLeaveMutation,
} from '../../../store/queries';
import {
	CreateLeaveQueryType,
	CreateLeaveErrorResponseType,
	GetLeavesResponseType,
} from '../../../types';

const Leave = ({ leaves }: { leaves: GetLeavesResponseType['data'] }) => {
	const [dateQuery, setDateQuery] = useState({ from: '', to: '' });
	const [errors, setErrors] = useState<
		CreateLeaveErrorResponseType & {
			message?: string;
		}
	>();
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [modalVisible, setModalVisible] = useState(false);

	const { open } = useAlertContext();

	const { data, isLoading, isFetching, refetch } = useGetLeavesAdminQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
		},
		{
			initialData() {
				return leaves;
			},
		}
	);

	const {
		mutate: createLeave,
		isLoading: createLoading,
		isSuccess,
	} = useCreateLeaveMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'Leave was created successfully!',
			});
		},
		onError: (err) => {
			setErrors((prevState) => ({
				...prevState,
				...err,
			}));
		},
	});

	const handleSubmit = useCallback(
		(form: CreateLeaveQueryType) => {
			setErrors(undefined);
			if (!form.employee) {
				setErrors((prevState) => ({
					...prevState,
					employee: 'Employee ID is required',
				}));
			} else createLeave(form);
		},
		[createLeave]
	);

	return (
		<Container
			heading="Leaves (Admin)"
			refresh={{
				loading: isFetching,
				onClick: () => {
					setDateQuery({ from: '', to: '' });
					refetch();
				},
			}}
			loading={isLoading}
			paginate={
				data
					? {
							loading: isFetching,
							setOffset,
							offset,
							totalItems: data.total,
					  }
					: undefined
			}
		>
			<Cards
				approved={data?.approved || 0}
				denied={data?.denied || 0}
				pending={data?.pending || 0}
			/>
			<Topbar
				adminView
				loading={isFetching}
				dateSubmit={({ fromDate, toDate }) =>
					setDateQuery({ from: fromDate, to: toDate })
				}
				searchSubmit={(value) => setSearch(value)}
				openModal={() => setModalVisible(true)}
			/>
			<LeaveAdminTable leaves={data?.result || []} />
			<Modal
				close={() => setModalVisible(false)}
				component={
					<Form
						adminView
						errors={errors}
						loading={createLoading}
						success={isSuccess}
						onSubmit={handleSubmit}
					/>
				}
				description="Fill in the form below to create a leave"
				keepVisible
				title="Create Leave"
				visible={modalVisible}
			/>
		</Container>
	);
};

export default Leave;
