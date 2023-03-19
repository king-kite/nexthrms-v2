import { useCallback, useMemo, useState } from 'react';

import { Container, Modal } from '../../components/common';
import { Cards, Form, Topbar, LeaveTable } from '../../components/Leaves';
import { permissions, DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useGetLeavesQuery,
	useRequestLeaveMutation,
} from '../../store/queries';
import {
	CreateLeaveQueryType,
	CreateLeaveErrorResponseType,
	GetLeavesResponseType,
} from '../../types';
import { hasModelPermission } from '../../utils';

const Leave = ({ leaves }: { leaves: GetLeavesResponseType['data'] }) => {
	const [dateQuery, setDateQuery] = useState<{ from?: string; to?: string }>();
	const [errors, setErrors] = useState<
		CreateLeaveErrorResponseType & {
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
			  hasModelPermission(authData.permissions, [permissions.leave.REQUEST])
			: false;
		const canView = authData
			? authData.isSuperUser || (authData.employee && true)
			: false;
		return [canRequest, canView];
	}, [authData]);

	const { data, isLoading, isFetching, refetch } = useGetLeavesQuery(
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
				return leaves;
			},
		}
	);

	const {
		mutate: requestLeave,
		isLoading: createLoading,
		isSuccess,
	} = useRequestLeaveMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'Your request for leave was sent!',
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
			if (canRequest) {
				setErrors(undefined);
				requestLeave(form);
			}
		},
		[canRequest, requestLeave]
	);

	return (
		<Container
			heading="Leaves"
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
			{(canRequest || canView) && <LeaveTable leaves={data?.result || []} />}
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
					description="Fill in the form below to request a leave"
					keepVisible
					title="Request Leave"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Leave;
