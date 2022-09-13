import { useCallback, useState } from 'react';

import Form from './Form';
import { useEditClientMutation } from '../../store/queries';
import {
	ClientType,
	ClientCreateQueryType,
	CreateClientErrorResponseType,
} from '../../types';

interface ErrorType extends CreateClientErrorResponseType {
	message?: string;
}

const UpdateForm = ({
	client,
	onSuccess,
}: {
	client: ClientType;
	onSuccess: () => void;
}) => {
	const [errors, setErrors] = useState<ErrorType>();

	const { mutate: updateClient, isLoading } = useEditClientMutation({
		onSuccess,
		onError(err) {
			setErrors({
				...err.data,
				message: err.message,
			});
		},
	});

	const handleSubmit = useCallback(
		(form: ClientCreateQueryType) => {
			updateClient({ id: client.id, form });
		},
		[client, updateClient]
	);

	return (
		<Form
			initState={client}
			editMode
			errors={errors}
			removeErrors={() => setErrors(undefined)}
			loading={isLoading}
			onSubmit={handleSubmit}
		/>
	);
};

export default UpdateForm;
