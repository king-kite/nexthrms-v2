import { useCallback, useState } from 'react';

import Form from '../Form';
import { useEditGroupMutation } from '../../../store/queries';
import {
	GroupType,
	CreateGroupErrorResponseType,
	CreateGroupQueryType,
} from '../../../types';

interface ErrorType extends CreateGroupErrorResponseType {
	message?: string;
}

const GroupForm = ({
	group,
	onSuccess,
}: {
	group: GroupType;
	onSuccess: () => void;
}) => {
	const [errors, setErrors] = useState<ErrorType>();

	const { mutate, isLoading } = useEditGroupMutation({
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
		(form: CreateGroupQueryType) => {
			mutate({ id: group.id, form });
		},
		[mutate, group.id]
	);

	return (
		<Form
			editMode
			initState={group}
			errors={errors}
			resetErrors={() => setErrors(undefined)}
			loading={isLoading}
			onSubmit={handleSubmit}
		/>
	);
};

export default GroupForm;
