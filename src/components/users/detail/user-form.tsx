import React from 'react';

import Form from '../form';
import { useEditUserMutation } from '../../../store/queries/users';
import { UserType, CreateUserErrorResponseType } from '../../../types';

interface ErrorType extends CreateUserErrorResponseType {
	message?: string;
}

const UserForm = ({
	user,
	onSuccess,
}: {
	user: UserType;
	onSuccess: () => void;
}) => {
	const [errors, setErrors] = React.useState<ErrorType>();

	const { mutate, isLoading } = useEditUserMutation({
		onSuccess,
		onError(err) {
			setErrors((prevState) => ({
				...prevState,
				...err.data,
				message: err.message,
			}));
		},
	});

	const handleSubmit = React.useCallback(
		(form: FormData) => {
			mutate({ id: user.id, form });
		},
		[mutate, user.id]
	);

	return (
		<Form
			editMode
			initState={user}
			errors={errors}
			resetErrors={() => setErrors(undefined)}
			loading={isLoading}
			onSubmit={handleSubmit}
		/>
	);
};

export default UserForm;
