import dynamic from 'next/dynamic';
import React from 'react';

import Container from '../../components/common/container';
import { Cards, Topbar, OvertimeTable } from '../../components/overtime';
import { permissions, DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useGetAllOvertimeQuery,
	useRequestOvertimeMutation,
} from '../../store/queries/overtime';
import {
	CreateOvertimeQueryType,
	CreateOvertimeErrorResponseType,
	GetAllOvertimeResponseType,
} from '../../types';
import { hasModelPermission } from '../../utils';

const DynamicForm = dynamic<any>(
	() => import('../../components/overtime/form').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading Form...
			</p>
		),
		ssr: false,
	}
);
const DynamicModal = dynamic<any>(
	() => import('../../components/common/modal').then((mod) => mod.default),
	{
		ssr: false,
	}
);

const DynamicTablePagination = dynamic<any>(
	() =>
		import('../../components/common/table/pagination').then(
			(mod) => mod.default
		),
	{
		ssr: false,
	}
);

const Overtime = ({
	overtime,
}: {
	overtime: GetAllOvertimeResponseType['data'];
}) => {
	const [dateQuery, setDateQuery] = React.useState<{
		from?: string;
		to?: string;
	}>();
	const [errors, setErrors] = React.useState<
		CreateOvertimeErrorResponseType & {
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
			  hasModelPermission(authData.permissions, [permissions.overtime.REQUEST])
			: false;
		const canView = !!authData?.employee;
		return [canRequest, canView];
	}, [authData]);

	const { data, isLoading, isFetching, refetch } = useGetAllOvertimeQuery(
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

	const handleSubmit = React.useCallback(
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
					<OvertimeTable overtime={data?.result || []} />
					{data && data?.total > 0 && (
						<DynamicTablePagination
							disabled={isFetching}
							totalItems={data.total}
							onChange={(pageNo: number) => {
								const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
								offset !== value && setOffset(value * limit);
							}}
							onSizeChange={(size: number) => setLimit(size)}
							pageSize={limit}
						/>
					)}
				</div>
			)}
			{canRequest && (
				<DynamicModal
					close={() => setModalVisible(false)}
					component={
						<DynamicForm
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
