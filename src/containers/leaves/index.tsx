import React from 'react';

import { Container, Modal, TablePagination } from '../../components/common';
import { Cards, Form, Topbar, LeaveTable } from '../../components/leaves';
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
	const [dateQuery, setDateQuery] = React.useState<{
		from?: string;
		to?: string;
	}>();
	const [errors, setErrors] = React.useState<
		CreateLeaveErrorResponseType & {
			message?: string;
		}
	>();
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [modalVisible, setModalVisible] = React.useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canRequest, canView] = React.useMemo(() => {
		const canRequest = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.leave.REQUEST])
			: false;
		const canView = !!authData?.employee;
		return [canRequest, canView];
	}, [authData]);

	const { data, isLoading, isFetching, refetch } = useGetLeavesQuery(
		{
			limit,
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

	const handleSubmit = React.useCallback(
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
			disabledLoading={isLoading}
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
				<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
					<LeaveTable leaves={data?.result || []} />
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
