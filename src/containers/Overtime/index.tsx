import { useCallback, useState } from 'react';

import { Container, Modal } from '../../components/common';
import { Cards, Form, Topbar, OvertimeTable } from '../../components/Overtime';
import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAlertContext } from '../../store/contexts';
import {
	useGetAllOvertimeQuery,
	useRequestOvertimeMutation,
} from '../../store/queries';
import {
	CreateOvertimeQueryType,
	CreateOvertimeErrorResponseType,
	GetAllOvertimeResponseType,
} from '../../types';

const Overtime = ({
	overtime,
}: {
	overtime: GetAllOvertimeResponseType['data'];
}) => {
	const [dateQuery, setDateQuery] = useState({ from: '', to: '' });
	const [errors, setErrors] = useState<
		CreateOvertimeErrorResponseType & {
			message?: string;
		}
	>();
	const [offset, setOffset] = useState(0);
	const [modalVisible, setModalVisible] = useState(false);

	const { open } = useAlertContext();

	const { data, isLoading, isFetching, refetch } = useGetAllOvertimeQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
		},
		{
			initialData() {
				return overtime;
			},
		}
	);

	const {
		mutate: requestOvertime,
		isLoading: createLoading,
		isSuccess,
	} = useRequestOvertimeMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'Your request for overtime was sent!',
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
		(form: CreateOvertimeQueryType) => {
			setErrors(undefined);
			requestOvertime(form);
		},
		[requestOvertime]
	);

	return (
		<Container
			heading="Overtime"
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
				adminView={false}
				loading={isFetching}
				dateSubmit={({ fromDate, toDate }) =>
					setDateQuery({ from: fromDate, to: toDate })
				}
				openModal={() => setModalVisible(true)}
			/>
			<OvertimeTable overtime={data?.result || []} />
			<Modal
				close={() => setModalVisible(false)}
				component={
					<Form
						errors={errors}
						loading={createLoading}
						success={isSuccess}
						onSubmit={handleSubmit}
					/>
				}
				description="Fill in the form below to request a overtime"
				keepVisible
				title="Request Overtime"
				visible={modalVisible}
			/>
		</Container>
	);
};

export default Overtime;
