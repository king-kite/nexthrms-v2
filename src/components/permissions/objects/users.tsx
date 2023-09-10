import React from 'react';

import UserForm, { FormType } from './user-form';
import UserTable from './user-table';
import { Modal } from '../../common';
import { useAlertContext } from '../../../store/contexts';
import { useEditObjectPermissionMutation } from '../../../store/queries/permissions';
import type { PermissionModelChoices, PermissionObjectChoices, ObjPermUser } from '../../../types';

function Users({
	modelName,
	objectId,
	users,
}: {
	modelName: PermissionModelChoices;
	objectId: string;
	users: ObjPermUser[];
}) {
	const [editMode, setEditMode] = React.useState(false);
	const [initState, setInitState] = React.useState<FormType>();
	const [initUsers, setInitUsers] = React.useState<ObjPermUser[]>();
	const [modalVisible, setModalVisible] = React.useState(false);

	const { open: showAlert } = useAlertContext();

	const { error, mutate, reset, isLoading } = useEditObjectPermissionMutation(
		{
			model: modelName,
			id: objectId,
		},
		{
			onSuccess() {
				setEditMode(false);
				setInitState(undefined);
				setInitUsers(undefined);
				setModalVisible(false);
				showAlert({
					type: 'success',
					message: 'Record permissions have updated successfully!',
				});
			},
			onError(error) {
				showAlert({
					type: 'success',
					message: error.data?.users || error.message,
				});
			},
		}
	);

	const handleSubmit = React.useCallback(
		(form: FormType) => {
			reset();
			const canDelete = form.permissions.find((item) => item.name === 'DELETE')?.value || false;
			const canEdit = form.permissions.find((item) => item.name === 'EDIT')?.value || false;
			const canView = form.permissions.find((item) => item.name === 'VIEW')?.value || false;

			if (!editMode && (canDelete || canEdit || canView)) {
				// If not in edit mode this means that we want to connect the users
				// to the respective permissions
				const data: {
					method: 'PUT' | 'DELETE';
					permission: PermissionObjectChoices;
					form: { users: string[] };
				}[] = [];
				if (canDelete)
					data.push({
						method: 'PUT', // to update/connect the users array
						permission: 'DELETE',
						form: { users: form.users },
					});
				if (canEdit)
					data.push({
						method: 'PUT', // to update/connect the users array
						permission: 'EDIT',
						form: { users: form.users },
					});
				if (canView)
					data.push({
						method: 'PUT', // to update/connect the users array
						permission: 'VIEW',
						form: { users: form.users },
					});
				mutate(data);
			} else {
				// We're in edit mode
				const user = initUsers?.[0]; // user must be in the array on edit mode
				if (!user) return;
				const data: {
					method: 'PUT' | 'DELETE';
					permission: PermissionObjectChoices;
					form: { users: string[] };
				}[] = [];

				// Check the if the user had delete permission
				// And can not delete any more, then disconnect
				if (user.delete === true && canDelete === false)
					data.push({
						method: 'DELETE',
						permission: 'DELETE',
						form: { users: form.users },
					});

				// Check the if the user does not have delete permission
				// And can delete now, then connect
				if (!user.delete && canDelete === true)
					data.push({
						method: 'PUT',
						permission: 'DELETE',
						form: { users: form.users },
					});

				// Check the if the user had edit permission
				// And can not edit any more, then disconnect
				if (user.edit === true && canEdit === false)
					data.push({
						method: 'DELETE',
						permission: 'EDIT',
						form: { users: form.users },
					});

				// Check the if the user does not have edit permission
				// And can edit now, then connect
				if (!user.edit && canEdit === true)
					data.push({
						method: 'PUT',
						permission: 'EDIT',
						form: { users: form.users },
					});

				// Check the if the user had view permission
				// And can not view any more, then disconnect
				if (user.view === true && canView === false)
					data.push({
						method: 'DELETE',
						permission: 'VIEW',
						form: { users: form.users },
					});

				// Check the if the user does not have view permission
				// And can view now, then connect
				if (!user.view && canView === true)
					data.push({
						method: 'PUT',
						permission: 'VIEW',
						form: { users: form.users },
					});

				if (data.length > 0) mutate(data);
			}
		},
		[editMode, initUsers, mutate, reset]
	);

	return (
		<React.Fragment>
			<UserTable
				openModal={() => {
					setEditMode(false);
					setInitState(undefined);
					setInitUsers(undefined);
					setModalVisible(true);
				}}
				onEdit={(user: ObjPermUser) => {
					setEditMode(true);
					setInitState({
						permissions: [
							{
								name: 'DELETE',
								value: user.delete || false,
							},
							{
								name: 'EDIT',
								value: user.edit || false,
							},
							{
								name: 'VIEW',
								value: user.view || false,
							},
						],
						users: [user.id],
					});
					setInitUsers([user]);
					setModalVisible(true);
				}}
				modelName={modelName}
				objectId={objectId}
				users={users}
			/>
			<Modal
				close={() => {
					setEditMode(false);
					setInitState(undefined);
					setInitUsers(undefined);
					setModalVisible(false);
				}}
				component={
					modalVisible ? (
						<UserForm
							editMode={editMode}
							error={error ? (error as any).data?.users || (error as any).message : undefined}
							initUsers={initUsers}
							initState={initState}
							loading={isLoading}
							// reset={isSuccess} // Reset the form if the mutation was successful
							onSubmit={handleSubmit}
						/>
					) : (
						<></>
					)
				}
				keepVisible
				description="Fill the form update users permissions for this record"
				title="Update users permissions"
				visible={modalVisible}
			/>
		</React.Fragment>
	);
}

export default Users;
