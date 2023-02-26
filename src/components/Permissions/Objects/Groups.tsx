import { PermissionModelChoices } from '@prisma/client';
import React from 'react';

import GroupForm, { FormType } from './GroupForm';
import GroupTable from './GroupTable';
import { Modal } from '../../common';
import { useAlertContext } from '../../../store/contexts';
import { useEditObjectPermissionMutation } from '../../../store/queries';
import { ObjPermGroupType } from '../../../types';

function Groups({
	modelName,
	objectId,
	groups,
}: {
	modelName: PermissionModelChoices;
	objectId: string;
	groups: ObjPermGroupType[];
}) {
	const [editMode, setEditMode] = React.useState(false);
	const [initState, setInitState] = React.useState<FormType>();
	const [initGroups, setInitGroups] = React.useState<ObjPermGroupType[]>();
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
				setInitGroups(undefined);
				setModalVisible(false);
				showAlert({
					type: 'success',
					message: 'Record permissions have updated successfully!',
				});
			},
			onError(error) {
				showAlert({
					type: 'success',
					message: error.data?.groups || error.message,
				});
			},
		}
	);

	const handleSubmit = React.useCallback(
		(form: FormType) => {
			reset();
			const canDelete =
				form.permissions.find((item) => item.name === 'DELETE')?.value || false;
			const canEdit =
				form.permissions.find((item) => item.name === 'EDIT')?.value || false;
			const canView =
				form.permissions.find((item) => item.name === 'VIEW')?.value || false;

			if (!editMode && (canDelete || canEdit || canView)) {
				// If not in edit mode this means that we want to connect the groups
				// to the respective permissions
				const data: {
					method: 'PUT' | 'DELETE';
					permission: 'DELETE' | 'EDIT' | 'VIEW';
					form: { groups: string[] };
				}[] = [];
				if (canDelete)
					data.push({
						method: 'PUT', // to update/connect the groups array
						permission: 'DELETE',
						form: { groups: form.groups },
					});
				if (canEdit)
					data.push({
						method: 'PUT', // to update/connect the groups array
						permission: 'EDIT',
						form: { groups: form.groups },
					});
				if (canView)
					data.push({
						method: 'PUT', // to update/connect the groups array
						permission: 'VIEW',
						form: { groups: form.groups },
					});
				mutate(data);
			} else {
				// We're in edit mode
				const group = initGroups?.[0]; // group must be in the array on edit mode
				if (!group) return;
				const data: {
					method: 'PUT' | 'DELETE';
					permission: 'DELETE' | 'EDIT' | 'VIEW';
					form: { groups: string[] };
				}[] = [];

				// Check the if the group had delete permission
				// And can not delete any more, then disconnect
				if (group.delete === true && canDelete === false)
					data.push({
						method: 'DELETE',
						permission: 'DELETE',
						form: { groups: form.groups },
					});

				// Check the if the group does not have delete permission
				// And can delete now, then connect
				if (!group.delete && canDelete === true)
					data.push({
						method: 'PUT',
						permission: 'DELETE',
						form: { groups: form.groups },
					});

				// Check the if the group had edit permission
				// And can not edit any more, then disconnect
				if (group.edit === true && canEdit === false)
					data.push({
						method: 'DELETE',
						permission: 'EDIT',
						form: { groups: form.groups },
					});

				// Check the if the group does not have edit permission
				// And can edit now, then connect
				if (!group.edit && canEdit === true)
					data.push({
						method: 'PUT',
						permission: 'EDIT',
						form: { groups: form.groups },
					});

				// Check the if the group had view permission
				// And can not view any more, then disconnect
				if (group.view === true && canView === false)
					data.push({
						method: 'DELETE',
						permission: 'VIEW',
						form: { groups: form.groups },
					});

				// Check the if the group does not have view permission
				// And can view now, then connect
				if (!group.view && canView === true)
					data.push({
						method: 'PUT',
						permission: 'VIEW',
						form: { groups: form.groups },
					});

				if (data.length > 0) mutate(data);
			}
		},
		[editMode, initGroups, mutate, reset]
	);

	return (
		<React.Fragment>
			<GroupTable
				openModal={() => {
					setEditMode(false);
					setInitState(undefined);
					setInitGroups(undefined);
					setModalVisible(true);
				}}
				onEdit={(group: ObjPermGroupType) => {
					setEditMode(true);
					setInitState({
						permissions: [
							{
								name: 'DELETE',
								value: group.delete || false,
							},
							{
								name: 'EDIT',
								value: group.edit || false,
							},
							{
								name: 'VIEW',
								value: group.view || false,
							},
						],
						groups: [group.id],
					});
					setInitGroups([group]);
					setModalVisible(true);
				}}
				modelName={modelName}
				objectId={objectId}
				groups={groups}
			/>
			<Modal
				close={() => {
					setEditMode(false);
					setInitState(undefined);
					setInitGroups(undefined);
					setModalVisible(false);
				}}
				component={
					modalVisible ? (
						<GroupForm
							editMode={editMode}
							error={
								error
									? (error as any).data?.groups || (error as any).message
									: undefined
							}
							initGroups={initGroups}
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
				description="Fill the form update groups permissions for this record"
				title="Update groups permissions"
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

export default Groups;
