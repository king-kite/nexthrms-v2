import React from 'react';

import UserForm, { FormType } from './UserForm';
import UserTable from './UserTable';
import { Modal } from '../../common';
import { useAlertContext } from '../../../store/contexts';
import { useEditObjectPermissionMutation } from '../../../store/queries';
import { ObjPermUser, PermissionModelNameType } from '../../../types';

function Users({
	modelName,
	objectId,
	users,
}: {
	modelName: PermissionModelNameType;
	objectId: string;
	users: ObjPermUser[];
}) {
	const [editMode, setEditMode] = React.useState(false);
	const [initState, setInitState] = React.useState<FormType>();
	const [initUsers, setInitUsers] = React.useState<ObjPermUser[]>();
	const [modalVisible, setModalVisible] = React.useState(false);

	const { open: showAlert } = useAlertContext();

	const { error, mutate, isLoading } = useEditObjectPermissionMutation(
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
			const canDelete =
				form.permissions.find((item) => item.name === 'DELETE')?.value || false;
			const canEdit =
				form.permissions.find((item) => item.name === 'EDIT')?.value || false;
			const canView =
				form.permissions.find((item) => item.name === 'VIEW')?.value || false;

			if (!editMode) {
				// If not in edit mode this means that we want to connect the users
				// to the respective permissions
				const data: {
					method: 'PUT' | 'DELETE';
					permission: 'DELETE' | 'EDIT' | 'VIEW';
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
			}
		},
		[editMode, mutate]
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
					<UserForm
						editMode={editMode}
						error={
							error
								? (error as any).data?.users || (error as any).message
								: undefined
						}
						initUsers={initUsers}
						initState={initState}
						loading={isLoading}
						onSubmit={handleSubmit}
					/>
				}
				keepVisible
				description="Fill the form update users permissions for this record"
				title="Update users permissions"
				visible={modalVisible}
			/>
			{/* {paginate.totalItems > 0 && (
        <div className="pt-2 pb-5">
          <Pagination
            disabled={paginate.loading || false}
            onChange={(pageNo: number) => {
              const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
              paginate.offset !== value &&
                paginate.setOffset(value * DEFAULT_PAGINATION_SIZE);
            }}
            pageSize={DEFAULT_PAGINATION_SIZE}
            totalItems={paginate.totalItems || 0}
          />
        </div>
      )} */}
		</React.Fragment>
	);
}

export default Users;
