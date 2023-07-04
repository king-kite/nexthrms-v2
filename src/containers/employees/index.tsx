import dynamic from 'next/dynamic';
import React from 'react';

import Container from '../../components/common/container';
import { Cards, EmployeeTable, Topbar } from '../../components/employees';
import {
	permissions,
	samples,
	DEFAULT_PAGINATION_SIZE,
	EMPLOYEES_EXPORT_URL,
	EMPLOYEES_IMPORT_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useCreateEmployeeMutation,
	useGetEmployeesQuery,
} from '../../store/queries/employees';
import {
	CreateEmployeeErrorResponseType,
	GetEmployeesResponseType,
} from '../../types';
import { hasModelPermission } from '../../utils';

interface ErrorType extends CreateEmployeeErrorResponseType {
	message?: string;
}

const DynamicImportForm = dynamic<any>(
	() =>
		import('../../components/common/import-form').then((mod) => mod.default),
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
	() => import('../../components/employees/form').then((mod) => mod.default),
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

const Employees = ({
	employees: empData,
}: {
	employees: GetEmployeesResponseType['data'];
}) => {
	const [bulkForm, setBulkForm] = React.useState(false);
	const [errors, setErrors] = React.useState<ErrorType>();
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [search, setSearch] = React.useState('');
	const [modalVisible, setModalVisible] = React.useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const paginateRef = React.useRef<{
		changePage: (num: number) => void;
	} | null>(null);

	const [canCreate, canExport, canView] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.employee.CREATE,
					]))
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.employee.EXPORT,
					]))
			: false;
		const canView = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.employee.VIEW,
					])) ||
			  // check object permission
			  (!!authData?.objPermissions.find(
					(perm) => perm.modelName === 'employees' && perm.permission === 'VIEW'
			  ) &&
					authData.isAdmin)
			: false;
		return [canCreate, canExport, canView];
	}, [authData]);

	const employees = useGetEmployeesQuery(
		{
			limit,
			offset,
			search,
			onError(error) {
				open({
					message: error.message || 'Fetch Error. Unable to get data!',
					type: 'danger',
				});
			},
		},
		{
			initialData() {
				return empData;
			},
		}
	);

	const {
		mutate: createEmployee,
		isLoading: loading,
		isSuccess: formSuccess,
	} = useCreateEmployeeMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'Employee was created successfully!',
			});
		},
		onError(err) {
			setErrors((prevState) => {
				if (err?.data)
					return {
						...prevState,
						...err?.data,
					};
				return {
					...prevState,
					message:
						err?.message || 'Unable to create employee. Please try again!',
				};
			});
		},
	});

	const handleSubmit = React.useCallback(
		(form: FormData) => {
			if (canCreate) createEmployee(form);
		},
		[canCreate, createEmployee]
	);

	return (
		<Container
			heading="Employees"
			disabledLoading={employees.isLoading}
			refresh={{
				loading: employees.isFetching,
				onClick: employees.refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
		>
			{(canCreate || canView) && (
				<Cards
					active={employees.data?.active || 0}
					leave={employees.data?.on_leave || 0}
					inactive={employees.data?.inactive || 0}
				/>
			)}
			<Topbar
				openModal={(bulk = false) => {
					setBulkForm(bulk);
					setModalVisible(true);
				}}
				loading={employees.isFetching}
				onSubmit={(name: string) => {
					// change to page one
					paginateRef.current?.changePage(1);
					setSearch(name);
				}}
				exportData={
					!canExport
						? undefined
						: {
								all: EMPLOYEES_EXPORT_URL,
								filtered: `&offset=${offset}&limit=${limit}&search=${search}`,
						  }
				}
			/>
			{(canCreate || canView) && (
				<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
					<EmployeeTable
						employees={employees.data?.result || []}
						offset={offset}
					/>
					{employees.data && employees.data?.total > 0 && (
						<DynamicTablePagination
							disabled={employees.isFetching}
							handleRef={{
								ref: paginateRef,
							}}
							totalItems={employees.data.total}
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
										title: 'department',
										value: 'finance',
									},
									{
										title: 'job',
										value: 'business consultant',
									},
									{
										title: 'user_id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										title: 'is_hod',
										value: 'finance',
									},
									{
										title: 'supervisors',
										value:
											'"c2524fca-9182-4455-8367-c7a27abe1b73,c2524fca-9182-4455-8367-c7a27abe1b73"',
									},
									{
										required: false,
										title: 'date_employed',
										value: '2023-03-26T21:49:51.090Z',
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
								sample={samples.employees}
								url={EMPLOYEES_IMPORT_URL}
							/>
						) : (
							<DynamicForm
								errors={errors}
								resetErrors={() => setErrors(undefined)}
								loading={loading}
								onSubmit={handleSubmit}
								success={formSuccess}
							/>
						)
					}
					description="Fill in the form below to add a new Employee"
					title="Add Employee"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Employees;
