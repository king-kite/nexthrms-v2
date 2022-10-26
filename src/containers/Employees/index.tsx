import { useState } from 'react';

import { Container, Modal } from '../../components/common';
import { Cards, EmployeeTable, Form, Topbar } from '../../components/Employees';
import { DEFAULT_PAGINATION_SIZE, EMPLOYEE_EXPORT_URL } from '../../config';
import { useAlertContext } from '../../store/contexts';
import {
	useCreateEmployeeMutation,
	useGetEmployeesQuery,
} from '../../store/queries';
import {
	CreateEmployeeErrorResponseType,
	GetEmployeesResponseType,
} from '../../types';
import { downloadFile } from '../../utils';

interface ErrorType extends CreateEmployeeErrorResponseType {
	message?: string;
}

const Employees = ({
	employees: empData,
}: {
	employees: GetEmployeesResponseType;
}) => {
	const [errors, setErrors] = useState<ErrorType>();

	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [modalVisible, setModalVisible] = useState(false);

	const { open } = useAlertContext();

	const employees = useGetEmployeesQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
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

	return (
		<Container
			heading="Employees"
			refresh={{
				loading: employees.isFetching,
				onClick: employees.refetch,
			}}
			paginate={
				employees.data
					? {
							offset,
							setOffset,
							loading: employees.isFetching,
							totalItems: employees.data.total || 0,
					  }
					: undefined
			}
		>
			<Cards
				active={employees.data?.active || 0}
				leave={employees.data?.on_leave || 0}
				inactive={employees.data?.inactive || 0}
			/>
			<Topbar
				openModal={() => setModalVisible(true)}
				loading={employees.isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportData={async (type, filtered) => {
					let url = EMPLOYEE_EXPORT_URL + '?type=' + type;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
					}
					const result = await downloadFile(url, 'employees.xlsx');
					console.log({ result });
				}}
			/>
			<div className="mt-3">
				<EmployeeTable employees={employees.data?.result || []} />
			</div>
			<Modal
				close={() => setModalVisible(false)}
				component={
					<Form
						errors={errors}
						resetErrors={() => setErrors(undefined)}
						loading={loading}
						onSubmit={createEmployee}
						success={formSuccess}
					/>
				}
				description="Fill in the form below to add a new Employee"
				title="Add Employee"
				visible={modalVisible}
			/>
		</Container>
	);
};

export default Employees;
