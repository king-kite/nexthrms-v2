import { Button, ButtonType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import {
	FaLock,
	FaUser,
	FaUserEdit,
	FaUserCheck,
	FaUserShield,
	FaUserSlash,
	FaTrash,
} from 'react-icons/fa';

import ChangePasswordForm from './change-password-form';
import EmployeeForm from './employee-form';
import Modal from '../../common/modal';
import permissions from '../../../config/permissions';
import { EMPLOYEE_OBJECT_PERMISSIONS_PAGE_URL, USER_PAGE_URL } from '../../../config/routes';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import { useDeleteEmployeeMutation } from '../../../store/queries/employees';
import { useGetUserObjectPermissionsQuery } from '../../../store/queries/permissions';
import { useActivateUserMutation } from '../../../store/queries/users';
import { EmployeeType, UserObjPermType } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';

function DetailActions({
	data,
	forwardedRef,
}: {
	data?: EmployeeType;
	forwardedRef: {
		ref: React.ForwardedRef<{
			refreshPerm: () => void;
		}>;
	};
}) {
	const router = useRouter();
	const id = React.useMemo(() => router.query.id as string, [router]);

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [formType, setFormType] = React.useState<'employee' | 'password'>('employee');
	const [modalVisible, setModalVisible] = React.useState(false);

	const {
		data: objPermData,
		isLoading: permLoading,
		refetch: objPermRefetch,
	} = useGetUserObjectPermissionsQuery({
		modelName: 'employees',
		objectId: id,
	});

	// check if the user has edit user permission
	const { data: objUserPermData, refetch: objUserPermRefetch } = useGetUserObjectPermissionsQuery(
		{
			modelName: 'users',
			objectId: data?.user.id || '',
		},
		{
			enabled: data && !!data.user.id,
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

	const { deleteEmployee, isLoading: delLoading } = useDeleteEmployeeMutation({
		onSuccess() {
			router.back();
			showAlert({
				type: 'success',
				message: 'Employee was deleted successfully!',
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

	const { activate, isLoading: actLoading } = useActivateUserMutation({
		label: 'employee',
		onError(err) {
			showAlert({
				type: 'danger',
				message: err.message,
			});
		},
	});

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

	const actions: ButtonType[] = React.useMemo(() => {
		if (!data || !authData) return [];
		const buttons: ButtonType[] = [];
		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.employee.EDIT]) ||
			(!permLoading && objPermData && objPermData.edit);
		const canDelete =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.employee.DELETE]) ||
			(!permLoading && objPermData && objPermData.delete);
		const canViewObjectPermissions =
			authData.isSuperUser ||
			(authData.isAdmin &&
				hasModelPermission(authData.permissions, [permissions.permissionobject.VIEW]));

		if (canViewUser)
			buttons.push({
				bg: 'bg-green-600 hover:bg-green-500',
				iconLeft: FaUser,
				link: USER_PAGE_URL(data.user.id),
				title: 'User Information',
			});
		if (canEdit)
			buttons.push({
				onClick: () => {
					formType !== 'employee' && setFormType('employee');
					setModalVisible(true);
				},
				disabled: actLoading || delLoading,
				iconLeft: FaUserEdit,
				title: 'Edit Employee',
			});
		if (canEditUser)
			buttons.push(
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
					bg: data.user.isActive
						? 'bg-gray-500 hover:bg-gray-600'
						: 'bg-green-500 hover:bg-green-600',
					disabled: actLoading || delLoading,
					onClick: () =>
						data?.user.email && data.user.isActive !== undefined
							? activate([data.user.email], data.user.isActive ? 'deactivate' : 'activate')
							: undefined,
					iconLeft: data.user.isActive ? FaUserSlash : FaUserCheck,
					title: data.user.isActive
						? actLoading
							? 'Deactivating Employee...'
							: 'Deactivate Employee'
						: actLoading
						? 'Activating Employee...'
						: 'Activate Employee',
				}
			);
		if (canDelete)
			buttons.push({
				bg: 'bg-red-600 hover:bg-red-500',
				iconLeft: FaTrash,
				disabled: actLoading || delLoading,
				onClick: () => deleteEmployee(data.id),
				title: delLoading ? 'Deleting Employee...' : 'Delete Employee',
			});
		if (canViewObjectPermissions)
			buttons.push({
				bg: 'bg-gray-600 hover:bg-gray-500',
				iconLeft: FaUserShield,
				link: EMPLOYEE_OBJECT_PERMISSIONS_PAGE_URL(id),
				title: 'View Record Permissions',
			});
		return buttons;
	}, [
		activate,
		authData,
		data,
		deleteEmployee,
		canEditUser,
		canViewUser,
		actLoading,
		delLoading,
		formType,
		permLoading,
		objPermData,
		id,
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
						formType === 'employee' ? (
							<EmployeeForm
								employee={data}
								onSuccess={() => {
									setModalVisible(false);
									showAlert({
										type: 'success',
										message: 'Employee updated successfully!',
									});
								}}
							/>
						) : formType === 'password' ? (
							<ChangePasswordForm
								email={data.user?.email}
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
							? 'Fill the form to change employee password'
							: 'Fill in the form to update employee information'
					}
					keepVisible
					title={
						formType === 'password' ? 'Change Employee Password' : 'Update Employee Information'
					}
					visible={modalVisible}
				/>
			)}
		</>
	);
}

export default DetailActions;
