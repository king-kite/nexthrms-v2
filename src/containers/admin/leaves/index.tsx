import React from 'react';

import {
	Container,
	ImportForm,
	Modal,
	TablePagination,
} from '../../../components/common';
import {
	Cards,
	Form,
	Topbar,
	LeaveAdminTable,
} from '../../../components/leaves';
import {
	permissions,
	samples,
	DEFAULT_PAGINATION_SIZE,
	LEAVES_ADMIN_EXPORT_URL,
	LEAVES_ADMIN_IMPORT_URL,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import {
	useGetLeavesAdminQuery,
	useCreateLeaveMutation,
} from '../../../store/queries/leaves';
import {
	CreateLeaveQueryType,
	CreateLeaveErrorResponseType,
	GetLeavesResponseType,
} from '../../../types';
import { hasModelPermission } from '../../../utils';

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
	const [bulkForm, setBulkForm] = React.useState(false);
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [search, setSearch] = React.useState('');
	const [modalVisible, setModalVisible] = React.useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = React.useMemo(() => {
		if (!authData?.isAdmin && !authData?.isSuperUser)
			return [false, false, false];

		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.leave.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.leave.EXPORT])
			: false;
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.leave.VIEW]) ||
			  !!authData.objPermissions.find(
					(perm) => perm.modelName === 'leaves' && perm.permission === 'VIEW'
			  )
			: false;
		return [canCreate, canExport, canView];
	}, [authData]);

	const { data, isLoading, isFetching, refetch } = useGetLeavesAdminQuery(
		{
			limit,
			offset,
			search,
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

	const handleSubmit = React.useCallback(
		(form: CreateLeaveQueryType) => {
			setErrors(undefined);
			if (!form.employee) {
				setErrors((prevState) => ({
					...prevState,
					employee: 'Employee ID is required',
				}));
			} else if (canCreate) createLeave(form);
		},
		[canCreate, createLeave]
	);

	return (
		<Container
			heading="Leaves (Admin)"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
			disabledLoading={isLoading}
		>
			{(canCreate || canView) && (
				<Cards
					approved={data?.approved || 0}
					denied={data?.denied || 0}
					pending={data?.pending || 0}
				/>
			)}
			<Topbar
				adminView
				loading={isFetching}
				dateForm={dateQuery}
				setDateForm={setDateQuery}
				searchSubmit={(value) => setSearch(value)}
				openModal={(bulk = false) => {
					setBulkForm(bulk);
					setModalVisible(true);
				}}
				exportData={
					!canExport
						? undefined
						: {
								all: LEAVES_ADMIN_EXPORT_URL,
								filtered: `&offset=${offset}&limit=${limit}&search=${
									search || ''
								}${
									dateQuery?.from && dateQuery?.to
										? `&from=${dateQuery.from}&to=${dateQuery.to}`
										: ''
								}`,
						  }
				}
			/>
			{(canCreate || canView) && (
				<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
					<LeaveAdminTable leaves={data?.result || []} />
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
			{canCreate && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						bulkForm ? (
							<ImportForm
								onSuccess={(data) => {
									open({
										type: 'success',
										message: data.message,
									});
									setModalVisible(false);
									setBulkForm(false);
								}}
								requirements={[
									{
										title: 'id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										title: 'employee_id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										title: 'start_date',
										value: '2023-03-26T21:49:51.090Z',
									},
									{
										title: 'end_date',
										value: '2023-03-28T21:49:51.090Z',
									},
									{
										title: 'reason',
										value: '"This is the reason for this leave"',
									},
									{
										title: 'status',
										value: 'PENDING',
									},
									{
										title: 'type',
										value: 'C',
									},
									{
										required: false,
										title: 'created_by',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										required: false,
										title: 'approved_by',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										required: false,
										title: 'updated_at',
										value: '2023-03-26T21:49:51.090Z',
									},
									{
										required: false,
										title: 'created_at',
										value: '2023-03-26T21:49:51.090Z',
									},
								]}
								sample={samples.leaves}
								url={LEAVES_ADMIN_IMPORT_URL}
							/>
						) : (
							<Form
								adminView
								errors={errors}
								loading={createLoading}
								success={isSuccess}
								onSubmit={handleSubmit}
							/>
						)
					}
					description="Fill in the form below to create a leave"
					keepVisible
					title="Create Leave"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Leave;
