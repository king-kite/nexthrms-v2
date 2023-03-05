import { ButtonType, InfoComp } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import {
	FaCheckCircle,
	FaTimesCircle,
	FaUser,
	FaUserCheck,
	FaUserEdit,
	FaUserShield,
	FaUserSlash,
	FaLock,
	FaTrash,
} from 'react-icons/fa';

import { Container, InfoTopBar, Modal } from '../../components/common';
import { UpdateForm } from '../../components/Clients';
import { ChangePasswordForm } from '../../components/Employees';
import {
	permissions,
	CLIENT_OBJECT_PERMISSIONS_PAGE_URL,
	DEFAULT_IMAGE,
	USER_PAGE_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useActivateUserMutation,
	useDeleteClientMutation,
	useGetClientQuery,
	useGetUserObjectPermissionsQuery,
} from '../../store/queries';
import { ClientType, UserObjPermType } from '../../types';
import { hasModelPermission, getDate, toCapitalize } from '../../utils';

const ClientDetail = ({
	client,
	objPerm,
	objUserPerm,
}: {
	client: ClientType;
	objPerm: UserObjPermType;
	objUserPerm: UserObjPermType;
}) => {
	const router = useRouter();

	const id = router.query.id as string;

	const [modalVisible, setModalVisible] = useState(false);
	const [formType, setFormType] = useState<'client' | 'password'>('client');

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { data, error, isLoading, isFetching, refetch } = useGetClientQuery(
		{ id },
		{
			initialData() {
				return client;
			},
		}
	);

	const {
		data: objPermData,
		isLoading: permLoading,
		refetch: objPermRefetch,
	} = useGetUserObjectPermissionsQuery(
		{
			modelName: 'clients',
			objectId: id,
		},
		{
			initialData() {
				return objPerm;
			},
		}
	);

	// check if the user has edit user permission
	const { data: objUserPermData, refetch: objUserPermRefetch } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'users',
				objectId: data?.contact.id || '',
			},
			{
				enabled: data && !!data.contact.id,
				initialData() {
					return objUserPerm;
				},
			}
		);

	const [canEditUser, canViewUser] = useMemo(() => {
		let canEdit = false;
		let canView = false;

		// Check model permissions
		if (authData && (authData.isAdmin || authData.isSuperUser)) {
			canEdit =
				!!authData.isSuperUser ||
				(!!authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.user.EDIT]));
		}
		if (authData && (authData.isAdmin || authData.isSuperUser)) {
			canView =
				!!authData.isSuperUser ||
				(!!authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.user.VIEW]));
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

	const actions: ButtonType[] = useMemo(() => {
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
				hasModelPermission(authData.permissions, [
					permissions.permissionobject.VIEW,
				]));

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
							? activate(
									[data.contact.email],
									data.contact.isActive ? 'deactivate' : 'activate'
							  )
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
		<Container
			heading="Client Information"
			error={
				error
					? {
							statusCode: (error as any).status || 500,
							title: (error as any).message,
					  }
					: undefined
			}
			refresh={{
				onClick: () => {
					refetch();
					objPermRefetch();
					objUserPermRefetch();
				},
				loading: isFetching,
			}}
			title={data ? data.company.toUpperCase() : undefined}
			icon
			loading={isLoading}
		>
			{data && (
				<>
					<InfoTopBar
						email={data?.contact.email}
						full_name={toCapitalize(
							`${data?.contact.firstName} ${data?.contact.lastName}`
						)}
						image={data?.contact.profile?.image || DEFAULT_IMAGE}
						actions={actions}
					/>

					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'Company',
									value: data?.company?.toUpperCase() || '',
								},
								{ title: 'Position', value: data?.position || '' },
								{
									title: 'Status',
									type: 'badge',
									value: data.contact.isActive ? 'active' : 'inactive',
									options: {
										bg: data.contact.isActive ? 'success' : 'error',
										Icon: data.contact.isActive ? FaCheckCircle : FaTimesCircle,
									},
								},
							]}
							title="client information"
						/>
					</div>
					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'First Name',
									value: toCapitalize(data?.contact.firstName) || '',
								},
								{
									title: 'Last Name',
									value: toCapitalize(data?.contact.lastName) || '',
								},
								{ title: 'E-mail', value: data?.contact.email || '' },
								{
									title: 'Birthday',
									value: data?.contact.profile?.dob
										? (getDate(data.contact.profile.dob, true) as string)
										: '',
								},
								{
									title: 'Gender',
									value: toCapitalize(data?.contact?.profile?.gender) || '',
								},
							]}
							title="contact person information"
						/>
					</div>
					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'Phone',
									value: data?.contact.profile?.phone || '',
								},
								{
									title: 'Address',
									value: data?.contact.profile?.address || '',
								},
								{
									title: 'State',
									value: toCapitalize(data?.contact.profile?.state || ''),
								},
								{
									title: 'City',
									value: toCapitalize(data?.contact.profile?.city || ''),
								},
							]}
							title="contact & support information"
						/>
					</div>
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
						title={
							formType === 'password'
								? 'Change Client Password'
								: 'Update Client Information'
						}
						visible={modalVisible}
					/>
				</>
			)}
		</Container>
	);
};

export default ClientDetail;
