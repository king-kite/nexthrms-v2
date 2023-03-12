import { useCallback, useMemo, useState } from 'react';

import { Container, Modal } from '../../components/common';
import { Cards, EmployeeTable, Form, Topbar } from '../../components/Employees';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	EMPLOYEES_EXPORT_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useCreateEmployeeMutation,
	useGetEmployeesQuery,
} from '../../store/queries';
import {
	CreateEmployeeErrorResponseType,
	GetEmployeesResponseType,
} from '../../types';
import { downloadFile, hasModelPermission } from '../../utils';

interface ErrorType extends CreateEmployeeErrorResponseType {
	message?: string;
}

const Employees = ({
	employees: empData,
}: {
	employees: GetEmployeesResponseType['data'];
}) => {
	const [errors, setErrors] = useState<ErrorType>();

	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.employee.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.employee.EXPORT])
			: false;
		// TODO: Add Object Level Permissions As Well
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.employee.VIEW]) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) => perm.modelName === 'employees' && perm.permission === 'VIEW'
			  )
			: false;
		return [canCreate, canExport, canView];
	}, [authData]);

	const employees = useGetEmployeesQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
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

	const handleSubmit = useCallback(
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
			paginate={
				(canCreate || canView) && employees.data
					? {
							offset,
							setOffset,
							loading: employees.isFetching,
							totalItems: employees.data.total || 0,
					  }
					: undefined
			}
		>
			{(canCreate || canView) && (
				<Cards
					active={employees.data?.active || 0}
					leave={employees.data?.on_leave || 0}
					inactive={employees.data?.inactive || 0}
				/>
			)}
			<Topbar
				openModal={() => setModalVisible(true)}
				loading={employees.isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportData={async (type, filtered) => {
					if (!canExport) return;
					let url = EMPLOYEES_EXPORT_URL + '?type=' + type;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
					}
					const result = await downloadFile({
						url,
						name: type === 'csv' ? 'employees.csv' : 'employees.xlsx',
						setLoading: setExportLoading,
					});
					if (result?.status !== 200) {
						open({
							type: 'danger',
							message: 'An error occurred. Unable to export file!',
						});
					}
				}}
				exportLoading={exportLoading}
			/>
			{(canCreate || canView) && (
				<div className="mt-3">
					<EmployeeTable employees={employees.data?.result || []} />
				</div>
			)}
			{canCreate && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						<Form
							errors={errors}
							resetErrors={() => setErrors(undefined)}
							loading={loading}
							onSubmit={handleSubmit}
							success={formSuccess}
						/>
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
