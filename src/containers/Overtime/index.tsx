import { useCallback, useMemo, useState } from 'react';

import { Container, Modal } from '../../components/common';
import { Cards, Form, Topbar, OvertimeTable } from '../../components/Overtime';
import { permissions, DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useGetAllOvertimeQuery,
	useRequestOvertimeMutation,
} from '../../store/queries';
import {
	CreateOvertimeQueryType,
	CreateOvertimeErrorResponseType,
	GetAllOvertimeResponseType,
} from '../../types';
import { hasModelPermission } from '../../utils';

const Overtime = ({
	overtime,
}: {
	overtime: GetAllOvertimeResponseType['data'];
}) => {
	const [dateQuery, setDateQuery] = useState<{ from?: string; to?: string }>();
	const [errors, setErrors] = useState<
		CreateOvertimeErrorResponseType & {
			message?: string;
		}
	>();
	const [offset, setOffset] = useState(0);
	const [modalVisible, setModalVisible] = useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canRequest, canView] = useMemo(() => {
		const canRequest = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.overtime.REQUEST])
			: false;
		const canView = !!authData?.employee;
		return [canRequest, canView];
	}, [authData]);

	const { data, isLoading, isFetching, refetch } = useGetAllOvertimeQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			from: dateQuery?.from || undefined,
			to: dateQuery?.to || undefined,
			onError(error) {
				open({
					message: error.message || 'Fetch Error. Unable to get data!',
					type: 'danger',
				});
			},
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
			if (canRequest) {
				setErrors(undefined);
				requestOvertime(form);
			}
		},
		[canRequest, requestOvertime]
	);

	return (
		<Container
			heading="Overtime"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canRequest ? { statusCode: 403 } : undefined}
			loading={isLoading}
			paginate={
				(canRequest || canView) && data
					? {
							loading: isFetching,
							setOffset,
							offset,
							totalItems: data.total,
					  }
					: undefined
			}
		>
			{(canRequest || canView) && (
				<Cards
					approved={data?.approved || 0}
					denied={data?.denied || 0}
					pending={data?.pending || 0}
				/>
			)}
			<Topbar
				adminView={false}
				loading={isFetching}
				dateForm={dateQuery}
				setDateForm={setDateQuery}
				openModal={() => setModalVisible(true)}
			/>
			{(canRequest || canView) && (
				<OvertimeTable overtime={data?.result || []} />
			)}
			{canRequest && (
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
			)}
		</Container>
	);
};

export default Overtime;
