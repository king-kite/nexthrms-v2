import dynamic from 'next/dynamic';
import React from 'react';

import Container from '../../../components/common/container';
import {
	Cards,
	Topbar,
	OvertimeAdminTable,
} from '../../../components/overtime';
import {
	permissions,
	samples,
	DEFAULT_PAGINATION_SIZE,
	OVERTIME_ADMIN_EXPORT_URL,
	OVERTIME_ADMIN_IMPORT_URL,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import {
	useGetAllOvertimeAdminQuery,
	useCreateOvertimeMutation,
} from '../../../store/queries/overtime';
import {
	CreateOvertimeQueryType,
	CreateOvertimeErrorResponseType,
	GetAllOvertimeResponseType,
} from '../../../types';
import { hasModelPermission } from '../../../utils';

const DynamicImportForm = dynamic<any>(
	() =>
		import('../../../components/common/import-form').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading Form...
			</p>
		),
		ssr: false,
	}
);
const DynamicForm = dynamic<any>(
	() => import('../../../components/overtime/form').then((mod) => mod.default),
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
	() => import('../../../components/common/modal').then((mod) => mod.default),
	{
		ssr: false,
	}
);
const DynamicTablePagination = dynamic<any>(
	() =>
		import('../../../components/common/table/pagination').then(
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
	const [bulkForm, setBulkForm] = React.useState(false);
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [search, setSearch] = React.useState('');
	const [modalVisible, setModalVisible] = React.useState(false);

	const paginateRef = React.useRef<{
		changePage: (num: number) => void;
	} | null>(null);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = React.useMemo(() => {
		if (!authData?.isAdmin && !authData?.isSuperUser)
			return [false, false, false];

		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.overtime.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.overtime.EXPORT])
			: false;
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.overtime.VIEW]) ||
			  !!authData.objPermissions.find(
					(perm) => perm.modelName === 'overtime' && perm.permission === 'VIEW'
			  )
			: false;
		return [canCreate, canExport, canView];
	}, [authData]);

	const { data, isLoading, isFetching, refetch } = useGetAllOvertimeAdminQuery(
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
				return overtime;
			},
		}
	);

	const {
		mutate: createOvertime,
		isLoading: createLoading,
		isSuccess,
	} = useCreateOvertimeMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'Overtime was created successfully!',
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
			setErrors(undefined);
			if (!form.employee) {
				setErrors((prevState) => ({
					...prevState,
					employee: 'Employee ID is required',
				}));
			} else if (canCreate) createOvertime(form);
		},
		[canCreate, createOvertime]
	);

	return (
		<Container
			heading="Overtime (Admin)"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			disabledLoading={isLoading}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
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
				setDateForm={(form) => {
					// change to page 1
					paginateRef.current?.changePage(1);
					setDateQuery(form);
				}}
				searchSubmit={(value) => {
					// change to page 1
					paginateRef.current?.changePage(1);
					setSearch(value);
				}}
				openModal={(bulk = false) => {
					setBulkForm(bulk);
					setModalVisible(true);
				}}
				exportData={
					!canExport
						? undefined
						: {
								all: OVERTIME_ADMIN_EXPORT_URL,
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
					<OvertimeAdminTable overtime={data?.result || []} offset={offset} />
					{data && data?.total > 0 && (
						<DynamicTablePagination
							disabled={isFetching}
							totalItems={data.total}
							handleRef={{ ref: paginateRef }}
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
			{canCreate && (
				<DynamicModal
					close={() => setModalVisible(false)}
					component={
						bulkForm ? (
							<DynamicImportForm
								onSuccess={(data: any) => {
									open({
										type: 'success',
										message: data.message,
									});
									setModalVisible(false);
									setBulkForm(false);
								}}
								requirements={[
									{
										required: false,
										title: 'id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										title: 'employee_id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										title: 'date',
										value: '2023-03-26T21:49:51.090Z',
									},
									{
										title: 'hours',
										value: '2',
									},
									{
										title: 'reason',
										value: '"This is the reason for this overtime"',
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
								sample={samples.overtime}
								url={OVERTIME_ADMIN_IMPORT_URL}
							/>
						) : (
							<DynamicForm
								adminView
								errors={errors}
								loading={createLoading}
								success={isSuccess}
								onSubmit={handleSubmit}
							/>
						)
					}
					description="Fill in the form below to create a overtime"
					keepVisible
					title="Create Overtime"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Overtime;
