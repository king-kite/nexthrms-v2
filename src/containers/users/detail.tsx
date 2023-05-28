import { ButtonType, TabNavigator } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import {
	FaEye,
	FaLock,
	FaUserEdit,
	FaUserCheck,
	FaUserShield,
	FaUserSlash,
	FaTrash,
} from 'react-icons/fa';

import { Container, InfoTopBar, Modal } from '../../components/common';
import { ChangePasswordForm } from '../../components/employees';
import {
	Groups,
	Permissions,
	UserForm,
	UserInfo,
} from '../../components/Users';
import {
	permissions,
	CLIENT_PAGE_URL,
	DEFAULT_IMAGE,
	EMPLOYEE_PAGE_URL,
	USER_OBJECT_PERMISSIONS_PAGE_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useGetUserQuery,
	useActivateUserMutation,
	useDeleteUserMutation,
	useGetUserObjectPermissionsQuery,
} from '../../store/queries';
import {
	PermissionType,
	UserType,
	UserObjPermType,
	UserGroupType,
} from '../../types';
import { hasModelPermission, toCapitalize } from '../../utils';

const User = ({
	groups,
	permissions: userPermissions,
	objPerm,
	objClientPerm,
	objEmployeePerm,
	user,
}: {
	groups: {
		total: number;
		result: UserGroupType[];
	};
	permissions: {
		total: number;
		result: PermissionType[];
	};
	objPerm: UserObjPermType;
	objClientPerm: UserObjPermType;
	objEmployeePerm: UserObjPermType;
	user: UserType;
}) => {
	const router = useRouter();
	const id = router.query.id as string;
	const { data, error, isLoading, isFetching, refetch } = useGetUserQuery(
		{
			id,
		},
		{
			initialData() {
				return user;
			},
		}
	);

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [formType, setFormType] = useState<'user' | 'password'>('user');
	const [modalVisible, setModalVisible] = useState(false);

	// Get user's object level permissions for the users table
	const { data: objPermData, refetch: objPermRefetch } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'users',
				objectId: id,
			},
			{
				initialData() {
					return objPerm;
				},
			}
		);

	// Get user's object level permissions for the employees table
	const { data: objClientPermData, refetch: objClientPermRefetch } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'clients',
				objectId: id,
				permission: 'VIEW',
			},
			{
				enabled: data && !!data.client,
				initialData() {
					return objClientPerm;
				},
			}
		);

	// Get user's object level permissions for the users table
	const { data: objEmployeePermData, refetch: objEmployeePermRefetch } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'employees',
				objectId: id,
				permission: 'VIEW',
			},
			{
				enabled: data && !!data.employee,
				initialData() {
					return objEmployeePerm;
				},
			}
		);

	const { deleteUser, isLoading: delLoading } = useDeleteUserMutation({
		onSuccess() {
			router.back();
			showAlert({
				type: 'success',
				message: 'User was deleted successfully!',
			});
		},
		onError(err) {
			showAlert({
				type: 'danger',
				message: err.message,
			});
			setModalVisible(false);
		},
	});

	const canViewClient = useMemo(() => {
		let canView = false;

		// Check Model Permission
		if (authData && (authData.isAdmin || authData.isSuperUser)) {
			canView =
				!!authData.isSuperUser ||
				(!!authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.client.VIEW]));
		}

		// If the user doesn't have model edit permissions, then check obj edit permission
		if (!canView && objClientPermData) canView = objClientPermData.view;

		return canView;
	}, [authData, objClientPermData]);

	const canViewEmployee = useMemo(() => {
		let canView = false;

		// Check Model Permission
		if (authData && (authData.isAdmin || authData.isSuperUser)) {
			canView =
				!!authData.isSuperUser ||
				(!!authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.employee.VIEW,
					]));
		}

		// If the user doesn't have model edit permissions, then check obj edit permission
		if (!canView && objEmployeePermData) canView = objEmployeePermData.view;

		return canView;
	}, [authData, objEmployeePermData]);

	const [canEdit, canDelete] = useMemo(() => {
		if (!authData) return [false, false];
		if (!authData.isSuperUser && !authData.isAdmin) return [false, false];

		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.user.EDIT]) ||
			(objPermData && objPermData.edit);

		const canDelete =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.user.DELETE]) ||
			(objPermData && objPermData.delete);
		return [canEdit || false, canDelete || false];
	}, [authData, objPermData]);

	const { activate, isLoading: actLoading } = useActivateUserMutation({
		label: 'user',
		onError(err) {
			showAlert({
				type: 'danger',
				message: err.message,
			});
		},
	});

	const actions = useMemo(() => {
		let action: ButtonType[] = [];
		if (!authData) return action;
		const canViewObjectPermissions =
			authData.isSuperUser ||
			(authData.isAdmin &&
				hasModelPermission(authData.permissions, [
					permissions.permissionobject.VIEW,
				]));

		if (canEdit)
			action.push(
				{
					onClick: () => {
						formType !== 'user' && setFormType('user');
						setModalVisible(true);
					},
					disabled: actLoading || delLoading,
					iconLeft: FaUserEdit,
					title: 'Edit User',
				},
				{
					bg: 'bg-yellow-600 hover:bg-yellow-500',
					iconLeft: FaLock,
					disabled: actLoading || delLoading,
					onClick: () => {
						formType !== 'password' && setFormType('password');
						setModalVisible(true);
					},
					title: 'Change Password',
				},
				{
					bg: data?.isActive
						? 'bg-gray-500 hover:bg-gray-600'
						: 'bg-green-500 hover:bg-green-600',
					disabled: actLoading || delLoading,
					onClick: () =>
						data?.email && data?.isActive !== undefined
							? activate(
									[data.email],
									data.isActive ? 'deactivate' : 'activate'
							  )
							: undefined,
					iconLeft: data?.isActive ? FaUserSlash : FaUserCheck,
					title: data?.isActive
						? actLoading
							? 'Deactivating User...'
							: 'Deactivate User'
						: actLoading
						? 'Activating User...'
						: 'Activate User',
				}
			);
		if (canDelete)
			action.push({
				bg: 'bg-red-600 hover:bg-red-500',
				iconLeft: FaTrash,
				disabled: actLoading || delLoading,
				onClick: data?.id ? () => deleteUser(data.id) : undefined,
				title: delLoading ? 'Deleting User...' : 'Delete User',
			});
		if (canViewClient && data?.client) {
			action = [
				{
					bg: 'bg-green-600 hover:bg-green-500',
					iconLeft: FaEye,
					link: CLIENT_PAGE_URL(data.client.id),
					title: 'View Client Data',
				},
				...action,
			];
		}
		if (canViewEmployee && data?.employee) {
			action = [
				{
					bg: 'bg-purple-600 hover:bg-purple-500',
					iconLeft: FaEye,
					link: EMPLOYEE_PAGE_URL(data.employee.id),
					title: 'View Employee Data',
				},
				...action,
			];
		}
		if (canViewObjectPermissions && data?.id)
			action.push({
				bg: 'bg-gray-600 hover:bg-gray-500',
				iconLeft: FaUserShield,
				link: USER_OBJECT_PERMISSIONS_PAGE_URL(data.id),
				title: 'View Record Permissions',
			});
		return action;
	}, [
		actLoading,
		activate,
		authData,
		canDelete,
		canEdit,
		canViewClient,
		canViewEmployee,
		data,
		delLoading,
		deleteUser,
		formType,
	]);

	return (
		<Container
			heading="User Information"
			icon
			error={
				error
					? {
							statusCode:
								(error as any).response?.status || (error as any).status || 500,
							title:
								(error as any)?.response?.data?.message ||
								(error as any).message,
					  }
					: undefined
			}
			refresh={{
				loading: isFetching,
				onClick: () => {
					refetch();
					objPermRefetch();
					objClientPermRefetch();
					objEmployeePermRefetch();
				},
			}}
			loading={isLoading}
			title={data ? data.firstName + ' ' + data.lastName : undefined}
		>
			{data && (
				<>
					<InfoTopBar
						email={data.email}
						full_name={toCapitalize(data.firstName + ' ' + data.lastName)}
						image={data.profile?.image?.url || DEFAULT_IMAGE}
						actions={actions}
					/>

					<TabNavigator
						screens={[
							{
								component: <UserInfo user={data} />,
								description: "View all user's details and information",
								title: 'User Information',
							},
							{
								title: 'Permissions',
								description: 'View all permissions for this user.',
								component: (
									<Permissions
										canEditUser={canEdit}
										permissions={userPermissions}
										hideOtherModals={() => setModalVisible(false)}
									/>
								),
							},
							{
								title: 'Groups',
								description: 'View all groups associated with this user.',
								component: (
									<Groups
										canEditUser={canEdit}
										groups={groups}
										hideOtherModals={() => setModalVisible(false)}
									/>
								),
							},
						]}
					/>

					<Modal
						close={() => setModalVisible(false)}
						component={
							formType === 'user' ? (
								<UserForm
									user={data}
									onSuccess={() => {
										setModalVisible(false);
										showAlert({
											type: 'success',
											message: 'User updated successfully!',
										});
									}}
								/>
							) : formType === 'password' ? (
								<ChangePasswordForm
									email={data.email}
									onSuccess={() => {
										setModalVisible(false);
										showAlert({
											type: 'success',
											message: 'Password change successfully!',
										});
									}}
								/>
							) : (
								<></>
							)
						}
						description={
							formType === 'password'
								? 'Fill the form to change user password'
								: 'Fill in the form to update user information'
						}
						keepVisible
						title={
							formType === 'password'
								? 'Change User Password'
								: 'Update User Information'
						}
						visible={modalVisible}
					/>
				</>
			)}
		</Container>
	);
};

export default User;
