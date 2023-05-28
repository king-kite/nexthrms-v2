import React from 'react';

import Form from './Form';
import { permissions } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { useEditClientMutation } from '../../store/queries';
import { hasModelPermission } from '../../utils';
import { ClientType, CreateClientErrorResponseType } from '../../types';

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
	const [errors, setErrors] = React.useState<ErrorType>();

	const { data: authData } = useAuthContext();
	const canEdit = authData
		? authData.isSuperUser ||
		  hasModelPermission(authData.permissions, [permissions.client.EDIT])
		: // This should be an API request to the server
		  // check object permission
		  // !!authData?.objPermissions.find(
		  // 	(perm) => perm.modelName === 'clients' && perm.permission === 'EDIT'
		  // )
		  false;

	const { mutate: updateClient, isLoading } = useEditClientMutation({
		onSuccess,
		onError(err) {
			setErrors({
				...err.data,
				message: err.message,
			});
		},
	});

	const handleSubmit = React.useCallback(
		(form: FormData) => {
			canEdit && updateClient({ id: client.id, form });
		},
		[canEdit, client, updateClient]
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
