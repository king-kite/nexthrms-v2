import { Button, ButtonType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import {
	FaEye,
	FaLock,
	FaUserEdit,
	FaUserCheck,
	FaUserShield,
	FaUserSlash,
	FaTrash,
} from 'react-icons/fa';

import UserForm from './user-form';
import Modal from '../../common/modal';
import ChangePasswordForm from '../../employees/detail/change-password-form';
import permissions from '../../../config/permissions';
import {
	CLIENT_PAGE_URL,
	EMPLOYEE_PAGE_URL,
	USER_OBJECT_PERMISSIONS_PAGE_URL,
} from '../../../config/routes';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import { useGetUserObjectPermissionsQuery } from '../../../store/queries/permissions';
import {
	useActivateUserMutation,
	useDeleteUserMutation,
} from '../../../store/queries/users';
import { UserType, UserObjPermType } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';

function DetailActions({
	data,
	objPerm,
	objClientPerm,
	objEmployeePerm,
	forwardedRef,
}: {
	data?: UserType;
	objPerm: UserObjPermType;
	objClientPerm: UserObjPermType;
	objEmployeePerm: UserObjPermType;
	forwardedRef: {
		ref: React.ForwardedRef<{
			canEdit: boolean;
			refreshPerm: () => void;
			refreshClientPerm: () => void;
			refreshEmployeePerm: () => void;
		} | null>;
	};
}) {
	const router = useRouter();
	const id = React.useMemo(() => router.query.id as string, [router]);

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [formType, setFormType] = React.useState<'user' | 'password'>('user');
	const [modalVisible, setModalVisible] = React.useState(false);

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

	const [canEdit, canDelete] = React.useMemo(() => {
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

	React.useImperativeHandle(
		forwardedRef.ref,
		() => ({
			canEdit,
			refreshPerm: objPermRefetch,
			refreshClientPerm: objClientPermRefetch,
			refreshEmployeePerm: objEmployeePermRefetch,
		}),
		[canEdit, objPermRefetch, objClientPermRefetch, objEmployeePermRefetch]
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

	const canViewClient = React.useMemo(() => {
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

	const canViewEmployee = React.useMemo(() => {
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

	const { activate, isLoading: actLoading } = useActivateUserMutation({
		label: 'user',
		onError(err) {
			showAlert({
				type: 'danger',
				message: err.message,
			});
		},
	});

	const actions = React.useMemo(() => {
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
			)}
		</>
	);
}

export default DetailActions;
