import React from 'react';

import Form from '../form';
import { useEditGroupMutation } from '../../../store/queries/permissions';
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
	const [errors, setErrors] = React.useState<ErrorType>();

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

	const handleSubmit = React.useCallback(
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
