import { useCallback, useState } from 'react';

import Form from '../Form';
import { useEditEmployeeMutation } from '../../../store/queries';
import {
	EmployeeType,
	CreateEmployeeErrorResponseType,
} from '../../../types';

interface ErrorType extends CreateEmployeeErrorResponseType {
	message?: string;
}

const EmployeeForm = ({
	employee,
	onSuccess,
}: {
	employee: EmployeeType;
	onSuccess: () => void;
}) => {
	const [errors, setErrors] = useState<ErrorType>();

	const { mutate, isLoading } = useEditEmployeeMutation({
		onSuccess,
		onError(err) {
			setErrors((prevState) => ({
				...prevState,
				...err.data,
				message: err.message,
			}));
		},
	});

	const handleSubmit = useCallback(
		(form: FormData) => {
			mutate({ id: employee.id, form });
		},
		[mutate, employee.id]
	);

	return (
		<Form
			editMode
			initState={employee}
			errors={errors}
			resetErrors={() => setErrors(undefined)}
			loading={isLoading}
			onSubmit={handleSubmit}
		/>
	);
};

export default EmployeeForm;
