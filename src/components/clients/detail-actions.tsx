import { Button, ButtonType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import {
	FaUser,
	FaUserCheck,
	FaUserEdit,
	FaUserShield,
	FaUserSlash,
	FaLock,
	FaTrash,
} from 'react-icons/fa';

import UpdateForm from './update-form';
import Modal from '../common/modal';
import ChangePasswordForm from '../employees/detail/change-password-form';
import permissions from '../../config/permissions';
import { CLIENT_OBJECT_PERMISSIONS_PAGE_URL, USER_PAGE_URL } from '../../config/routes';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import { useDeleteClientMutation } from '../../store/queries/clients';
import { useGetUserObjectPermissionsQuery } from '../../store/queries/permissions';
import { useActivateUserMutation } from '../../store/queries/users';
import { ClientType } from '../../types';
import { hasModelPermission } from '../../utils/permission';

function DetailActions({
	data,
	forwardedRef,
}: {
	data?: ClientType;
	forwardedRef: {
		ref: React.ForwardedRef<{
			refreshPerm: () => void;
			refreshUserPerm: () => void;
		}>;
	};
}) {
	const router = useRouter();
	const id = React.useMemo(() => router.query.id as string, [router]);

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [modalVisible, setModalVisible] = React.useState(false);
	const [formType, setFormType] = React.useState<'client' | 'password'>('client');

	const {
		data: objPermData,
		isLoading: permLoading,
		refetch: objPermRefetch,
	} = useGetUserObjectPermissionsQuery({
		modelName: 'clients',
		objectId: id,
	});

	// check if the user has edit user permission
	const { data: objUserPermData, refetch: objUserPermRefetch } = useGetUserObjectPermissionsQuery(
		{
			modelName: 'users',
			objectId: data?.contact.id || '',
		},
		{
			enabled: data && !!data.contact.id,
		}
	);

	React.useImperativeHandle(
		forwardedRef.ref,
		() => ({
			refreshPerm: objPermRefetch,
			refreshUserPerm: objUserPermRefetch,
		}),
		[objPermRefetch, objUserPermRefetch]
	);

	const [canEditUser, canViewUser] = React.useMemo(() => {
		let canEdit = false;
		let canView = false;

		// Check model permissions
		if (authData && (authData.isAdmin || authData.isSuperUser)) {
			canEdit =
				!!authData.isSuperUser ||
				(!!authData.isAdmin && hasModelPermission(authData.permissions, [permissions.user.EDIT]));
		}
		if (authData && (authData.isAdmin || authData.isSuperUser)) {
			canView =
				!!authData.isSuperUser ||
				(!!authData.isAdmin && hasModelPermission(authData.permissions, [permissions.user.VIEW]));
		}

		// If the user doesn't have model edit permissions, then check obj edit permission
		if (!canEdit && objUserPermData) canEdit = objUserPermData.edit;
		if (!canView && objUserPermData) canView = objUserPermData.view;

		return [canEdit, canView];
	}, [authData, objUserPermData]);

	const { deleteClient, isLoading: delLoading } = useDeleteClientMutation({
		onSuccess() {
			router.back();
		},
		onError({ message }) {
			showAlert({ type: 'success', message });
		},
	});

	const { activate, isLoading: loading } = useActivateUserMutation();

	const actions: ButtonType[] = React.useMemo(() => {
		if (!data || !authData) return [];
		const buttons: ButtonType[] = [];
		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.client.EDIT]) ||
			(!permLoading && objPermData && objPermData.edit);
		const canDelete =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.client.DELETE]) ||
			(!permLoading && objPermData && objPermData.delete);
		const canViewObjectPermissions =
			authData.isSuperUser ||
			(authData.isAdmin &&
				hasModelPermission(authData.permissions, [permissions.permissionobject.VIEW]));

		if (canViewUser)
			buttons.push({
				bg: 'bg-green-600 hover:bg-green-500',
				iconLeft: FaUser,
				link: USER_PAGE_URL(data.contact.id),
				title: 'Contact Information',
			});
		if (canEdit)
			buttons.push({
				onClick: () => {
					formType !== 'client' && setFormType('client');
					setModalVisible(true);
				},
				disabled: loading || delLoading,
				iconLeft: FaUserEdit,
				title: 'Edit Client',
			});
		if (canEditUser)
			buttons.push(
				{
					bg: 'bg-yellow-600 hover:bg-yellow-500',
					iconLeft: FaLock,
					disabled: loading || delLoading,
					onClick: () => {
						formType !== 'password' && setFormType('password');
						setModalVisible(true);
					},
					title: 'Change Password',
				},
				{
					bg: data.contact.isActive
						? 'bg-gray-500 hover:bg-gray-600'
						: 'bg-green-500 hover:bg-green-600',
					disabled: loading || delLoading,
					onClick: () =>
						data?.contact
							? activate([data.contact.email], data.contact.isActive ? 'deactivate' : 'activate')
							: () => {},
					iconLeft: data.contact.isActive ? FaUserSlash : FaUserCheck,
					title: data.contact.isActive
						? loading
							? 'Deactivating...'
							: 'Deactivate Client'
						: loading
						? 'Activating...'
						: 'Activate Client',
				}
			);
		if (canDelete)
			buttons.push({
				bg: 'bg-red-600 hover:bg-red-500',
				iconLeft: FaTrash,
				disabled: loading || delLoading,
				onClick: () => deleteClient(data.id),
				title: delLoading ? 'Deleting Client...' : 'Delete Client',
			});
		if (canViewObjectPermissions)
			buttons.push({
				bg: 'bg-gray-600 hover:bg-gray-500',
				iconLeft: FaUserShield,
				link: CLIENT_OBJECT_PERMISSIONS_PAGE_URL(id),
				title: 'View Record Permissions',
			});
		return buttons;
	}, [
		activate,
		authData,
		data,
		canEditUser,
		canViewUser,
		deleteClient,
		delLoading,
		formType,
		permLoading,
		objPermData,
		id,
		loading,
	]);

	return (
		<>
			<div className="flex flex-wrap p-4 w-full md:h-1/2 md:mt-auto md:pb-0 md:w-2/3">
				{actions.map((action, index) => (
					<div key={index} className="my-2 w-full sm:my-4 sm:px-4 sm:w-1/2">
						<Button
							{...action}
							renderLinkAs={({ children, link, ...props }) => (
								<Link href={link}>
									<a {...props}>{children}</a>
								</Link>
							)}
						/>
					</div>
				))}
			</div>
			{data && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						formType === 'client' && data !== undefined ? (
							<UpdateForm
								onSuccess={() => {
									showAlert({
										type: 'success',
										message: 'Client was updated successfully!',
									});
									setModalVisible(false);
								}}
								client={data}
							/>
						) : formType === 'password' && data ? (
							<ChangePasswordForm
								onSuccess={() => {
									setModalVisible(false);
									showAlert({
										type: 'success',
										message: 'Password changed successfully!',
									});
								}}
								email={data.contact.email}
							/>
						) : (
							<></>
						)
					}
					description={
						formType === 'password'
							? 'Fill the form to change client password'
							: 'Fill in the form to update client information'
					}
					keepVisible
					title={formType === 'password' ? 'Change Client Password' : 'Update Client Information'}
					visible={modalVisible}
				/>
			)}
		</>
	);
}

export default DetailActions;
